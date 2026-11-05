import http from 'node:http';import https from 'node:https';import crypto from 'node:crypto';
import {authorizationURL,redirectURL,exchangeInstagramCode,InstagramLoginAPI} from './instagram-login.mjs';
import {demand,StudioError} from '../studio-runtime/contracts.mjs';
import {unifiedAuthorizationURL,exchangeUnifiedCode,UnifiedInstagramAPI,unifiedConfiguration,unifiedPermissions} from './meta-unified-login.mjs';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createInstagramOAuth({redirectUri,save,fetcher=fetch,tls,localPort=8791,callbackPort=8792,loginMode='instagram',exchange=loginMode==='unified'?exchangeUnifiedCode:exchangeInstagramCode,onConnected=()=>{}}){
 const callbackURL=redirectURL(redirectUri),origin=`http://localhost:${localPort}`,csrf=crypto.randomBytes(32).toString('hex'),start=crypto.randomBytes(32).toString('hex');
 let configuration=null,pending=null,selection=null,completed=null;const usedCodes=new Set(),deadline=Date.now()+30*60000;
 const page=(res,html,status=200)=>{res.writeHead(status,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"});res.end(`<!doctype html><meta charset="utf-8"><title>Connect Horror Instagram</title><style>body{font:18px system-ui;max-width:720px;margin:40px auto;padding:20px}label{display:block;margin:18px 0}input{display:block;width:95%;padding:10px}button{padding:12px}</style><h1>Connect Instagram to Horror</h1><p>Account connection only. Uploading and publishing are disabled.</p>${html}`);};
 const go=(res,target)=>{res.writeHead(303,{location:target,'cache-control':'no-store','referrer-policy':'no-referrer'});res.end();};
 const form=(action,content)=>`<form method="post" action="${action}"><input type="hidden" name="csrf" value="${csrf}">${content}</form>`;
 const fail=(res,error)=>page(res,`<p>${escape(error instanceof StudioError?error.code:'INSTAGRAM_CONNECTION_FAILED')}. No upload or publication occurred.</p>`,400);
 const local=http.createServer(async(req,res)=>{try{
  demand(Date.now()<deadline,'OAUTH_SETUP_EXPIRED');demand([`localhost:${localPort}`,`127.0.0.1:${localPort}`].includes(req.headers.host),'INVALID_LOCAL_HOST');const url=new URL(req.url,origin);
  if(req.method==='GET'&&url.pathname==='/start'&&url.searchParams.get('key')===start){res.setHeader('set-cookie',`studio_ig=${csrf}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800`);return go(res,'/');}
  demand(req.headers.cookie?.split(';').some(x=>x.trim()===`studio_ig=${csrf}`),'OPEN_ORIGINAL_LOCAL_SETUP_URL');
  if(completed)return page(res,`<p>Connected <strong>@${escape(completed.username)}</strong> to Horror.</p><p>Verified: ${escape(completed.permissions.join(', '))}.</p>`);
  if(req.method==='GET'&&url.pathname==='/'){
   if(selection)return page(res,form('/select',`<p>Verified Instagram: <strong>@${escape(selection.account.username)}</strong> (${escape(selection.account.account_type)}).</p><p>Publishing permission granted. No video uploaded.</p><button>Connect @${escape(selection.account.username)} to Horror</button>`));
   if(loginMode==='unified')return page(res,`<p>Unified Login — Meta app ${unifiedConfiguration.appId}, configuration ${unifiedConfiguration.configId} (verified in your dashboard).</p><p>Exact HTTPS redirect: <code>${escape(callbackURL)}</code></p><p>Use Standard Access for your own account with its required app/tester role. No App Review or business verification is started here.</p>`+form('/configure',`<label>Meta App ID<input name="app_id" value="${unifiedConfiguration.appId}" readonly></label><label>Unified configuration ID<input name="config_id" value="${unifiedConfiguration.configId}" readonly></label><label>Graph API version<input name="version" placeholder="vXX.0" required pattern="v[0-9]{2}\\.[0-9]+"></label><label>Meta App Secret (Basic app settings)<input name="secret" type="password" required autocomplete="off"></label><label>Your Instagram account ID (optional if Meta returns exactly one asset)<input name="account_id" pattern="[0-9]+"></label><button>Connect Instagram</button>`));
   return page(res,`<p>Use the <strong>Instagram App ID and Instagram App Secret</strong> shown in Instagram API → API setup with Instagram Login.</p><p>Exact HTTPS redirect: <code>${escape(callbackURL)}</code></p>`+form('/configure','<label>Instagram App ID<input name="app_id" required pattern="[0-9]+"></label><label>Graph API version<input name="version" placeholder="vXX.0" required pattern="v[0-9]{2}\\.[0-9]+"></label><label>Instagram App Secret<input name="secret" type="password" required autocomplete="off"></label><button>Continue to Instagram</button>'));
  }
  if(req.method!=='POST')return page(res,'<p>Not found.</p>',404);
  demand(req.headers.origin===origin&&req.headers['content-type']?.startsWith('application/x-www-form-urlencoded'),'INVALID_LOCAL_ORIGIN');let size=0;const chunks=[];for await(const c of req){size+=c.length;demand(size<=16384,'REQUEST_TOO_LARGE');chunks.push(c);}const body=new URLSearchParams(Buffer.concat(chunks).toString('utf8'));demand(body.get('csrf')===csrf,'INVALID_CSRF');
  if(url.pathname==='/configure'){
   demand(!pending?.processing,'OAUTH_CALLBACK_PROCESSING');const appId=body.get('app_id'),version=body.get('version'),secret=body.get('secret');demand(/^\d+$/.test(appId)&&/^v\d{2}\.\d+$/.test(version)&&secret?.length>=16,'INVALID_INSTAGRAM_APP_CONFIGURATION');
   const configId=body.get('config_id'),accountId=body.get('account_id')||undefined;
   if(loginMode==='unified')demand(appId===unifiedConfiguration.appId&&configId===unifiedConfiguration.configId&&(!accountId||/^\d{1,40}$/.test(accountId)),'UNVERIFIED_UNIFIED_CONFIGURATION');
   configuration={appId,version,secret,...(loginMode==='unified'?{configId,accountId}:{})};pending={state:crypto.randomBytes(32).toString('hex'),expires:Math.min(deadline,Date.now()+600000),processing:false};selection=null;
   return go(res,(loginMode==='unified'?unifiedAuthorizationURL:authorizationURL)({appId,configId,redirectUri:callbackURL,state:pending.state}));
  }
  if(url.pathname==='/select'){
   demand(selection,'COMPLETE_INSTAGRAM_LOGIN_FIRST');const client=loginMode==='unified'?new UnifiedInstagramAPI({version:selection.version,token:selection.token,fetcher,permissions:selection.granted_permissions}):new InstagramLoginAPI({version:selection.version,token:selection.token,fetcher});const check=await client.preflight(selection.account.id);
   const credential={brand_id:'10000000-0000-4000-8000-000000000001',login_mode:loginMode,app_id:selection.app_id,...(loginMode==='unified'?{config_id:unifiedConfiguration.configId,granted_permissions:selection.granted_permissions,token_type:selection.token_type}:{}),version:selection.version,token:selection.token,account_id:check.account.id,username:check.account.username,permissions:check.permissions,expires_at:selection.expires_at,connected_at:new Date().toISOString()};
   await save(credential);completed={username:check.account.username,account_id:check.account.id,permissions:check.permissions};configuration=null;selection=null;onConnected(completed);return go(res,'/');
  }
  return page(res,'<p>Not found.</p>',404);
 }catch(error){fail(res,error);}});
 // Only this small listener is eligible for an approved HTTPS reverse proxy.
 // It has no setup, secret-entry, token-read, media, n8n or publishing routes.
 const callbackHandler=async(req,res)=>{try{
  demand(req.method==='GET'&&req.url.length<=8192,'CALLBACK_GET_ONLY');const url=new URL(req.url,callbackURL);demand(url.pathname==='/instagram/callback','CALLBACK_ROUTE_ONLY');
  demand(pending&&!pending.processing&&Date.now()<pending.expires&&Date.now()<deadline,'OAUTH_STATE_EXPIRED');const supplied=url.searchParams.getAll('state');demand(supplied.length===1&&supplied[0]===pending.state,'INVALID_OAUTH_STATE');pending.processing=true;
  demand(!url.searchParams.has('error')&&url.searchParams.getAll('code').length===1,'INSTAGRAM_LOGIN_NOT_COMPLETED');
  const code=url.searchParams.get('code'),codeHash=crypto.createHash('sha256').update(code).digest('hex');demand(code&&code.length<=4096&&!usedCodes.has(codeHash),'OAUTH_CODE_ALREADY_USED');usedCodes.add(codeHash);
  const config=configuration;configuration=null;selection={...await exchange({...config,code:url.searchParams.get('code'),redirectUri:callbackURL,fetcher}),version:config.version,app_id:config.appId};pending=null;
  return go(res,origin+'/');
 }catch(error){if(pending?.processing){pending=null;configuration=null;}fail(res,error);}};
 const callback=tls?https.createServer({...tls,minVersion:'TLSv1.2'},callbackHandler):http.createServer(callbackHandler);
 for(const server of [local,callback]){server.requestTimeout=30000;server.headersTimeout=10000;server.maxHeadersCount=40;}
 return {local,callback,startURL:origin+'/start?key='+start,redirectUri:callbackURL,localPort,callbackPort,close(){configuration=null;selection=null;pending=null;for(const server of [local,callback]){server.closeAllConnections();server.close();}}};
}
