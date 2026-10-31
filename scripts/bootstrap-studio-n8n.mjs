// Fresh local instance only. Never prints passwords, header credentials, cookies or CLI output.
// Source-verified against n8n@2.45.7; NOT execution-verified before installation approval.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {demand} from '../services/studio-runtime/contracts.mjs';import {childEnvironment} from '../services/production-adapter/media.mjs';import {localGrant,readLocalKey} from './studio-test-client.mjs';
const root=localGrant(),runtime=path.join(root,'.runtime/orchestrator'),ledger=JSON.parse(fs.readFileSync(path.join(runtime,'approvals.json'),'utf8'));
demand(ledger.infra_setup===true,'E_INFRA_SETUP_APPROVAL_REQUIRED');demand(process.argv.includes('--fresh-local-instance'),'FRESH_INSTANCE_CONFIRMATION_REQUIRED');
const receipt=path.join(runtime,'n8n-bootstrap.json');demand(!fs.existsSync(receipt),'EXISTING_BOOTSTRAP_PRESERVED');
const docker='C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',prefix=['compose','-p','socialstudio','-f','infrastructure/docker-compose.yml'];
const env={...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};
function command(args,input){const r=spawnSync(docker,[...prefix,...args],{cwd:root,env,windowsHide:true,input,encoding:'utf8',timeout:120000,maxBuffer:1048576});demand(r.status===0,'LOCAL_N8N_COMMAND_FAILED');return r.stdout;}
function sql(query){return command(['exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d','n8n_internal','-At','-c',query]).trim();}
const existing=Number(sql('SELECT count(*) FROM n8n.credentials_entity'));demand(existing===0,'NONEMPTY_INSTANCE_PRESERVED');
const password=fs.readFileSync(path.join(runtime,'secrets/n8n_owner_password'),'utf8').trim();
const response=await fetch('http://127.0.0.1:5678/rest/owner/setup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'owner@social-studio.local',firstName:'Social',lastName:'Studio',password}),signal:AbortSignal.timeout(15000)});
demand(response.ok,'FRESH_OWNER_SETUP_FAILED_REVIEW_PARTIAL_STATE');const publicOwner=await response.json();demand(publicOwner.data?.id,'FRESH_OWNER_ID_MISSING');
// Set-Cookie is intentionally neither read nor persisted. CLI uses the new instance's own database.
const credential=[{id:'socialstudioauth',name:'Social Studio internal API',type:'httpHeaderAuth',data:{name:'Authorization',value:'Bearer '+readLocalKey('n8n_token')}}];
command(['exec','-T','n8n','n8n','import:credentials','--input=/dev/stdin','--userId='+publicOwner.data.id],JSON.stringify(credential));
demand(sql("SELECT count(*) FROM n8n.credentials_entity WHERE id='socialstudioauth'")==='1','CREDENTIAL_IMPORT_NOT_VERIFIED');
command(['exec','-T','n8n','n8n','import:workflow','--separate','--input=/studio-workflows','--userId='+publicOwner.data.id]);
const workflows=Array.from({length:12},(_,i)=>'socialstudio'+String(i+1).padStart(4,'0'));
demand(sql("SELECT count(*) FROM n8n.workflow_entity WHERE id IN ("+workflows.map(x=>"'"+x+"'").join(',')+")")==='12','WORKFLOW_IMPORT_NOT_VERIFIED');
for(const id of workflows)command(['exec','-T','n8n','n8n','publish:workflow','--id='+id]);
command(['restart','n8n']); // CLI publication requires this restart; no other service is restarted.
const ffmpeg=path.join(root,'.runtime/openmontage-pilot/ffmpeg/ffmpeg-9.0.2-essentials_build/bin'),workerConfig=path.join(runtime,'worker.json');
fs.writeFileSync(workerConfig,JSON.stringify({workspace:root,api_url:'http://127.0.0.1:8780',worker_token_file:path.join(runtime,'secrets/worker_token'),ffmpeg_bin:ffmpeg,approved_engine_projects:{}},null,2),{flag:'wx'});
fs.writeFileSync(receipt,JSON.stringify({created_at_utc:new Date().toISOString(),instance:'socialstudio',owner_id:publicOwner.data.id,workflow_ids:workflows,credential_id:'socialstudioauth',values_logged:false,live_publishing:false,worker_config:workerConfig,acceptance_passed:false},null,2),{flag:'wx'});
console.log(JSON.stringify({local_import_prepared:true,workflows:12,acceptance_passed:false,worker_config:workerConfig}));
