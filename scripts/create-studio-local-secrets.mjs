// E-LOCAL-AUTH-01 only: fresh project-local credentials; no existing auth reads.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const root=process.cwd(),base=path.join(root,'.runtime','orchestrator'),dest=path.join(base,'secrets');
if(process.argv[2]!=='--approved=E-LOCAL-AUTH-01')throw Error('Explicit local-auth grant required');
const grants=JSON.parse(fs.readFileSync(path.join(base,'approvals.json'),'utf8'));
if(!grants.local_auth||Date.now()>=Date.parse(grants.expires_utc))throw Error('Missing or expired owner approval record');
if(fs.existsSync(dest))throw Error('Existing secret directory preserved; inspect before any reuse');
fs.mkdirSync(dest,{recursive:true});
const identity=spawnSync('C:\\Windows\\System32\\whoami.exe',['/user','/fo','csv','/nh'],{encoding:'utf8',windowsHide:true});
const sid=identity.stdout?.match(/S-1-5-[0-9-]+/)?.[0];if(identity.status!==0||!sid)throw Error('Cannot determine current owner SID');
const acl=spawnSync('C:\\Windows\\System32\\icacls.exe',[dest,'/inheritance:r','/grant:r',`*${sid}:(OI)(CI)F`,'*S-1-5-18:(OI)(CI)F'],{encoding:'utf8',windowsHide:true});
if(acl.status!==0)throw Error('Secret-directory ACL failed; no keys generated');
const names=['pg_bootstrap','pg_app','pg_n8n','control_token','n8n_token','worker_token','webhook_key','n8n_encryption','n8n_owner_password'];
for(const name of names){const value=(name==='n8n_owner_password'?'Ss1!':'')+crypto.randomBytes(32).toString('hex');fs.writeFileSync(path.join(dest,name),value,{flag:'wx',mode:0o600});}
fs.writeFileSync(path.join(base,'local-auth-created.json'),JSON.stringify({created_at_utc:new Date().toISOString(),grant:'E-LOCAL-AUTH-01',directory:dest,files:names,values_logged:false,acl_owner_sid:sid,external_accounts:false},null,2),{flag:'wx'});
console.log(JSON.stringify({created:true,files:names.length,values_logged:false,external_accounts:false}));
