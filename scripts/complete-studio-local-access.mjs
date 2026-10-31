// Operator-only completion of E-LOCAL-ACCESS-01. Never grants itself authorization.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn} from 'node:child_process';
import {runProcess,childEnvironment} from '../services/production-adapter/media.mjs';
import {demand} from '../services/studio-runtime/contracts.mjs';
const root=process.cwd(),runtime=path.join(root,'.runtime/orchestrator'),ledger=JSON.parse(fs.readFileSync(path.join(runtime,'approvals.json'),'utf8'));
demand(ledger.local_access===true&&ledger.local_auth===true&&ledger.infra_setup===true&&Date.now()<Date.parse(ledger.expires_utc),'ACTUAL_OWNER_GRANTS_REQUIRED');
for(const [file,digest]of [['docs/ORCHESTRATOR_LOCAL_ACCESS_APPROVAL.md','dcc860db57fcbc0ea2e86b4a0fa6e6bf5d018bd2c00f0564e45c5e5e4465156e'],['infrastructure/docker-compose.local-access.yml','4ce3adb9f0cd9c1ee757eb1816dff2ca831594ba8b707a81ed8008b248ff4a07'],['services/loopback-proxy/server.mjs','39cb42a4ba4f1df48f65d13631a4e9930749ec93dbeab2a810b522fbb6178b67']])demand(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')===digest,'APPROVED_ACCESS_DIGEST_CHANGED');
const sessionFile=path.join(runtime,'local-access-session.json');
let session;if(fs.existsSync(sessionFile))session=JSON.parse(fs.readFileSync(sessionFile,'utf8'));else{session={started_utc:new Date().toISOString(),deadline_utc:new Date(Date.now()+30*60000).toISOString(),grant:'E-LOCAL-ACCESS-01',steps:[],complete:false};fs.writeFileSync(sessionFile,JSON.stringify(session,null,2),{flag:'wx'});}
const evidence=path.join(root,'docs/test-evidence/milestone-e-access-01',new Date().toISOString().replaceAll(/[:.]/g,'-'));fs.mkdirSync(evidence,{recursive:true});
const env={...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};
const secrets=['pg_bootstrap','pg_app','pg_n8n','control_token','n8n_token','worker_token','webhook_key','n8n_encryption','n8n_owner_password'].map(n=>fs.readFileSync(path.join(runtime,'secrets',n),'utf8').trim());
secrets.push(secrets.at(-1).slice(0,64));
const redact=text=>secrets.reduce((value,key)=>value.replaceAll(key,'[REDACTED]'),text);
const docker='C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',prefix=['compose','-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml'];
const compose='C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe';
const save=()=>fs.writeFileSync(sessionFile,JSON.stringify(session,null,2));
async function command(name,exe,args,maxMs=300000){
  const left=Date.parse(session.deadline_utc)-Date.now();demand(left>0,'ACCESS_COMPLETION_WINDOW_EXPIRED');
  const result=await runProcess(exe,args,{workspace:root,env,timeoutMs:Math.min(left,maxMs)});
  fs.writeFileSync(path.join(evidence,name+'.log'),redact(result.stdout+'\n'+result.stderr),{flag:'wx'});
  const entry={name,exit_code:result.exit_code,elapsed_seconds:result.elapsed_seconds,timed_out:result.timed_out,cleanup_failed:result.cleanup_failed,finished_utc:new Date().toISOString()};session.steps.push(entry);save();console.log(JSON.stringify(entry));
  demand(!result.cleanup_failed&&!result.timed_out&&result.exit_code===0,'COMPLETION_STEP_FAILED_'+name);return result.stdout;
}
async function readiness(){const end=Math.min(Date.now()+120000,Date.parse(session.deadline_utc));while(Date.now()<end){try{const responses=await Promise.all(['http://127.0.0.1:8780/health','http://127.0.0.1:5678/healthz/readiness'].map(u=>fetch(u,{signal:AbortSignal.timeout(3000)})));if(responses.every(r=>r.ok)){await Promise.all(responses.map(r=>r.arrayBuffer()));return;}}catch{}await new Promise(r=>setTimeout(r,1000));}throw Error('ACTUAL_LOOPBACK_READINESS_FAILED');}
try{
  delete session.error_code;delete session.failed_utc;
  await command('compose-up',compose,[...prefix.slice(1),'up','-d','--pull','never']);
  const ports=JSON.parse(await command('effective-ports',docker,['inspect','--format','{{json .NetworkSettings.Ports}}','socialstudio-loopback-proxy-1']));
  demand(['5678/tcp','8780/tcp'].every(p=>ports[p]?.length===1&&ports[p][0].HostIp==='127.0.0.1'),'EXACT_LOOPBACK_BINDINGS_REQUIRED');session.effective_ports=ports;
  await readiness();session.loopback_ready_utc=new Date().toISOString();save();
  await command('bootstrap',process.execPath,['scripts/bootstrap-studio-n8n.mjs','--fresh-local-instance'],600000);
  await readiness();
  const workerReceipt=path.join(runtime,'worker-process.json');demand(!fs.existsSync(workerReceipt),'EXISTING_WORKER_STATE_REQUIRES_REVIEW');
  const log=fs.openSync(path.join(runtime,'worker.log'),'a');const child=spawn(process.execPath,['services/production-adapter/worker.mjs','--config',path.join(runtime,'worker.json')],{cwd:root,env,detached:true,windowsHide:true,stdio:['ignore',log,log]});await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});child.unref();fs.closeSync(log);
  fs.writeFileSync(workerReceipt,JSON.stringify({pid:child.pid,started_utc:new Date().toISOString(),executable:process.execPath,task:'fixed native media worker',startup_registered:false},null,2),{flag:'wx'});session.worker_pid=child.pid;save();
  await command('real-n8n-existing-video-e2e',process.execPath,['scripts/studio-e2e.mjs','--explicit-mock-test-approval'],600000);
  session.complete=true;session.completed_utc=new Date().toISOString();
}catch(error){session.complete=false;session.error_code=error.code??error.message;session.failed_utc=new Date().toISOString();process.exitCode=1;}
save();fs.writeFileSync(path.join(evidence,'completion.json'),JSON.stringify(session,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({complete:session.complete,error:session.error_code??null,deadline_utc:session.deadline_utc,evidence,public_posts:0}));
