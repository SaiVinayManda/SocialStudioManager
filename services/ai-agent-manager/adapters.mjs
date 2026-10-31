import {ProviderError} from './contracts.mjs';
import {outputSchemas} from './schemas.mjs';
import {E4_MODEL,E4_PROVIDER_PREFERENCES} from './e4-route.mjs';
import {canonical} from '../studio-runtime/contracts.mjs';

export function redact(value,secrets=[]){
  let result=String(value);for(const s of secrets)if(s)result=result.replaceAll(s,'[REDACTED]');
  return result.replace(/(Bearer\s+)[^\s"']+/gi,'$1[REDACTED]').replace(/((?:access_token|refresh_token|api_key|password|cookie|authorization)["']?\s*[:=]\s*["']?)[^\s,"'}]+/gi,'$1[REDACTED]').slice(0,8192);
}
export async function boundedJsonResponse(response,{maxBytes=262144}={}){
  const chunks=[];let bytes=0;for await(const chunk of response.body){bytes+=chunk.length;if(bytes>maxBytes)throw new ProviderError('invalid_output');chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ProviderError('invalid_output');}
}
export function httpFailure(status,body={}){
  // Inspect errors in memory only. Persist categories, never raw provider text.
  const code=String(body.error?.code??body.error?.type??'').toLowerCase();
  if(status===401||status===403)return new ProviderError('authorization');
  if(status===402)return new ProviderError('budget_exhausted');
  if(code.includes('quota')||code.includes('insufficient_quota'))return new ProviderError('quota_exhausted');
  if(status===429)return new ProviderError('rate_limited');
  if(status>=500)return new ProviderError('provider_outage');
  return new ProviderError('unsafe_request');
}
export function numericUsage(usage,kind='openai'){
  if(!usage||typeof usage!=='object')return null;
  const names=kind==='codex'?{input_tokens:'input_tokens',output_tokens:'output_tokens',cached_input_tokens:'cached_input_tokens',reasoning_output_tokens:'reasoning_tokens'}:kind==='agy'?{input_tokens:'input_tokens',output_tokens:'output_tokens',thinking_tokens:'reasoning_tokens',cache_read_tokens:'cached_input_tokens',total_tokens:'total_tokens'}:{prompt_tokens:'input_tokens',completion_tokens:'output_tokens',total_tokens:'total_tokens'};
  const result={};for(const [source,target]of Object.entries(names))if(Number.isInteger(usage[source])&&usage[source]>=0)result[target]=usage[source];return Object.keys(result).length?result:null;
}
export function parseCodexJsonl(stdout){
  let output,usage=null,model=null;
  for(const line of stdout.trim().split(/\r?\n/)){
    let event;try{event=JSON.parse(line);}catch{throw new ProviderError('invalid_output');}
    if(['command_execution','file_change','mcp_tool_call','web_search'].includes(event.item?.type))throw new ProviderError('unsafe_request');
    if(event.type==='turn.completed')usage=numericUsage(event.usage,'codex');
    if(event.type==='turn.failed'||event.type==='error'){
      const message=String(event.error?.message??event.message??'').toLowerCase();
      throw new ProviderError(message.includes('quota')?'quota_exhausted':message.includes('rate limit')?'rate_limited':message.includes('auth')?'authorization':'provider_outage');
    }
    if(event.type==='item.completed'&&event.item?.type==='agent_message'){try{output=JSON.parse(event.item.text);}catch{throw new ProviderError('invalid_output');}}
    if(typeof event.model==='string')model=event.model.slice(0,160);
  }
  if(!output)throw new ProviderError('invalid_output');return {output,token_usage:usage,model};
}
export function parseAgyJson(stdout){
  let envelope;try{envelope=JSON.parse(stdout);}catch{throw new ProviderError('invalid_output');}
  if(envelope.status!=='SUCCESS')throw new ProviderError(envelope.status==='AUTHENTICATION_REQUIRED'?'authorization':envelope.status==='TIMEOUT'?'timeout':'provider_outage');
  let output=envelope.structured_output;if(!output){try{output=JSON.parse(envelope.response);}catch{throw new ProviderError('invalid_output');}}
  return {output,token_usage:numericUsage(envelope.usage,'agy'),model:typeof envelope.model==='string'?envelope.model.slice(0,160):null};
}
// A supported CLI is not sufficient isolation. This launch primitive is injected
// only by an operator-reviewed executor enforcing process/filesystem/network
// restrictions outside the model. No owner-home fallback exists.
export class CodexAdapter{
  constructor({executor,policy}={}){this.executor=executor;this.policy=policy;}
  async preflight(){
    if(!this.executor?.isolationVerified)return {status:'unsupported',reason:'external_isolation_not_verified'};
    if(!this.policy?.authorized)throw new ProviderError('credential_policy');
    return {status:'available',simulated:false,reserved_cost:this.policy.reservation_usd};
  }
  async execute(task,{prompt,schemaFile,signal}={}){
    await this.preflight();
    const args=['exec','--json','--ephemeral','--ignore-user-config','--ignore-rules','--skip-git-repo-check','--sandbox','read-only','--disable','shell_tool','--disable','remote_plugin','-c','approval_policy="never"','-c','web_search="disabled"','--output-schema',schemaFile,'-'];
    const result=await this.executor.run({provider:'codex',args,input:prompt.system+'\n'+prompt.user,signal,timeoutMs:Math.max(1,Date.parse(task.deadline_at)-Date.now()),maxOutputBytes:1048576});
    checkProcess(result);return {...parseCodexJsonl(result.stdout),provider:'codex',simulated:false,actual_cost:null,estimated_cost:null,exit_code:result.exit_code};
  }
}
export class AgyAdapter{
  constructor({executor,policy}={}){this.executor=executor;this.policy=policy;}
  async preflight(){
    if(!this.executor?.isolationVerified)return {status:'unsupported',reason:'external_isolation_and_tool_allowlist_not_verified'};
    if(!this.policy?.authorized)throw new ProviderError('credential_policy');
    return {status:'available',simulated:false,reserved_cost:this.policy.reservation_usd};
  }
  async execute(task,{prompt,schemaFile,signal}={}){
    await this.preflight();
    const args=['--print',prompt.system+'\n'+prompt.user,'--output-format','json','--json-schema',schemaFile,'--mode','plan','--sandbox','--disable-slash-commands','--print-timeout',Math.max(1,Math.floor((Date.parse(task.deadline_at)-Date.now())/1000))+'s'];
    const result=await this.executor.run({provider:'agy',args,signal,timeoutMs:Math.max(1,Date.parse(task.deadline_at)-Date.now()),maxOutputBytes:1048576});
    checkProcess(result);return {...parseAgyJson(result.stdout),provider:'agy',simulated:false,actual_cost:null,estimated_cost:null,exit_code:result.exit_code};
  }
}
function checkProcess(result){
  if(result.cleanup_failed)throw new ProviderError('cleanup_failed');
  if(result.cancelled)throw new ProviderError('cancelled');if(result.timed_out)throw new ProviderError('timeout');
  if(result.exit_code!==0)throw new ProviderError(result.error_category??'provider_outage');
}
export class NineRouterAdapter{
  constructor({policy,fetchImpl=fetch,clientToken}={}){this.policy=policy;this.fetch=fetchImpl;this.clientToken=clientToken;}
  async preflight(task){
    const p=this.policy;if(!p?.authorized||Date.now()>=Date.parse(p.expires_at))throw new ProviderError('credential_policy');
    // Model names are not evidence of free service. A reviewed, pinned route and
    // conservative reservation are mandatory; unknown cost fails closed.
    if(p.endpoint!=='http://127.0.0.1:20128/v1/chat/completions'||!p.route_verified||!['none','dedicated_local_bearer'].includes(p.auth_mode)||!p.model||!Number.isFinite(p.reservation_usd)||p.reservation_usd<0)throw new ProviderError('credential_policy');
    if(p.auth_mode==='dedicated_local_bearer'&&(p.approval_id!=='E4-FREE-CANARY-01'||typeof this.clientToken!=='string'||this.clientToken.length<16))throw new ProviderError('credential_policy');
    if(!Number.isInteger(p.max_output_tokens??4000)||(p.max_output_tokens??4000)<1||(p.max_output_tokens??4000)>4000)throw new ProviderError('credential_policy');
    if(p.provider_preferences!==undefined&&(p.model!==E4_MODEL||p.reservation_usd!==0||JSON.stringify(canonical(p.provider_preferences))!==JSON.stringify(canonical(E4_PROVIDER_PREFERENCES))))throw new ProviderError('credential_policy');
    if(task&&Number(task.reserved_cost)+p.reservation_usd>Number(task.maximum_cost))throw new ProviderError('budget_exhausted');
    return {status:'available',simulated:false,reserved_cost:p.reservation_usd};
  }
  async execute(task,{prompt,signal}={}){
    await this.preflight(task);const p=this.policy;
    const body={model:p.model,messages:[{role:'system',content:prompt.system},{role:'user',content:prompt.user}],stream:false,max_tokens:p.max_output_tokens??4000,temperature:0.6,response_format:{type:'json_schema',json_schema:{name:'social_studio_'+task.task_type,strict:true,schema:outputSchemas[task.task_type]}}};
    if(p.provider_preferences!==undefined)Object.assign(body,{provider:structuredClone(E4_PROVIDER_PREFERENCES),reasoning:{enabled:false},plugins:[]});
    let response;try{response=await this.fetch(p.endpoint,{method:'POST',headers:{'content-type':'application/json',...(p.auth_mode==='dedicated_local_bearer'?{authorization:'Bearer '+this.clientToken}:{})},body:JSON.stringify(body),signal,redirect:'error'});}catch(e){if(signal?.aborted)throw new ProviderError(signal.reason?.category??'cancelled');throw new ProviderError('transport_failure');}
    let data;try{data=await boundedJsonResponse(response);}catch(e){if(signal?.aborted)throw new ProviderError(signal.reason?.category??'cancelled');if(!response.ok)throw httpFailure(response.status);throw e;}
    const safeId=v=>typeof v==='string'&&/^[A-Za-z0-9._:/-]{1,180}$/.test(v)?v:null;
    this.lastEvidence={http_status:response.status,response_id:safeId(data.id),response_model:safeId(data.model),reported_provider:safeId(data.provider),token_usage:numericUsage(data.usage),reported_cost_usd:Number.isFinite(data.usage?.cost)?data.usage.cost:null,cost_kind:'Provider-reported metadata, not an independently verified invoice'};
    if(!response.ok)throw httpFailure(response.status,data);
    if(p.provider_preferences!==undefined&&Number(data.usage?.cost??0)>0)throw new ProviderError('credential_policy');
    if(data.model&&p.allowed_response_models&&!p.allowed_response_models.includes(data.model))throw new ProviderError('credential_policy');
    if(data.choices?.length!==1||data.choices[0].finish_reason!=='stop'||data.choices[0].message?.tool_calls?.length)throw new ProviderError('invalid_output');
    let output;try{output=JSON.parse(data.choices[0].message.content);}catch{throw new ProviderError('invalid_output');}
    // Router-reported monetary cost is not necessarily a billed amount. Retain
    // unknown actual cost as null; reservation is an explicitly approved cap.
    return {output,provider:'9router',model:typeof data.model==='string'?data.model:p.model,token_usage:numericUsage(data.usage),actual_cost:null,estimated_cost:p.reservation_usd,simulated:false,exit_code:null};
  }
}
