// Reviewable, HTTP-only E3 executor. Not activated by installation, model names,
// a CLI flag, the old E2 approval, or a locally generated approval proposal.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
import {demand,uuid} from '../studio-runtime/contracts.mjs';import {CodexAdapter,AgyAdapter,NineRouterAdapter} from './adapters.mjs';import {executeAttempt} from './worker.mjs';import {loadProfile} from './prompts.mjs';import {categorize,DEFAULT_PROVIDERS,nextStep} from './contracts.mjs';
export const E3_MODEL='agnes/agnes-2.5-flash';
export const E3_TOPICS=['A mirror whispers your name when nobody is home.','A driver sees someone standing in the middle of an abandoned road.','A phone receives a message from someone who disappeared years ago.'];
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export function finalAttemptNeedsClosure(task,done){return !['completed','failed','cancelled','manual_review'].includes(done.status)&&nextStep({...task,...done,retry_policy:task.retry_policy},done.attempt_history).action==='terminal';}
export function validateE3Grant(grant,route,now=Date.now()){
 demand(grant?.approval_id==='E3-REAL-AI-01'&&grant.owner_approved===true&&typeof grant.owner_approval_reference==='string'&&grant.owner_approval_reference.length>=8,'E3_OWNER_APPROVAL_REQUIRED',403);
 demand(now<Date.parse(grant.expires_at)&&Date.parse(grant.expires_at)<=now+86400000,'E3_APPROVAL_EXPIRY_INVALID');
 demand(grant.maximum_calls===3&&grant.maximum_cost_usd===0&&grant.maximum_output_tokens===4000&&Array.isArray(grant.content_job_ids)&&grant.content_job_ids.length===3&&new Set(grant.content_job_ids).size===3&&grant.content_job_ids.every(uuid),'E3_CALL_SCOPE_INVALID');
 demand(grant.topic_by_job&&grant.content_job_ids.every(id=>E3_TOPICS.includes(grant.topic_by_job[id]))&&new Set(grant.content_job_ids.map(id=>grant.topic_by_job[id])).size===3,'E3_TOPIC_SCOPE_INVALID');
 demand(JSON.stringify(grant.provider_order)===JSON.stringify(DEFAULT_PROVIDERS)&&grant.codex_enabled===false&&grant.agy_enabled===false,'E3_CLI_ISOLATION_REVIEW_REQUIRED');
 demand(route?.endpoint==='http://127.0.0.1:20128/v1/chat/completions'&&route.model===E3_MODEL&&route.auth_mode==='none'&&typeof route.exact_upstream_model==='string'&&route.exact_upstream_model.length>0,'E3_EXACT_ROUTE_REQUIRED');
 demand(route.zero_charge_entitlement_verified===true&&route.paid_fallback===false&&route.automatic_model_substitution===false&&route.maximum_upstream_attempts===1&&route.exhaustion_behavior==='fail_closed'&&Date.parse(route.valid_until)>=Date.parse(grant.expires_at),'E3_ZERO_CHARGE_ROUTE_NOT_VERIFIED',403);
 demand(Array.isArray(route.evidence_references)&&route.evidence_references.length>0,'E3_ROUTE_EVIDENCE_REQUIRED');
 return {endpoint:route.endpoint,model:E3_MODEL,auth_mode:'none',authorized:true,route_verified:true,expires_at:grant.expires_at,reservation_usd:0,max_output_tokens:4000,allowed_response_models:[E3_MODEL,route.exact_upstream_model]};
}
export function verifyE3Policy(root){
 const manifestFile=path.join(root,'docs/E3_AI_SCOPE.json'),grantFile=path.join(root,'.runtime/ai-brain/e3-owner-grant.json'),routeFile=path.join(root,'.runtime/ai-brain/e3-route-evidence.json');
 demand(fs.existsSync(manifestFile),'E3_REVIEW_PACKET_REQUIRED');demand(!fs.lstatSync(manifestFile).isSymbolicLink()&&fs.statSync(manifestFile).size<=131072,'E3_POLICY_FILE_INVALID');const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
 demand(manifest.state==='REVIEW_READY'&&Date.now()<Date.parse(manifest.expires_at),'E3_ROUTE_REVIEW_INCOMPLETE',403);
 demand(fs.existsSync(grantFile)&&fs.existsSync(routeFile),'E3_OWNER_APPROVAL_REQUIRED',403);
 for(const file of [manifestFile,grantFile,routeFile])demand(!fs.lstatSync(file).isSymbolicLink()&&fs.statSync(file).size<=131072,'E3_POLICY_FILE_INVALID');
 const grant=JSON.parse(fs.readFileSync(grantFile,'utf8')),route=JSON.parse(fs.readFileSync(routeFile,'utf8'));
 demand(grant.scope_sha256===digest(manifestFile)&&grant.route_evidence_sha256===digest(routeFile)&&Date.parse(grant.expires_at)<=Date.parse(manifest.expires_at),'E3_REVIEW_DIGEST_CHANGED',403);
 for(const e of manifest.files){demand(/^(services\/(ai-agent-manager|production-adapter|studio-runtime)\/|brands\/[a-z-]+\/config\/|infrastructure\/n8n\/workflows\/|docs\/E3_AI_APPROVAL\.md$)/.test(e.path)&&!e.path.split('/').includes('..'),'E3_UNSAFE_SCOPE');demand(digest(path.join(root,e.path))===e.sha256,'E3_SOURCE_DIGEST_CHANGED',403);}
 return {grant,router:validateE3Grant(grant,route)};
}
export async function main(){
 demand(process.argv.includes('--approved=E3-REAL-AI-01'),'E3_OWNER_APPROVAL_REQUIRED',403);const root=process.cwd(),{grant,router}=verifyE3Policy(root);
 // Only after every source/route/owner check: existing scoped internal key,
 // never a model token, CLI authentication file or new credential.
 const key=fs.readFileSync(path.join(root,'.runtime/orchestrator/secrets/worker_token'),'utf8').trim(),dir=path.join(root,'.runtime/ai-brain'),lockFile=path.join(dir,'e3-worker.lock'),ledgerFile=path.join(dir,'e3-usage.json');
 const lock=fs.openSync(lockFile,'wx'),stop=new AbortController();process.once('SIGINT',()=>stop.abort());process.once('SIGTERM',()=>stop.abort());
 const call=async(route,body)=>{const r=await fetch('http://127.0.0.1:8780'+route,{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(8000)});const data=await r.json();demand(r.ok,data.error?.code??'E3_INTERNAL_API_FAILED');return data;};
 try{
 const usage=fs.existsSync(ledgerFile)?JSON.parse(fs.readFileSync(ledgerFile,'utf8')):{calls:0,content_job_ids:[],scope_sha256:grant.scope_sha256};demand(usage.scope_sha256===grant.scope_sha256,'E3_USAGE_SCOPE_CHANGED');
 const adapters={codex:new CodexAdapter(),agy:new AgyAdapter(),'9router':new NineRouterAdapter({policy:router})};
 const deadline=Math.min(Date.parse(grant.expires_at),Date.now()+300000);
 for(const id of grant.content_job_ids){
  let finished=false;
  while(!finished&&!stop.signal.aborted&&Date.now()<deadline){
   const item=await call('/ai/worker/claim',{job_id:id});if(item.idle){await new Promise(r=>setTimeout(r,500));continue;}
   const task=item.task;let completion;const abort=new AbortController(),onStop=()=>abort.abort();stop.signal.addEventListener('abort',onStop,{once:true});
   const timer=setTimeout(()=>abort.abort(),Math.max(1,Math.min(60000,Date.parse(task.deadline_at)-Date.now(),Date.parse(grant.expires_at)-Date.now())));
   let heartbeatBusy=false;const heartbeat=setInterval(async()=>{if(heartbeatBusy)return;heartbeatBusy=true;try{const state=await call(`/ai/worker/tasks/${task.id}/heartbeat`,{lease_token:item.lease_token});if(state.cancel_requested)abort.abort();}catch{abort.abort();}finally{heartbeatBusy=false;}},5000);
   try{
    demand(task.brand_id==='10000000-0000-4000-8000-000000000001'&&task.task_type==='production_package'&&task.input.topic===grant.topic_by_job[id]&&task.input.duration_seconds===5&&task.input.language==='en'&&!task.input.script&&task.maximum_cost===0&&task.retry_policy.max_attempts_per_provider===1,'E3_TASK_SCOPE_CHANGED',403);
    const result=await executeAttempt(item,{adapters,profile:loadProfile(task.brand_slug,root),signal:abort.signal,reserve:async cost=>{
     demand(cost===0,'E3_COST_NOT_AUTHORIZED');await call(`/ai/worker/tasks/${task.id}/reserve`,{lease_token:item.lease_token,reserved_cost:0});
     if(item.provider==='9router'){demand(usage.calls<3&&!usage.content_job_ids.includes(id),'E3_CALL_BUDGET_EXHAUSTED');usage.calls++;usage.content_job_ids.push(id);usage.last_started_at=new Date().toISOString();fs.writeFileSync(ledgerFile,JSON.stringify(usage,null,2));}
    }});completion={lease_token:item.lease_token,result};
   }catch(error){completion={lease_token:item.lease_token,error_category:error.code?.startsWith('E3_')?'credential_policy':categorize(error)};}
   finally{clearTimeout(timer);clearInterval(heartbeat);stop.signal.removeEventListener('abort',onStop);}
   const done=await call(`/ai/worker/tasks/${task.id}/complete`,completion);console.log(JSON.stringify({task_id:task.id,provider:item.provider,status:done.status,error_category:done.error_category??null}));
   finished=['completed','failed','cancelled','manual_review'].includes(done.status);
   if(finalAttemptNeedsClosure(task,done)){await call('/ai/worker/claim',{job_id:id});finished=true;}
  }
  demand(finished||stop.signal.aborted,'E3_WORKER_DEADLINE_EXCEEDED');
 }
 }finally{fs.closeSync(lock);fs.unlinkSync(lockFile);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(JSON.stringify({service:'e3-ai-worker',error:e.code??'E3_WORKER_STOPPED'}));process.exitCode=1;});
