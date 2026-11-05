// Explicit operator action: additive schema, existing API/workflow only.
// Never approves a Reel, uploads video, invokes a scheduler, or changes AI/worker.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
import {demand} from '../services/studio-runtime/contracts.mjs';
const prepareOnly=process.argv.includes('--prepare-only');
demand(prepareOnly||process.argv.includes('--connect-only'),'CONNECT_ONLY_FLAG_REQUIRED');
const root=process.cwd(),runtime=path.join(root,'.runtime/orchestrator/instagram');
if(!prepareOnly)for(const name of ['credential.enc','vault.key'])demand(fs.existsSync(path.join(runtime,name)),'COMPLETE_LOCAL_OAUTH_FIRST');
const env={SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,PATH:process.env.PATH,DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty'),DOCKER_HOST:'npipe:////./pipe/dockerDesktopLinuxEngine'};
const exe='C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe';
const prefix=['-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml',...(!prepareOnly?['-f','infrastructure/docker-compose.instagram.yml']:[])];
function command(args,input){const r=spawnSync(exe,[...prefix,...args],{cwd:root,env,windowsHide:true,encoding:'utf8',input,timeout:120000,maxBuffer:1048576});demand(r.status===0,'INSTAGRAM_ACTIVATION_STEP_FAILED');return r.stdout.trim();}
const migration='infrastructure/postgres/migrations/004-instagram-pilot.sql',digest=crypto.createHash('sha256').update(fs.readFileSync(migration)).digest('hex');
command(['config','--quiet']);
const current=command(['exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d','social_studio','-At','-c','SELECT checksum FROM studio.schema_migrations WHERE version=4']);
if(current)demand(current===digest,'INSTAGRAM_MIGRATION_DIGEST_CHANGED');
else command(['exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-v','migration_checksum='+digest,'-U','studio_bootstrap','-d','social_studio','-f','/studio-migrations/004-instagram-pilot.sql']);
command(prepareOnly?['restart','studio-api']:['up','-d','--no-deps','--pull','never','studio-api']);
command(['exec','-T','n8n','n8n','import:workflow','--input=/studio-workflows/08-instagram-mock-publishing.json']);
command(['exec','-T','n8n','n8n','publish:workflow','--id=socialstudio0008']);
command(['restart','n8n']);
if(prepareOnly){console.log(JSON.stringify({deployed:true,oauth_pending:true,migration_sha256:digest,workflow_id:'socialstudio0008',live_publishing_enabled:false,uploaded:false,published:false}));process.exit(0);}
// Use only the existing internal control key, within its API container; no raw
// headers, keys, provider errors or workflow execution exports reach stdout.
const script=`import fs from 'node:fs';const headers={authorization:'Bearer '+fs.readFileSync(process.env.CONTROL_TOKEN_FILE,'utf8').trim(),'content-type':'application/json'};for(let n=0;n<30;n++){try{if((await fetch('http://127.0.0.1:8780/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,1000));}for(const [route,method]of [['connect','POST'],['preview','GET']]){const r=await fetch('http://127.0.0.1:8780/instagram/'+route,{method,headers,...(method==='POST'?{body:'{}'}:{}),signal:AbortSignal.timeout(60000)});const data=await r.json();if(!r.ok)throw Error(data.error?.code??'INSTAGRAM_CONNECTION_FAILED');if(route==='preview')console.log(JSON.stringify(data));}`;
const preview=JSON.parse(command(['exec','-T','studio-api','node','--input-type=module'],script));
fs.writeFileSync(path.join(runtime,'preview.json'),JSON.stringify(preview,null,2)+'\n');
console.log(JSON.stringify({connected:true,preview,migration_sha256:digest,uploaded:false,published:false}));
