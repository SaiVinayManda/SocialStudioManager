import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {demand,uuid} from '../studio-runtime/contracts.mjs';import {DEFAULT_PROVIDERS} from './contracts.mjs';import {E4_ID,E4_MODEL,E4_UPSTREAM_MODEL,E4_TOPIC,E4_PROVIDER_PREFERENCES,E4_BRAND} from './e4-route.mjs';
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export function validateE4Route(grant,route,scope,now=Date.now()){
 demand(grant?.approval_id===E4_ID&&grant.owner_approved===true&&typeof grant.owner_approval_reference==='string'&&grant.owner_approval_reference.length>=8,'E4_OWNER_APPROVAL_REQUIRED',403);
 demand(grant.example_only!==true&&route?.example_only!==true,'E4_EXAMPLE_IS_NOT_AUTHORITY',403);
 const approvedAt=Date.parse(grant.approved_at);demand(Number.isFinite(approvedAt)&&approvedAt<=now&&now-approvedAt<=5400000&&Date.parse(grant.expires_at)<=approvedAt+5400000,'E4_COMPLETION_WINDOW_INVALID');
 demand(now<Date.parse(grant.expires_at)&&Date.parse(grant.expires_at)<=Date.parse(scope.expires_at)&&Date.parse(grant.expires_at)<=now+86400000,'E4_APPROVAL_EXPIRED');
 demand(grant.maximum_calls===1&&grant.maximum_cost_usd===0&&grant.maximum_output_tokens===4000&&grant.run_id===scope.run_id&&uuid(grant.run_id),'E4_SCOPE_CHANGED');
 demand(JSON.stringify(grant.provider_order)===JSON.stringify(DEFAULT_PROVIDERS)&&grant.codex_enabled===false&&grant.agy_enabled===false,'E4_CLI_NOT_APPROVED');
 demand(route?.local_model===E4_MODEL&&route.upstream_model===E4_UPSTREAM_MODEL&&route.endpoint==='http://127.0.0.1:20128/v1/chat/completions'&&route.upstream_endpoint==='https://openrouter.ai/api/v1/chat/completions'&&route.upstream_provider==='nvidia','E4_EXACT_ROUTE_REQUIRED');
 demand(route.connection_enabled===true&&route.free_variant_eligible===true&&route.paid_model_substitution===false&&route.extra_upstream_retries===0&&route.provider_preferences_forwarded===true&&route.server_plugins_disabled===true&&route.verified_zero_charge===true&&route.prompt_price===0&&route.completion_price===0,'E4_ROUTE_NOT_VERIFIED',403);
 demand(typeof route.nonsecret_connection_reference==='string'&&route.nonsecret_connection_reference.length>0&&Date.parse(route.valid_until)>=Date.parse(grant.expires_at)&&Array.isArray(route.evidence_references)&&route.evidence_references.length>0,'E4_ROUTE_EVIDENCE_REQUIRED');
 demand(['none','dedicated_local_bearer'].includes(route.auth_mode)&&(route.auth_mode==='none'||grant.allow_dedicated_local_token===true),'E4_LOCAL_AUTH_NOT_APPROVED');
 return {approval_id:E4_ID,authorized:true,route_verified:true,endpoint:route.endpoint,model:E4_MODEL,auth_mode:route.auth_mode,expires_at:grant.expires_at,reservation_usd:0,max_output_tokens:4000,allowed_response_models:[E4_MODEL,E4_UPSTREAM_MODEL],provider_preferences:structuredClone(E4_PROVIDER_PREFERENCES)};
}
export function verifyE4Policy(root,{requireRoute=true}={}){
 const read=relative=>{const file=path.join(root,relative);demand(fs.existsSync(file),'E4_APPROVAL_FILE_REQUIRED',403);demand(!fs.lstatSync(file).isSymbolicLink()&&fs.statSync(file).size<=262144,'E4_POLICY_FILE_INVALID');return JSON.parse(fs.readFileSync(file,'utf8'));};
 const scope=read('docs/E4_AI_SCOPE.json');demand(scope.approval_id===E4_ID&&scope.state==='REVIEWABLE_CONDITIONAL'&&Date.now()<Date.parse(scope.expires_at),'E4_PACKET_EXPIRED');
 const grant=read('.runtime/ai-brain/e4-owner-grant.json');demand(grant.approval_id===E4_ID&&grant.owner_approved===true&&grant.scope_sha256===sha(path.join(root,'docs/E4_AI_SCOPE.json')),'E4_OWNER_APPROVAL_REQUIRED',403);
 for(const e of scope.files){demand(/^(services\/|scripts\/|brands\/|infrastructure\/n8n\/workflows\/|docs\/E4_(AI_APPROVAL\.md|ROUTE_EVIDENCE\.example\.json|OWNER_GRANT\.example\.json)$)/.test(e.path)&&!e.path.split('/').some(p=>['..','.',''].includes(p))&&!e.path.includes('\\')&&!e.path.includes('.runtime'),'E4_UNSAFE_SCOPE');const f=path.join(root,e.path);demand(!fs.lstatSync(f).isSymbolicLink()&&path.relative(fs.realpathSync(root),fs.realpathSync(f)).split(path.sep)[0]!=='..','E4_UNSAFE_SCOPE');demand(sha(f)===e.sha256,'E4_REVIEW_DIGEST_CHANGED',403);}
 demand(Date.now()<Date.parse(grant.expires_at)&&Date.parse(grant.expires_at)<=Date.parse(scope.expires_at),'E4_APPROVAL_EXPIRED');
 if(!requireRoute)return {scope,grant};
 const route=read('.runtime/ai-brain/e4-route-evidence.json');demand(grant.route_evidence_sha256===sha(path.join(root,'.runtime/ai-brain/e4-route-evidence.json')),'E4_ROUTE_DIGEST_CHANGED');return {scope,grant,route,router:validateE4Route(grant,route,scope)};
}
export function e4Body(runId){demand(uuid(runId),'INVALID_E4_RUN');return {source_type:'topic',brand_id:E4_BRAND,topic:E4_TOPIC,duration_seconds:5,idempotency_key:'e4-real:'+runId,provider_mode:'live',acceptance_run_id:runId};}
