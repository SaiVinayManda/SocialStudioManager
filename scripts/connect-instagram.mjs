// Instagram Login UI + isolated HTTPS callback backend. No publishing routes.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
import {createInstagramOAuth} from '../services/publishing-adapter/instagram-oauth-server.mjs';
import {redirectURL} from '../services/publishing-adapter/instagram-login.mjs';
import {sealCredential} from '../services/publishing-adapter/instagram-vault.mjs';
import {demand} from '../services/studio-runtime/contracts.mjs';
const arg=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.slice(name.length+3);
const redirectUri=redirectURL(arg('redirect-uri'));
const directory=path.join(process.cwd(),'.runtime/orchestrator/instagram');
demand(process.platform==='win32','WINDOWS_CREDENTIAL_ACL_CHECK_REQUIRED');
const acl=spawnSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',['-NoProfile','-NonInteractive','-Command',"$ErrorActionPreference='Stop'; $p=Join-Path (Get-Location) '.runtime/orchestrator/instagram'; $a=Get-Acl -LiteralPath $p; $owner=$a.GetOwner([System.Security.Principal.SecurityIdentifier]).Value; $rules=$a.GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier]); if(!$a.AreAccessRulesProtected){exit 2}; foreach($r in $rules){if($r.AccessControlType -eq 'Allow' -and $r.IdentityReference.Value -notin @($owner,'S-1-5-18')){exit 3}}; exit 0"],{cwd:process.cwd(),windowsHide:true,encoding:'utf8',env:{SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR},timeout:10000});
demand(acl.status===0,'INSTAGRAM_PRIVATE_DIRECTORY_ACL_REQUIRED');
const tlsCert=arg('tls-cert'),tlsKey=arg('tls-key');demand(Boolean(tlsCert)===Boolean(tlsKey),'BOTH_TLS_FILES_REQUIRED');
if(!tlsCert)demand(process.argv.includes('--approved-https-proxy'),'APPROVED_HTTPS_PROXY_OR_TLS_CERTIFICATE_REQUIRED');
const tls=tlsCert?{cert:fs.readFileSync(tlsCert),key:fs.readFileSync(tlsKey)}:undefined;
const loginMode=arg('login-mode')??'unified';demand(['unified','instagram'].includes(loginMode),'INVALID_LOGIN_MODE');
const setup=createInstagramOAuth({redirectUri,tls,loginMode,save:async credential=>{
 for(const name of ['credential.enc','vault.key','connection.json'])demand(!fs.existsSync(path.join(directory,name)),'EXISTING_INSTAGRAM_CREDENTIAL_PRESERVED');
 const key=crypto.randomBytes(32);fs.writeFileSync(path.join(directory,'vault.key'),key,{flag:'wx',mode:0o600});
 fs.writeFileSync(path.join(directory,'credential.enc'),sealCredential(credential,key),{flag:'wx',mode:0o600});
 fs.writeFileSync(path.join(directory,'connection.json'),JSON.stringify({brand:'Horror',login_mode:credential.login_mode,app_id:credential.app_id,...(credential.config_id?{config_id:credential.config_id}:{}),account_id:credential.account_id,username:credential.username,permissions:credential.permissions,expires_at:credential.expires_at,uploaded:false,published:false},null,2)+'\n',{flag:'wx',mode:0o600});
},onConnected:result=>console.log(JSON.stringify({connected:true,brand:'Horror',login_mode:loginMode,...result,uploaded:false,published:false}))});
setup.local.listen(setup.localPort,'127.0.0.1');setup.callback.listen(setup.callbackPort,'127.0.0.1',()=>console.log(JSON.stringify({open:setup.startURL,redirect_uri:setup.redirectUri,callback_backend:(tls?'https':'http')+'://127.0.0.1:'+setup.callbackPort,login_mode:loginMode,expires_in_minutes:30,uploads_enabled:false})));
for(const server of [setup.local,setup.callback])server.on('error',()=>{console.error('INSTAGRAM_LISTENER_START_FAILED');setup.close();process.exitCode=1;});
const timer=setTimeout(()=>setup.close(),30*60000);timer.unref();process.on('SIGINT',()=>setup.close());process.on('SIGTERM',()=>setup.close());
