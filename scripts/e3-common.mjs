import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {localGrant,readLocalKey,control,until} from './studio-test-client.mjs';import {childEnvironment} from '../services/production-adapter/media.mjs';import {signWebhook} from '../services/studio-runtime/contracts.mjs';
import {spawn} from 'node:child_process';
export {control,until};export const root=localGrant();
export const sessionFile=path.join(root,'.runtime/orchestrator/e3-session.json');
export function compose(args,input){const r=spawnSync('C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe',['-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml',...args],{cwd:root,env:{...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')},windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:2097152,input});assert.equal(r.status,0,'Fixed local Compose operation failed; raw errors deliberately omitted');return r.stdout.trim();}
export function sql(database,query){return compose(['exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d',database,'-At','-c',query]);}
export async function webhook(route,body){const r=await fetch('http://127.0.0.1:5678/webhook/social-studio/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(signWebhook(body,readLocalKey('webhook_key'))),redirect:'error',signal:AbortSignal.timeout(15000)});assert(r.ok,'Actual n8n webhook failed');return r.json();}
export function save(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');}
export async function restartMediaWorker(update,dir){
 assert.equal(sql('social_studio',"SELECT count(*) FROM studio.production_tasks WHERE status='running'"),'0','Owned media worker must be idle');
 const runtime=path.join(root,'.runtime/orchestrator'),configFile=path.join(runtime,'worker.json'),receiptFile=path.join(runtime,'worker-process.json'),config=JSON.parse(fs.readFileSync(configFile,'utf8')),receipt=JSON.parse(fs.readFileSync(receiptFile,'utf8'));
 assert.equal(config.workspace,root);assert(Number.isInteger(receipt.pid)&&receipt.pid>0);
 const env=childEnvironment(root),ps='C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
 function command(args){const r=spawnSync(ps,['-NoProfile','-NonInteractive','-Command',...args],{cwd:root,env,windowsHide:true,encoding:'utf8',timeout:15000});assert.equal(r.status,0,'Verified manual worker operation failed');return r.stdout.trim();}
 const info=JSON.parse(command([`$p=Get-CimInstance Win32_Process -Filter 'ProcessId = ${receipt.pid}'; if(!$p){throw 'Owned worker unavailable'}; @{executable=$p.ExecutablePath;created=$p.CreationDate.ToUniversalTime().ToString('o');worker=($p.CommandLine.Contains('production-adapter/worker.mjs') -or $p.CommandLine.Contains('production-adapter\\worker.mjs'));config=$p.CommandLine.Contains('worker.json')} | ConvertTo-Json -Compress`]));
 assert(info.executable===process.execPath&&info.worker&&info.config&&Math.abs(Date.parse(info.created)-Date.parse(receipt.started_utc))<10000,'Worker identity mismatch');
 const stamp=new Date().toISOString().replaceAll(/[:.]/g,'-');save(path.join(dir,'prior-worker-'+stamp+'.json'),{receipt,config});
 const next=await update(structuredClone(config));command([`Stop-Process -Id ${receipt.pid} -ErrorAction Stop`]);save(configFile,next);
 fs.mkdirSync(dir,{recursive:true});const out=fs.openSync(path.join(dir,'worker-'+stamp+'.stdout'),'wx'),err=fs.openSync(path.join(dir,'worker-'+stamp+'.stderr'),'wx');
 const child=spawn(process.execPath,[path.join(root,'services/production-adapter/worker.mjs'),'--config',configFile],{cwd:root,env,windowsHide:true,detached:true,stdio:['ignore',out,err]});await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});child.unref();fs.closeSync(out);fs.closeSync(err);
 const current={pid:child.pid,started_utc:new Date().toISOString(),executable:process.execPath,task:'fixed native media worker',startup_registered:false};save(receiptFile,current);save(path.join(dir,'restart-'+stamp+'.json'),{previous_pid:receipt.pid,new_pid:child.pid,active_tasks:0,at:current.started_utc});return current;
}
