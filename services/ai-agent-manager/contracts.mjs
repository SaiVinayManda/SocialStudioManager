import {demand,exact,uuid,hash,canonical} from '../studio-runtime/contracts.mjs';
import {SCHEMA_VERSION,outputSchemas} from './schemas.mjs';
import {rejectCredentialMaterial} from './safety.mjs';

export const DEFAULT_PROVIDERS=Object.freeze(['codex','agy','9router']);
export const TERMINAL=new Set(['completed','failed','cancelled','manual_review']);
export const FALLBACK_ERRORS=new Set(['unavailable','unsupported','quota_exhausted','rate_limited','provider_outage','transport_failure','timeout','invalid_output']);
export const NON_RETRYABLE=new Set(['authorization','credential_policy','unsafe_request','cancelled','budget_exhausted','uncertain_side_effect','cleanup_failed']);
export function validateRequest(body){
  exact(body,['task_id','idempotency_key','content_job_id','brand_id','task_type','input','output_schema_version','provider_policy','maximum_cost','timeout_ms','retry_policy','content_version'],['idempotency_key','content_job_id','brand_id','task_type','input','output_schema_version','provider_policy','maximum_cost','timeout_ms','retry_policy']);
  demand(uuid(body.content_job_id)&&uuid(body.brand_id)&&(!body.task_id||uuid(body.task_id)),'INVALID_AI_IDENTITY');
  demand(typeof body.idempotency_key==='string'&&/^[A-Za-z0-9:_-]{8,180}$/.test(body.idempotency_key),'INVALID_IDEMPOTENCY_KEY');
  demand(body.output_schema_version===SCHEMA_VERSION&&Object.hasOwn(outputSchemas,body.task_type),'UNSUPPORTED_AI_SCHEMA');
  exact(body.input,['topic','script','genre','audience','duration_seconds','language','tone','hook_style','platforms','facts','instructions','scene_count']);
  demand(Buffer.byteLength(JSON.stringify(body.input))<=20000,'AI_INPUT_TOO_LARGE');
  rejectCredentialMaterial(body.input);
  for(const k of ['topic','script','genre','audience','language','tone','hook_style','instructions'])if(body.input[k]!==undefined)demand(typeof body.input[k]==='string'&&body.input[k].length<=12000,'INVALID_AI_INPUT');
  demand(Boolean(body.input.topic?.trim()||body.input.script?.trim()),'AI_TOPIC_OR_SCRIPT_REQUIRED');
  if(body.input.duration_seconds!==undefined)demand(Number.isInteger(body.input.duration_seconds)&&body.input.duration_seconds>=10&&body.input.duration_seconds<=300,'INVALID_AI_DURATION');
  if(body.input.scene_count!==undefined)demand(Number.isInteger(body.input.scene_count)&&body.input.scene_count>=1&&body.input.scene_count<=24,'INVALID_SCENE_COUNT');
  if(body.input.platforms!==undefined)demand(Array.isArray(body.input.platforms)&&body.input.platforms.length<=3&&body.input.platforms.every(p=>['youtube','instagram','facebook'].includes(p)),'INVALID_AI_PLATFORMS');
  if(body.input.facts!==undefined)demand(Array.isArray(body.input.facts)&&body.input.facts.length<=30&&body.input.facts.every(f=>typeof f==='string'&&f.length<=1000),'INVALID_AI_FACTS');
  exact(body.provider_policy,['mode','providers'],['mode','providers']);
  demand(['mock','live'].includes(body.provider_policy.mode),'INVALID_AI_MODE');
  const providers=body.provider_policy.providers;
  demand(Array.isArray(providers)&&providers.length>0&&providers.length<=3&&new Set(providers).size===providers.length,'INVALID_PROVIDER_POLICY');
  if(body.provider_policy.mode==='live')demand(JSON.stringify(providers)===JSON.stringify(DEFAULT_PROVIDERS),'PROVIDER_ORDER_APPROVAL_REQUIRED',403);
  else demand(providers.every(p=>['mock','mock-unavailable','mock-invalid'].includes(p)),'INVALID_MOCK_PROVIDER');
  demand(Number.isFinite(body.maximum_cost)&&body.maximum_cost>=0&&body.maximum_cost<=10,'INVALID_AI_BUDGET');
  if(body.provider_policy.mode==='mock')demand(body.maximum_cost===0,'MOCK_COST_MUST_BE_ZERO');
  demand(Number.isInteger(body.timeout_ms)&&body.timeout_ms>=1000&&body.timeout_ms<=300000,'INVALID_AI_TIMEOUT');
  exact(body.retry_policy,['max_attempts_per_provider','initial_backoff_ms'],['max_attempts_per_provider','initial_backoff_ms']);
  demand(Number.isInteger(body.retry_policy.max_attempts_per_provider)&&body.retry_policy.max_attempts_per_provider>=1&&body.retry_policy.max_attempts_per_provider<=2,'INVALID_AI_RETRY_LIMIT');
  demand(Number.isInteger(body.retry_policy.initial_backoff_ms)&&body.retry_policy.initial_backoff_ms>=100&&body.retry_policy.initial_backoff_ms<=10000,'INVALID_AI_BACKOFF');
  if(body.content_version!==undefined)demand(Number.isInteger(body.content_version)&&body.content_version>0,'INVALID_CONTENT_VERSION');
  return {...body,provider_policy:{...body.provider_policy,providers:[...providers]}};
}
export const requestChecksum=body=>hash(canonical(Object.fromEntries(Object.entries(body).filter(([k])=>k!=='task_id'))));
export function categorize(error){
  if(error?.category&&[...FALLBACK_ERRORS,...NON_RETRYABLE].includes(error.category))return error.category;
  if(error?.name==='AbortError')return 'cancelled';
  const code=error?.code??'';
  if(code==='AI_CREDENTIAL_MATERIAL_DENIED')return 'credential_policy';
  if(code==='AI_BRAND_MISMATCH'||code==='INVALID_AI_BRAND_PROFILE'||code==='AI_UNSAFE_ARTIFACT_PATH'||code==='AI_LINK_FORBIDDEN')return 'unsafe_request';
  if(code.startsWith('AI_OUTPUT')||code.startsWith('AI_SCENE')||code==='AI_DURATION_MISMATCH'||code==='AI_STORYBOARD_INCONSISTENT'||code==='AI_NARRATION_INCONSISTENT')return 'invalid_output';
  return 'provider_outage';
}
export class ProviderError extends Error{constructor(category){super(category);this.category=category;this.code=category;}}
export function nextStep(task,attempts,now=Date.now()){
  if(task.cancel_requested)return {action:'terminal',status:'cancelled',category:'cancelled'};
  if(now>=Date.parse(task.deadline_at))return {action:'terminal',status:'failed',category:'timeout'};
  const last=attempts.at(-1);
  if(last&&NON_RETRYABLE.has(last.error_category))return {action:'terminal',status:last.error_category==='uncertain_side_effect'||last.error_category==='cleanup_failed'?'manual_review':'failed',category:last.error_category};
  if(last?.status==='completed')return {action:'terminal',status:'completed'};
  for(const provider of task.provider_policy.providers){
    const used=attempts.filter(a=>a.provider===provider),latest=used.at(-1);
    if(!used.length)return {action:'run',provider};
    if(latest.status==='running')return {action:'wait'};
    if(['unsupported','unavailable','quota_exhausted','invalid_output'].includes(latest.error_category))continue;
    if(!FALLBACK_ERRORS.has(latest.error_category))return {action:'terminal',status:'failed',category:latest.error_category??'provider_outage'};
    if(used.length<task.retry_policy.max_attempts_per_provider){
      const due=Date.parse(latest.completed_at)+Math.min(30000,task.retry_policy.initial_backoff_ms*2**(used.length-1));
      if(now<due)return {action:'wait',until:new Date(due).toISOString()};
      return {action:'run',provider};
    }
  }
  return {action:'terminal',status:'failed',category:'all_providers_unavailable'};
}
