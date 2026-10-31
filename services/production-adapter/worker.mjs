import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import crypto from 'node:crypto';
import {demand} from '../studio-runtime/contracts.mjs';
import {mediaPath,fileHash,validateVideo,runProcess,childEnvironment} from './media.mjs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function renderApproved(job,config,signal){
  const project=job.source_reference.engine_project,grant=config.approved_engine_projects?.[project];demand(grant&&Date.now()<Date.parse(grant.expires_at),'ENGINE_PROJECT_NOT_PREAPPROVED');
  const target=mediaPath(config.workspace,job.source_reference,job.brand_slug,{mustExist:false});demand(!fs.existsSync(target),'EXISTING_OUTPUT_PRESERVED');
  const dir=path.join(config.workspace,'generated-videos',job.brand_slug,project),request=path.join(dir,'adapter-approved-request.json');
  demand(!fs.lstatSync(dir).isSymbolicLink()&&fs.realpathSync(dir)===dir,'UNSAFE_ENGINE_PROJECT');demand(await fileHash(request)===grant.request_sha256,'ENGINE_REQUEST_DIGEST_CHANGED');
  const edit=JSON.parse(fs.readFileSync(path.join(dir,'checkpoint_edit.json'),'utf8')),assets=JSON.parse(fs.readFileSync(path.join(dir,'checkpoint_assets.json'),'utf8'));
  demand(edit.status==='completed'&&assets.status==='completed'&&assets.human_approved===true,'ENGINE_APPROVAL_GATE_REQUIRED');
  const payload=JSON.parse(fs.readFileSync(request,'utf8'));demand(payload.params?.operation==='render'&&payload.params?.edit_decisions?.render_runtime==='ffmpeg'&&path.resolve(payload.params.output_path)===target,'UNAPPROVED_ENGINE_REQUEST');
  function localPaths(value,key=''){
    if(Array.isArray(value)){for(const v of value)localPaths(v,key);return;}
    if(value&&typeof value==='object'){for(const [k,v]of Object.entries(value))localPaths(v,k);return;}
    if(typeof value!=='string')return;
    demand(!/^https?:\/\//i.test(value),'EXTERNAL_ENGINE_OPERATIONS_NOT_APPROVED');
    if(['path','source','output_path'].includes(key)||key.endsWith('_path')){
      demand(path.isAbsolute(value),'ABSOLUTE_LOCAL_ENGINE_PATH_REQUIRED');const p=path.resolve(value);demand(p.startsWith(dir+path.sep),'UNSAFE_ENGINE_ASSET');
      let current=dir;for(const part of path.relative(dir,p).split(path.sep)){current=path.join(current,part);if(current===target&&!fs.existsSync(current))continue;demand(fs.existsSync(current)&&!fs.lstatSync(current).isSymbolicLink(),'UNSAFE_ENGINE_ASSET');}
    }
  }
  localPaths(payload.params);
  const env=childEnvironment(config.workspace);env.PATH=[path.join(config.workspace,'.runtime','openmontage-pilot','venv','Scripts'),config.ffmpeg_bin,env.PATH].join(';');
  const r=await runProcess(path.join(config.workspace,'.runtime','openmontage-pilot','venv','Scripts','python.exe'),['-I',path.join(config.workspace,'services','production-adapter','render-approved.py'),request],{workspace:config.workspace,signal,env,timeoutMs:job.production_settings.timeout_ms??900000});
  demand(!r.cleanup_failed,'PROCESS_TREE_CLEANUP_UNVERIFIED');demand(!r.cancelled&&!r.timed_out&&r.exit_code===0,r.cancelled?'CANCELLED':r.timed_out?'PROCESS_TIMEOUT':'OPENMONTAGE_EXIT_FAILED');return validateVideo(job,config,signal);
}
export async function worker(config,{once=false,signal}={}){
  const endpoint=new URL(config.api_url);demand(endpoint.hostname==='127.0.0.1'&&endpoint.protocol==='http:','LOOPBACK_API_REQUIRED');
  const key=fs.readFileSync(config.worker_token_file,'utf8').trim();demand(key.length>=32,'WORKER_SECRET_REQUIRED');
  const call=async(route,data)=>{const r=await fetch(new URL(route,endpoint),{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify(data??{}),signal:AbortSignal.timeout(8000)});const value=await r.json();if(!r.ok)throw Error(value.error?.code??'API_UNAVAILABLE');return value;};
  while(!signal?.aborted){
    let claimed;try{claimed=await call('/worker/claim',{});}catch{if(once)throw Error('WORKER_API_UNAVAILABLE');await sleep(2000);continue;}
    if(claimed.idle){if(once)return;await sleep(1000);continue;}
    const task=claimed.task,abort=new AbortController(),onStop=()=>abort.abort();signal?.addEventListener('abort',onStop,{once:true});
    let heartbeatBusy=false;const beat=setInterval(async()=>{if(heartbeatBusy)return;heartbeatBusy=true;try{const r=await call(`/worker/tasks/${task.id}/heartbeat`,{lease_token:task.lease_token});if(r.cancel_requested)abort.abort();}catch{abort.abort();}finally{heartbeatBusy=false;}},5000);
    let report,logs='';try{report=task.kind==='render'?await renderApproved(task.job,config,abort.signal):await validateVideo(task.job,config,abort.signal,{verifyOnly:task.kind==='verify_publish'});logs=report.logs??'';delete report.logs;}catch(e){report={passed:false,code:e.code??(e.code==='ENOENT'?'FILE_NOT_FOUND':'MEDIA_VALIDATION_FAILED')};if(e.code==='ENOENT')report.code='FILE_NOT_FOUND';logs=String(e.code??'MEDIA_VALIDATION_FAILED');}
    clearInterval(beat);signal?.removeEventListener('abort',onStop);
    try{await call(`/worker/tasks/${task.id}/complete`,{lease_token:task.lease_token,report,logs:logs.replaceAll(key,'[REDACTED]').slice(-65536)});}catch{console.error(JSON.stringify({task_id:task.id,error:'RESULT_NOT_ACKNOWLEDGED_RECOVERY_REQUIRED'}));}
    demand(report.code!=='PROCESS_TREE_CLEANUP_UNVERIFIED','PROCESS_TREE_CLEANUP_UNVERIFIED');
    if(once)return;
  }
}
async function main(){const p=process.argv.indexOf('--config');demand(p>=0,'CONFIG_REQUIRED');const config=JSON.parse(fs.readFileSync(process.argv[p+1],'utf8'));const stop=new AbortController();process.on('SIGINT',()=>stop.abort());process.on('SIGTERM',()=>stop.abort());await worker(config,{once:process.argv.includes('--once'),signal:stop.signal});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error(JSON.stringify({service:'media-worker',error:'WORKER_STOPPED_NO_SECRET_VALUES_LOGGED'}));process.exitCode=1;});
