// Unified Login for the dashboard-selected Instagram asset configuration.
// Read-only Graph client: no Pages discovery, media upload or publishing methods.
import {demand,StudioError} from '../studio-runtime/contracts.mjs';
import {redirectURL,parseInstagramJSON} from './instagram-login.mjs';
export const unifiedConfiguration={appId:'1113677711534120',configId:'1470617858256660'};
export const unifiedPermissions=['instagram_basic','instagram_content_publish'];
export function unifiedAuthorizationURL({appId,configId,redirectUri,state}){
 demand(appId===unifiedConfiguration.appId&&configId===unifiedConfiguration.configId,'UNVERIFIED_UNIFIED_CONFIGURATION');
 demand(/^[a-f0-9]{64}$/.test(state),'SECURE_ONE_TIME_STATE_REQUIRED');
 const url=new URL('https://www.facebook.com/dialog/oauth');url.search=new URLSearchParams({client_id:appId,config_id:configId,display:'popup',override_default_response_type:'true',redirect_uri:redirectURL(redirectUri),response_type:'code',state,prompt:'login'}).toString();return url.href;
}
async function readResponse(response){let data;try{const text=await response.text();demand(Buffer.byteLength(text)<=1048576,'META_RESPONSE_TOO_LARGE');data=parseInstagramJSON(text);}catch{throw new StudioError('INVALID_UNIFIED_RESPONSE',502);}demand(response.ok&&!data.error,'UNIFIED_REQUEST_REJECTED',502);return data;}
export class UnifiedInstagramAPI {
 constructor({version,token,fetcher=fetch,permissions=[]}){demand(/^v\d{2}\.\d+$/.test(version),'META_VERSION_REQUIRED');demand(typeof token==='string'&&token.length>20,'UNIFIED_TOKEN_REQUIRED');this.version=version;this.token=token;this.fetcher=fetcher;this.permissions=permissions;}
 async request(endpoint,params={}){demand(/^\d{1,40}(?:\/content_publishing_limit)?$/.test(endpoint),'UNIFIED_READ_ONLY_ENDPOINT_REQUIRED');const url=new URL(`https://graph.facebook.com/${this.version}/${endpoint}`);url.search=new URLSearchParams(params).toString();let r;try{r=await this.fetcher(url,{method:'GET',redirect:'error',headers:{authorization:'Bearer '+this.token},signal:AbortSignal.timeout(20000)});}catch{throw new StudioError('UNIFIED_READ_FAILED',502);}return readResponse(r);}
 async preflight(accountId){demand(/^\d{1,40}$/.test(accountId),'INSTAGRAM_ASSET_ID_REQUIRED');demand(unifiedPermissions.every(p=>this.permissions.includes(p)),'UNIFIED_PUBLISHING_PERMISSION_NOT_GRANTED',403);const account=await this.request(accountId,{fields:'id,username,account_type'});demand(account.id===accountId&&typeof account.username==='string','UNIFIED_INSTAGRAM_IDENTITY_NOT_VERIFIED');demand(['BUSINESS','CREATOR','MEDIA_CREATOR'].includes(account.account_type),'PROFESSIONAL_INSTAGRAM_REQUIRED',403);const limit=await this.request(accountId+'/content_publishing_limit',{fields:'quota_usage,config'});return {account,permissions:unifiedPermissions,limit,uploaded:false,published:false};}
}
export async function exchangeUnifiedCode({appId,configId,secret,code,redirectUri,version,accountId,fetcher=fetch}){
 unifiedAuthorizationURL({appId,configId,redirectUri,state:'0'.repeat(64)});
 demand(typeof secret==='string'&&secret.length>=16&&typeof code==='string'&&code.length>0&&code.length<=4096&&/^v\d{2}\.\d+$/.test(version),'INVALID_UNIFIED_APP_CONFIGURATION');
 let response;try{response=await fetcher(`https://graph.facebook.com/${version}/oauth/access_token`,{method:'POST',redirect:'error',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:appId,client_secret:secret,redirect_uri:redirectURL(redirectUri),code}).toString(),signal:AbortSignal.timeout(20000)});}catch{throw new StudioError('UNIFIED_TOKEN_EXCHANGE_FAILED',502);}
 const result=await readResponse(response);demand(typeof result.access_token==='string'&&result.access_token.length>20,'INVALID_UNIFIED_TOKEN');
 const debugURL=new URL(`https://graph.facebook.com/${version}/debug_token`);debugURL.searchParams.set('input_token',result.access_token);
 try{response=await fetcher(debugURL,{method:'GET',redirect:'error',headers:{authorization:'Bearer '+appId+'|'+secret},signal:AbortSignal.timeout(20000)});}catch{throw new StudioError('UNIFIED_TOKEN_VERIFICATION_FAILED',502);}
 const {data:debug}=await readResponse(response);demand(debug?.is_valid===true&&String(debug.app_id)===appId,'UNIFIED_TOKEN_APP_MISMATCH');
 demand(unifiedPermissions.every(p=>debug.scopes?.includes(p)),'UNIFIED_PUBLISHING_PERMISSION_NOT_GRANTED',403);
 const targets=[...new Set((debug.granular_scopes??[]).filter(s=>unifiedPermissions.includes(s.scope)).flatMap(s=>s.target_ids??[]))];
 if(accountId)demand(/^\d{1,40}$/.test(accountId)&&(!targets.length||targets.includes(accountId)),'INSTAGRAM_ASSET_NOT_AUTHORIZED',403);
 else demand(targets.length===1,'ENTER_OWN_INSTAGRAM_ASSET_ID_AND_REAUTHORIZE');
 const selected=accountId??targets[0],api=new UnifiedInstagramAPI({version,token:result.access_token,permissions:debug.scopes,fetcher}),check=await api.preflight(selected);
 const expiry=Number(debug.expires_at??0);demand(expiry===0||expiry*1000>Date.now(),'UNIFIED_TOKEN_EXPIRED');
 return {token:result.access_token,...check,granted_permissions:debug.scopes,expires_at:expiry?new Date(expiry*1000).toISOString():null,token_type:debug.type??'SYSTEM_USER',login_mode:'unified',config_id:configId};
}
