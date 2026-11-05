// Historical Facebook-login connector, retired by the owner's Instagram Login request.
throw new Error('FACEBOOK_CONNECTOR_RETIRED_USE_CONNECT_INSTAGRAM');
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {InstagramAPI} from '../services/publishing-adapter/instagram-api.mjs';
import {sealCredential} from '../services/publishing-adapter/instagram-vault.mjs';
import {HORROR_ID} from '../services/publishing-adapter/instagram-pilot.mjs';
import {demand} from '../services/studio-runtime/contracts.mjs';
const origin='http://localhost:8791',redirect=origin+'/callback',csrf=crypto.randomBytes(32).toString('hex'),start=crypto.randomBytes(32).toString('hex');
const directory=path.join(process.cwd(),'.runtime/orchestrator/instagram');
const expectedAppId=process.argv.find(x=>x.startsWith('--app-id='))?.slice(9);
if(expectedAppId)demand(/^\d+$/.test(expectedAppId),'INVALID_APP_ID');
// Windows does not enforce Node's POSIX mode bits. Refuse all secret entry until
// an owner-approved ACL protects this new directory. This check changes no ACL.
demand(process.platform==='win32','WINDOWS_CREDENTIAL_ACL_CHECK_REQUIRED');
const aclCheck=spawnSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',['-NoProfile','-NonInteractive','-Command',"$ErrorActionPreference='Stop'; $p=Join-Path (Get-Location) '.runtime/orchestrator/instagram'; $a=Get-Acl -LiteralPath $p; $owner=$a.GetOwner([System.Security.Principal.SecurityIdentifier]).Value; $rules=$a.GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier]); if(!$a.AreAccessRulesProtected){exit 2}; foreach($r in $rules){if($r.AccessControlType -eq 'Allow' -and $r.IdentityReference.Value -notin @($owner,'S-1-5-18')){exit 3}}; exit 0"],{cwd:process.cwd(),windowsHide:true,encoding:'utf8',env:{SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR},timeout:10000});
demand(aclCheck.status===0,'INSTAGRAM_PRIVATE_DIRECTORY_ACL_REQUIRED');
let config,state,candidates=[],finished=false;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const form=(action,inside)=>`<form method="post" action="${action}"><input type="hidden" name="csrf" value="${csrf}">${inside}</form>`;
const shell=inside=>`<!doctype html><meta charset="utf-8"><title>Connect Horror Instagram</title><style>body{font:18px system-ui;max-width:720px;margin:50px auto;padding:20px}label{display:block;margin:18px 0}input{display:block;width:95%;padding:10px}button{padding:12px}small{display:block}</style><h1>Connect Instagram to Horror</h1><p>This page only connects and checks the account. It cannot upload or publish.</p>${inside}`;
const server=http.createServer(async(req,res)=>{
  const page=(html,status=200)=>{res.writeHead(status,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"});res.end(shell(html));};
  const go=url=>{res.writeHead(303,{location:url,'cache-control':'no-store','referrer-policy':'no-referrer'});res.end();};
  try{
    demand(['localhost:8791','127.0.0.1:8791'].includes(req.headers.host),'INVALID_LOCAL_HOST');
    const url=new URL(req.url,origin);
    if(req.method==='GET'&&url.pathname==='/start'&&url.searchParams.get('key')===start){res.setHeader('set-cookie',`studio_ig=${csrf}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800`);return go('/');}
    demand(req.headers.cookie?.split(';').some(x=>x.trim()===`studio_ig=${csrf}`),'OPEN_ORIGINAL_LOCAL_SETUP_URL');
    if(finished)return page('<p>Connection saved securely. Return to Social Studio for review and separate upload/publication approval.</p>');
    if(req.method==='GET'&&url.pathname==='/')return page(form('/configure',`<label>Meta App ID<input name="app_id" required pattern="[0-9]+" value="${expectedAppId??''}" ${expectedAppId?'readonly':''}></label><label>Graph API version from your app dashboard<input name="version" placeholder="vXX.0" required pattern="v[0-9]{2}\\.[0-9]+"></label><label>Facebook Login for Business configuration ID<input name="config_id" required pattern="[0-9]+"></label><label>App Secret (kept in memory only)<input name="secret" type="password" required autocomplete="off"></label><small>Register this exact OAuth redirect in Meta: ${redirect}</small><p><button>Continue to Facebook</button></p>`));
    let body;
    if(req.method==='POST'){
      demand(req.headers.origin===origin&&req.headers['content-type']?.startsWith('application/x-www-form-urlencoded'),'INVALID_LOCAL_ORIGIN');
      let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;demand(size<16384,'REQUEST_TOO_LARGE');chunks.push(chunk);}body=new URLSearchParams(Buffer.concat(chunks).toString('utf8'));demand(body.get('csrf')===csrf,'INVALID_CSRF');
    }
    if(req.method==='POST'&&url.pathname==='/configure'){
      const appId=body.get('app_id'),version=body.get('version'),configId=body.get('config_id'),secret=body.get('secret');
      demand(/^\d+$/.test(appId)&&/^v\d{2}\.\d+$/.test(version)&&/^\d+$/.test(configId)&&secret?.length>=16,'INVALID_APP_CONFIGURATION');
      demand(!expectedAppId||appId===expectedAppId,'APP_ID_MISMATCH');
      config={appId,version,configId,secret};state=crypto.randomBytes(32).toString('hex');
      const target=new URL(`https://www.facebook.com/${version}/dialog/oauth`);target.search=new URLSearchParams({client_id:appId,redirect_uri:redirect,state,response_type:'code',config_id:configId}).toString();return go(target.href);
    }
    if(req.method==='GET'&&url.pathname==='/callback'){
      demand(config&&state&&url.searchParams.get('state')===state,'INVALID_OAUTH_STATE');state=null;
      demand(!url.searchParams.has('error')&&url.searchParams.get('code'),'META_LOGIN_NOT_COMPLETED');
      let data,response;
      try{response=await fetch(`https://graph.facebook.com/${config.version}/oauth/access_token`,{method:'POST',redirect:'error',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.appId,client_secret:config.secret,redirect_uri:redirect,code:url.searchParams.get('code')}).toString(),signal:AbortSignal.timeout(20000)});data=await response.json();}catch{throw Error('META_TOKEN_EXCHANGE_FAILED');}
      demand(response.ok&&typeof data.access_token==='string','META_TOKEN_EXCHANGE_REJECTED');
      candidates=await new InstagramAPI({version:config.version,token:data.access_token}).discover();
      config.secret=null;demand(candidates.length>0,'NO_PAGE_LINKED_PROFESSIONAL_INSTAGRAM_ACCOUNT');
      return go('/accounts');
    }
    if(req.method==='GET'&&url.pathname==='/accounts')return page('<h2>Choose the Horror destination</h2>'+candidates.map((c,i)=>form('/select',`<p>@${escape(c.username)} — Page: ${escape(c.page_name)} — Instagram ID: ${escape(c.account_id)}</p><input type="hidden" name="index" value="${i}"><button>Connect @${escape(c.username)} to Horror</button>`)).join(''));
    if(req.method==='POST'&&url.pathname==='/select'){
      demand(/^\d+$/.test(body.get('index')),'INVALID_ACCOUNT_SELECTION');const selected=candidates[Number(body.get('index'))];demand(selected&&selected.page_token,'PAGE_TOKEN_UNAVAILABLE');
      const api=new InstagramAPI({version:config.version,token:selected.page_token}),preflight=await api.preflight(selected.account_id);demand(preflight.account.id===selected.account_id,'ACCOUNT_MISMATCH');
      fs.mkdirSync(directory,{recursive:true});demand(!fs.existsSync(path.join(directory,'credential.enc')),'INSTAGRAM_CREDENTIAL_ALREADY_EXISTS');
      const key=crypto.randomBytes(32),credential={brand_id:HORROR_ID,login_mode:'facebook_business',version:config.version,app_id:config.appId,page_id:selected.page_id,account_id:selected.account_id,username:selected.username,token:selected.page_token,connected_at:new Date().toISOString()};
      fs.writeFileSync(path.join(directory,'vault.key'),key,{flag:'wx',mode:0o600});
      fs.writeFileSync(path.join(directory,'credential.enc'),sealCredential(credential,key),{flag:'wx',mode:0o600});
      fs.writeFileSync(path.join(directory,'connection.json'),JSON.stringify({brand:'Horror',account_id:selected.account_id,username:selected.username,page_id:selected.page_id,version:config.version,uploaded:false,published:false},null,2),{flag:'wx'});
      console.log(JSON.stringify({connected:true,brand:'Horror',username:selected.username,account_id:selected.account_id,uploaded:false,published:false}));candidates=[];config=null;finished=true;return go('/');
    }
    return page('<p>Page not found.</p>',404);
  }catch(error){const safe=/^[A-Z0-9_]+$/.test(error.code??error.message)?error.code??error.message:'CONNECTION_FAILED';return page(`<p>${escape(safe)}. No video was uploaded or published.</p>`,400);}
});
server.requestTimeout=30000;server.headersTimeout=10000;
server.listen(8791,'127.0.0.1',()=>console.log(JSON.stringify({open:origin+'/start?key='+start,redirect_uri:redirect,expires_in_minutes:30,uploads_enabled:false})));
const timer=setTimeout(()=>server.closeAllConnections()||server.close(),30*60000);server.on('close',()=>clearTimeout(timer));
