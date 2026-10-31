// One real request only, after explicit approval AND live route verification.
// Reuses the existing AI manager/attempt state machine; no new model architecture.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {demand,uuid} from '../studio-runtime/contracts.mjs';import {verifyE4Policy} from './e4-policy.mjs';import {E4_ID,E4_TOPIC,E4_INSTRUCTIONS} from './e4-route.mjs';
import {CodexAdapter,AgyAdapter,NineRouterAdapter} from './adapters.mjs';import {executeAttempt} from './worker.mjs';import {loadProfile} from './prompts.mjs';import {categorize,ProviderError} from './contracts.mjs';import {validateOutput} from './schemas.mjs';import {finalAttemptNeedsClosure} from './e3-worker.mjs';
import {e4PublicPreflight} from './e4-public-preflight.mjs';
export function validateE4Task(task,jobId){
 demand(task.content_job_id===jobId&&task.brand_id==='10000000-0000-4000-8000-000000000001'&&task.task_type==='production_package'&&task.input.topic===E4_TOPIC&&task.input.duration_seconds===5&&task.input.language==='en'&&task.input.scene_count===1&&task.input.instructions===E4_INSTRUCTIONS&&task.input.script===undefined&&task.maximum_cost===0&&task.retry_policy.max_attempts_per_provider===1,'E4_TASK_SCOPE_CHANGED',403);
}
export function consumeE4Slot(usage,scope,jobId){demand(usage.scope_sha256===scope.scope_sha256&&usage.calls===0,'E4_REQUEST_BUDGET_EXHAUSTED',403);return {...usage,calls:1,job_id:jobId,started_at:new Date().toISOString(),outcome:'unknown'};}
export function persistE4Usage(file,usage){const fd=fs.openSync(file,'w');try{fs.writeFileSync(fd,JSON.stringify(usage,null,2));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
export async function main(){
 demand(process.argv.includes('--approved='+E4_ID),'E4_OWNER_APPROVAL_REQUIRED',403);const root=process.cwd(),verified=verifyE4Policy(root),{grant,router}=verified;
 const dir=path.join(root,'.runtime/ai-brain'),session=JSON.parse(fs.readFileSync(path.join(dir,'e4-session.json'),'utf8'));demand(session.run_id===grant.run_id&&uuid(session.job_id)&&session.scope_sha256===grant.scope_sha256,'E4_APPROVED_JOB_REQUIRED');
 const publicPricing=await e4PublicPreflight();
 let clientToken;if(router.auth_mode==='dedicated_local_bearer'){const file=path.join(root,'.runtime/orchestrator/secrets/e4_router_client_token');demand(grant.allow_dedicated_local_token===true&&!fs.lstatSync(file).isSymbolicLink()&&fs.statSync(file).size<=8192,'E4_LOCAL_AUTH_NOT_APPROVED');clientToken=fs.readFileSync(file,'utf8').trim();}
 const workerKey=fs.readFileSync(path.join(root,'.runtime/orchestrator/secrets/worker_token'),'utf8').trim();
 const call=async(route,body)=>{const r=await fetch('http://127.0.0.1:8780'+route,{method:'POST',headers:{authorization:'Bearer '+workerKey,'content-type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(8000)});const data=await r.json();demand(r.ok,data.error?.code??'E4_INTERNAL_API_FAILED');return data;};
 const lockFile=path.join(dir,'e4-worker.lock'),lock=fs.openSync(lockFile,'wx'),ledgerFile=path.join(dir,'e4-usage-'+grant.run_id+'.json');
 const stop=new AbortController();process.once('SIGINT',()=>stop.abort());process.once('SIGTERM',()=>stop.abort());
 try{
 let usage=fs.existsSync(ledgerFile)?JSON.parse(fs.readFileSync(ledgerFile,'utf8')):{scope_sha256:grant.scope_sha256,calls:0};demand(usage.scope_sha256===grant.scope_sha256&&usage.calls===0,'E4_REQUEST_BUDGET_EXHAUSTED',403);
 const nine=new NineRouterAdapter({policy:router,clientToken}),adapters={codex:new CodexAdapter(),agy:new AgyAdapter(),'9router':nine},deadline=Math.min(Date.now()+180000,Date.parse(grant.expires_at));let finished=false;
 while(!finished&&!stop.signal.aborted&&Date.now()<deadline){
  const item=await call('/ai/worker/claim',{job_id:session.job_id});if(item.idle){await new Promise(r=>setTimeout(r,500));continue;}
  const abort=new AbortController(),onStop=()=>abort.abort(new ProviderError('cancelled'));stop.signal.addEventListener('abort',onStop,{once:true});const timer=setTimeout(()=>abort.abort(new ProviderError('timeout')),Math.max(1,Math.min(60000,Date.parse(item.task.deadline_at)-Date.now(),deadline-Date.now())));
  let beatBusy=false;const beat=setInterval(async()=>{if(beatBusy)return;beatBusy=true;try{const r=await call(`/ai/worker/tasks/${item.task.id}/heartbeat`,{lease_token:item.lease_token});if(r.cancel_requested)abort.abort();}catch{abort.abort();}finally{beatBusy=false;}},5000);
  let completion;try{
   validateE4Task(item.task,session.job_id);
   const result=await executeAttempt(item,{adapters,profile:loadProfile('horror',root),signal:abort.signal,reserve:async cost=>{demand(cost===0,'E4_COST_NOT_APPROVED');await call(`/ai/worker/tasks/${item.task.id}/reserve`,{lease_token:item.lease_token,reserved_cost:0});if(item.provider==='9router'){verifyE4Policy(root);usage={...consumeE4Slot(usage,{scope_sha256:grant.scope_sha256},session.job_id),public_pricing:publicPricing};persistE4Usage(ledgerFile,usage);}}});
   validateOutput('production_package',result.output,item.task.input);demand(result.output.storyboard.scenes.length===1,'E4_ONE_SCENE_REQUIRED');completion={lease_token:item.lease_token,result};
  }catch(e){completion={lease_token:item.lease_token,error_category:e.code?.startsWith('E4_')?'credential_policy':categorize(e)};}
  finally{clearTimeout(timer);clearInterval(beat);stop.signal.removeEventListener('abort',onStop);}
  const done=await call(`/ai/worker/tasks/${item.task.id}/complete`,completion);finished=['completed','failed','cancelled','manual_review'].includes(done.status);if(finalAttemptNeedsClosure(item.task,done)){await call('/ai/worker/claim',{job_id:session.job_id});finished=true;}
  console.log(JSON.stringify({task_id:done.id,provider:item.provider,status:done.status,error_category:done.error_category??null}));
  if(item.provider==='9router'){usage.completed_at=new Date().toISOString();usage.outcome=done.status;usage.response_evidence=nine.lastEvidence??null;persistE4Usage(ledgerFile,usage);}
 }
 demand(finished,'E4_WORKER_DEADLINE_EXCEEDED');
 }finally{fs.closeSync(lock);fs.unlinkSync(lockFile);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(JSON.stringify({service:'e4-ai-worker',error:e.code??'E4_WORKER_STOPPED'}));process.exitCode=1;});
