// Operator installer for the two exact grants; no saved auth or package scripts.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn} from 'node:child_process';
const root=process.cwd(),runtime=path.join(root,'.runtime/orchestrator'),evidence=path.join(root,'docs/test-evidence/milestone-e-deploy-01');
const ledger=JSON.parse(fs.readFileSync(path.join(runtime,'approvals.json'),'utf8'));
const assert=(ok,code)=>{if(!ok)throw Error(code);};
assert(ledger.infra_setup===true&&Date.now()<Date.parse(ledger.expires_utc),'OWNER_INFRA_GRANT_REQUIRED');
for(const [file,digest]of [['docs/ORCHESTRATOR_SETUP_APPROVAL.md',ledger.packet_sha256],['services/studio-runtime/package-lock.json',ledger.lock_sha256],['scripts/create-studio-local-secrets.mjs',ledger.secret_generator_sha256]])assert(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')===digest,'APPROVED_DIGEST_DIFFERS');
const names=['n8n-amd64-manifest.json','postgres-amd64-manifest.json'];const layers=names.flatMap(n=>JSON.parse(fs.readFileSync(path.join(evidence,n),'utf8')).layers);
const payload=layers.reduce((n,l)=>n+l.size,0);assert(payload+1048576<ledger.download_limit_bytes,'DOWNLOAD_BUDGET_EXCEEDED');
assert(!fs.existsSync(path.join(root,'services/studio-runtime/.npmrc')),'UNAPPROVED_PROJECT_NPM_CONFIG');
for(const file of ['empty.npmrc','empty-global.npmrc'])fs.writeFileSync(path.join(runtime,file),'',{flag:'wx'});
const session={started_utc:new Date().toISOString(),deadline_utc:new Date(Date.now()+90*60000).toISOString(),grant:'E-INFRA-SETUP-01',full_image_compressed_payload_bytes:payload,commands:[],paid_api_calls:0,complete:false};
fs.writeFileSync(path.join(runtime,'setup-session.json'),JSON.stringify(session,null,2),{flag:'wx'});
const env={SystemRoot:'C:\\Windows',WINDIR:'C:\\Windows',PATH:'C:\\Program Files\\nodejs;C:\\Windows\\System32',HOME:path.join(runtime,'installer-home'),USERPROFILE:path.join(runtime,'installer-home'),TEMP:runtime,TMP:runtime,DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};fs.mkdirSync(env.HOME,{recursive:true});
async function run(name,exe,args){
  const remaining=Date.parse(session.deadline_utc)-Date.now();assert(remaining>0,'SETUP_TIME_LIMIT');const began=Date.now();
  const log=fs.createWriteStream(path.join(evidence,name+'.log'),{flags:'wx'});
  const code=await new Promise((resolve,reject)=>{const child=spawn(exe,args,{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe'],timeout:Math.min(remaining,20*60000),killSignal:'SIGKILL'});child.stdout.on('data',b=>log.write(b));child.stderr.on('data',b=>log.write(b));child.once('error',reject);child.once('close',resolve);});log.end();
  session.commands.push({name,exit_code:code,elapsed_seconds:(Date.now()-began)/1000,finished_utc:new Date().toISOString()});fs.writeFileSync(path.join(runtime,'setup-session.json'),JSON.stringify(session,null,2));console.log(JSON.stringify(session.commands.at(-1)));assert(code===0,'INSTALL_COMMAND_FAILED_'+name);
}
const docker='C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe';
try{
  await run('pull-n8n',docker,['pull','docker.n8n.io/n8nio/n8n:2.45.7']);
  await run('pull-postgres',docker,['pull','postgres:17.11-alpine']);
  await run('npm-ci','C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',['-NoProfile','-NonInteractive','-Command',"& 'C:\\Program Files\\nodejs\\npm.cmd' ci --prefix services/studio-runtime --ignore-scripts --no-audit --no-fund --registry=https://registry.npmjs.org --cache=.runtime/orchestrator/npm-cache --userconfig=.runtime/orchestrator/empty.npmrc --globalconfig=.runtime/orchestrator/empty-global.npmrc; exit $LASTEXITCODE"]);
  session.install_commands_complete=true;
}catch(error){session.error_code=error.message;process.exitCode=1;}
session.updated_utc=new Date().toISOString();fs.writeFileSync(path.join(runtime,'setup-session.json'),JSON.stringify(session,null,2));fs.writeFileSync(path.join(evidence,'installation.json'),JSON.stringify(session,null,2)+'\n');console.log(JSON.stringify({install_commands_complete:session.install_commands_complete??false,deadline_utc:session.deadline_utc,error:session.error_code??null}));
