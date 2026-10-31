// Fixed native HTTP-only AI runner. It never starts an agent CLI without an
// independently verified isolated executor. No arbitrary shell, URL or path from a task.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {demand,uuid} from '../studio-runtime/contracts.mjs';
import {CodexAdapter,AgyAdapter,NineRouterAdapter} from './adapters.mjs';
import {buildPrompt,loadProfile} from './prompts.mjs';
import {ProviderError,categorize} from './contracts.mjs';
import {verifyCanaryApproval} from './approval.mjs';

export async function executeAttempt(item,{adapters,profile,reserve,signal}={}){
  const adapter=adapters[item.provider];if(!adapter)throw new ProviderError('unavailable');
  const readiness=await adapter.preflight(item.task);
  if(readiness.status!=='available')throw new ProviderError(readiness.status==='unsupported'?'unsupported':'unavailable');
  await reserve(readiness.reserved_cost);
  return adapter.execute(item.task,{prompt:buildPrompt(item.task,profile),signal});
}
export async function main(){
  const root=process.cwd(),runtime=path.join(root,'.runtime/ai-brain'),policyFile=path.join(runtime,'operator-policy.json');
  demand(process.argv.includes('--approved=E2-REAL-CANARY-01'),'REAL_CANARY_OPERATOR_APPROVAL_REQUIRED');
  const grant=verifyCanaryApproval(root);
  demand(fs.existsSync(policyFile)&&!fs.lstatSync(policyFile).isSymbolicLink(),'OPERATOR_POLICY_REQUIRED');
  const policy=JSON.parse(fs.readFileSync(policyFile,'utf8'));
  demand(policy.approval_id==='E2-REAL-CANARY-01'&&policy.authorized===true&&Date.now()<Date.parse(policy.expires_at),'VALID_OPERATOR_APPROVAL_REQUIRED');
  demand(policy.maximum_calls===1&&policy.maximum_tasks===1&&policy.maximum_cost_usd===0&&uuid(policy.content_job_id),'INVALID_CANARY_LIMITS');
  demand(policy.router?.model===grant.model&&Date.parse(policy.expires_at)<=Date.parse(grant.expires_at),'CANARY_SCOPE_CHANGED');
  demand(JSON.stringify(policy.router.allowed_response_models)===JSON.stringify(['oc/jev-1.13-free','jev-1.13-free'])&&policy.router.max_output_tokens===4000&&policy.router.reservation_usd===0,'CANARY_SCOPE_CHANGED');
  const session=JSON.parse(fs.readFileSync(path.join(runtime,'canary-session.json'),'utf8'));
  demand(session.approval_id===grant.approval_id&&session.job_id===policy.content_job_id&&session.maximum_tasks===1,'CANARY_SCOPE_CHANGED');
  // The reviewed canary cannot silently activate CLI agents. They are skipped
  // for missing independent isolation; their relative preference is retained.
  demand(policy.codex?.enabled===false&&policy.agy?.enabled===false,'CLI_ISOLATION_REVIEW_REQUIRED');
  const ledgerFile=path.join(runtime,'real-canary-usage.json'),lockFile=path.join(runtime,'real-canary-worker.lock');
  fs.mkdirSync(runtime,{recursive:true});const lock=fs.openSync(lockFile,'wx');
  try{
  const previous=fs.existsSync(ledgerFile)?JSON.parse(fs.readFileSync(ledgerFile,'utf8')):{calls:0};
  demand(previous.calls===0,'CANARY_CALL_BUDGET_ALREADY_CONSUMED');
  // Existing local worker credential only; never exported or given to a model.
  const token=fs.readFileSync(path.join(root,'.runtime/orchestrator/secrets/worker_token'),'utf8').trim();
  const request=async(route,body)=>{const r=await fetch('http://127.0.0.1:8780'+route,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(5000),redirect:'error'});const value=await r.json();demand(r.ok,value.error?.code??'AI_WORKER_API_FAILED');return value;};
  const adapters={codex:new CodexAdapter(),agy:new AgyAdapter(),'9router':new NineRouterAdapter({policy:{...policy.router,authorized:policy.authorized,expires_at:policy.expires_at}})};
  const deadline=Math.min(Date.parse(policy.expires_at),Date.now()+300000);
  let finished=false;
  while(Date.now()<deadline&&!finished){
    const item=await request('/ai/worker/claim',{job_id:policy.content_job_id});if(item.idle){await new Promise(r=>setTimeout(r,500));continue;}
    const task=item.task;demand(task.job_id===policy.content_job_id,'UNAPPROVED_CANARY_TASK');
    demand(task.maximum_cost===0&&task.task_type==='content_package','UNAPPROVED_CANARY_SCOPE');
    demand(task.brand_id==='10000000-0000-4000-8000-000000000001'&&task.input.topic==='A mysterious voicemail from someone who disappeared ten years ago.'&&task.input.duration_seconds===60&&task.input.language==='en'&&task.input.scene_count===6&&task.timeout_ms<=120000,'UNAPPROVED_CANARY_CONTENT');
    const controller=new AbortController(),remaining=Math.max(1,Math.min(deadline,Date.parse(task.deadline_at))-Date.now());
    const timer=setTimeout(()=>controller.abort(new ProviderError('timeout')),remaining);
    let beating=false;const beat=setInterval(async()=>{if(beating)return;beating=true;try{const r=await request(`/ai/worker/tasks/${task.id}/heartbeat`,{lease_token:item.lease_token});if(r.cancel_requested)controller.abort(new ProviderError('cancelled'));}catch{controller.abort(new ProviderError('uncertain_side_effect'));}finally{beating=false;}},5000);
    let completion;
    try{
      const result=await executeAttempt(item,{adapters,profile:loadProfile(task.brand_slug,root),signal:controller.signal,reserve:async cost=>{
        demand(cost===0,'UNAPPROVED_CANARY_COST');await request(`/ai/worker/tasks/${task.id}/reserve`,{lease_token:item.lease_token,reserved_cost:cost});
        if(item.provider==='9router'){
          demand(previous.calls===0,'CANARY_CALL_BUDGET_ALREADY_CONSUMED');
          previous.calls=1;previous.task_id=task.id;previous.content_job_id=task.job_id;previous.started_at=new Date().toISOString();previous.outcome='unknown';
          fs.writeFileSync(ledgerFile,JSON.stringify(previous,null,2));
        }
      }});
      completion={lease_token:item.lease_token,result};
    }catch(e){completion={lease_token:item.lease_token,error_category:categorize(e)};}
    finally{clearTimeout(timer);clearInterval(beat);}
    const completed=await request(`/ai/worker/tasks/${task.id}/complete`,completion);
    console.log(JSON.stringify({task_id:task.id,provider:item.provider,status:completed.status,error_category:completed.error_category,simulated:false}));
    if(['completed','failed','cancelled','manual_review'].includes(completed.status)||previous.calls>0){finished=true;previous.finished_at=new Date().toISOString();previous.outcome=completed.status;fs.writeFileSync(ledgerFile,JSON.stringify(previous,null,2));}
  }}finally{fs.closeSync(lock);fs.unlinkSync(lockFile);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(JSON.stringify({service:'ai-worker',error:e.code??e.category??'AI_WORKER_STOPPED'}));process.exitCode=1;});
