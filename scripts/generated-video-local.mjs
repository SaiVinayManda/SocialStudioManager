// Operator helper for the owner's requested offline five-second test. No new
// credentials, installations, Windows services, networking or model inference.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawn,spawnSync} from 'node:child_process';
import {localGrant,control} from './studio-test-client.mjs';import {childEnvironment,fileHash} from '../services/production-adapter/media.mjs';import {TEMPLATE_ID} from '../services/production-adapter/horror-template.mjs';
const root=localGrant(),runtime=path.join(root,'.runtime/orchestrator'),session=path.join(runtime,'generated-video-session.json');
const env={...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};
const compose='C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe';
const args=['-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml'];
function run(exe,a,input){const r=spawnSync(exe,a,{cwd:root,env,windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:1048576,input});assert.equal(r.status,0,'Fixed local operation failed; no secrets logged');return r.stdout.trim();}
const sql=q=>run(compose,[...args,'exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d','social_studio','-At','-c',q]);
if(process.argv.includes('--retry-after-review')){
  const previous=JSON.parse(fs.readFileSync(session,'utf8')),evidenceFile=path.join(root,'docs/test-evidence/generated-video',previous.id,'e2e.json'),evidence=JSON.parse(fs.readFileSync(evidenceFile,'utf8'));
  const reviews=await control('/approvals?job_id='+evidence.job_id),review=reviews.approvals[0];assert.equal(review.decision,'pending');
  await control(`/approvals/${review.id}/decision`,{method:'POST',body:{decision:'rejected',checksum:review.content_checksum,content_version:review.content_version,test_mock_only:true,comments:'MOCK-PUBLISH TEST REJECTION: possible clipping in first mix. Preserve output; repair audio headroom in a distinct new job.'}});
  evidence.passed=false;evidence.quality_issue='Possible clipping in first normalized mix; rejected before scheduling. No publications.';fs.writeFileSync(evidenceFile,JSON.stringify(evidence,null,2));
  const history=path.join(runtime,'generated-tests',previous.id);fs.mkdirSync(history,{recursive:true});fs.writeFileSync(path.join(history,'session.json'),JSON.stringify(previous,null,2),{flag:'wx'});
  fs.writeFileSync(session,JSON.stringify({id:crypto.randomUUID(),started_utc:new Date().toISOString(),supersedes:previous.id},null,2));
}
if(process.argv.includes('--new-session')){assert(!fs.existsSync(session),'Existing session preserved; resume it instead');fs.writeFileSync(session,JSON.stringify({id:crypto.randomUUID(),started_utc:new Date().toISOString()},null,2),{flag:'wx'});}
const sessionData=JSON.parse(fs.readFileSync(session,'utf8')),project='door-5s-'+sessionData.id;
assert(/^[a-f0-9-]{36}$/.test(sessionData.id));
const dir=path.join(runtime,'generated-tests',sessionData.id);fs.mkdirSync(dir,{recursive:true});
if(process.argv.includes('--refresh-api'))run(compose,[...args,'restart','studio-api']);
if(process.argv.includes('--restart-worker')){
  assert.equal(sql("SELECT count(*) FROM studio.production_tasks WHERE status='running'"),'0','Wait for active media task before worker restart');
  const configFile=path.join(runtime,'worker.json'),receiptFile=path.join(runtime,'worker-process.json');
  const config=JSON.parse(fs.readFileSync(configFile,'utf8')),receipt=JSON.parse(fs.readFileSync(receiptFile,'utf8'));
  assert.equal(config.workspace,root);assert(Number.isInteger(receipt.pid)&&receipt.pid>0);
  const ps='C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  const info=JSON.parse(run(ps,['-NoProfile','-NonInteractive','-Command',`$p=Get-CimInstance Win32_Process -Filter 'ProcessId = ${receipt.pid}'; if(!$p){throw 'Owned worker unavailable'}; @{pid=$p.ProcessId;executable=$p.ExecutablePath;created=$p.CreationDate.ToUniversalTime().ToString('o');worker=($p.CommandLine.Contains('services/production-adapter/worker.mjs') -or $p.CommandLine.Contains('services\\production-adapter\\worker.mjs'));config=$p.CommandLine.Contains('worker.json')} | ConvertTo-Json -Compress`]));
  assert(info.worker&&info.config&&info.executable===process.execPath&&Math.abs(Date.parse(info.created)-Date.parse(receipt.started_utc))<10000,'Worker identity mismatch; no process stopped');
  const stamp=new Date().toISOString().replaceAll(/[:.]/g,'-');
  fs.writeFileSync(path.join(dir,'prior-worker-'+stamp+'.json'),JSON.stringify({receipt,config},null,2),{flag:'wx'});
  config.approved_engine_projects??={};config.approved_engine_projects[project]={template_id:TEMPLATE_ID,acceptance_run_id:sessionData.id,runner_sha256:await fileHash(path.join(root,'services/production-adapter/generate-horror-template.py')),expires_at:new Date(Date.now()+3600000).toISOString(),scope:'Owner requested fixed offline generated-video test only; not public publishing'};
  // Stop precisely the verified manual worker; no other Node process is touched.
  run(ps,['-NoProfile','-NonInteractive','-Command',`Stop-Process -Id ${receipt.pid} -ErrorAction Stop`]);
  fs.writeFileSync(configFile,JSON.stringify(config,null,2));
  const output=fs.openSync(path.join(dir,'worker-'+stamp+'.stdout'),'wx'),error=fs.openSync(path.join(dir,'worker-'+stamp+'.stderr'),'wx');
  const worker=spawn(process.execPath,[path.join(root,'services/production-adapter/worker.mjs'),'--config',configFile],{cwd:root,env,windowsHide:true,detached:true,stdio:['ignore',output,error]});
  await new Promise((resolve,reject)=>{worker.once('spawn',resolve);worker.once('error',reject);});
  fs.closeSync(output);fs.closeSync(error);worker.unref();
  const next={pid:worker.pid,started_utc:new Date().toISOString(),executable:process.execPath,task:'fixed native media worker',startup_registered:false};fs.writeFileSync(receiptFile,JSON.stringify(next,null,2));fs.writeFileSync(path.join(dir,'restart-'+stamp+'.json'),JSON.stringify({previous_pid:receipt.pid,new_pid:next.pid,active_tasks:0,at:next.started_utc},null,2),{flag:'wx'});
}
console.log(JSON.stringify({run_id:sessionData.id,project,api_refreshed:process.argv.includes('--refresh-api'),worker_restarted:process.argv.includes('--restart-worker'),session,model_requests:0,public_posts:0}));
