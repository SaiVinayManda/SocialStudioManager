// Instagram Login only. This module deliberately has no media/upload/publish API.
import {demand,StudioError} from '../studio-runtime/contracts.mjs';
export const instagramLoginPermissions=['instagram_business_basic','instagram_business_content_publish'];
export function redirectURL(value){let url;try{url=new URL(value);}catch{throw new StudioError('HTTPS_CALLBACK_REQUIRED');}demand(url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname==='/instagram/callback','HTTPS_CALLBACK_REQUIRED');return url.href;}
export function authorizationURL({appId,redirectUri,state}){
 demand(/^\d+$/.test(appId)&&/^[a-f0-9]{64}$/.test(state),'INVALID_INSTAGRAM_OAUTH_CONFIGURATION');
 const url=new URL('https://www.instagram.com/oauth/authorize');url.search=new URLSearchParams({client_id:appId,redirect_uri:redirectURL(redirectUri),response_type:'code',scope:instagramLoginPermissions.join(','),state,enable_fb_login:'0',force_authentication:'1'}).toString();return url.href;
}
export function parseInstagramJSON(text){return JSON.parse(text,(key,value,context)=>{if(['id','user_id'].includes(key)&&typeof value==='number'){demand(/^\d+$/.test(context?.source??''),'UNSAFE_INSTAGRAM_IDENTIFIER');return context.source;}return value;});}
async function jsonResponse(response){let data;try{const text=await response.text();demand(Buffer.byteLength(text)<=1048576,'INSTAGRAM_RESPONSE_TOO_LARGE');data=parseInstagramJSON(text);}catch{throw new StudioError('INVALID_INSTAGRAM_RESPONSE',502);}demand(response.ok&&!data.error,'INSTAGRAM_REQUEST_REJECTED',502);return data;}
export class InstagramLoginAPI {
 constructor({version,token,fetcher=fetch}){demand(/^v\d{2}\.\d+$/.test(version),'META_VERSION_REQUIRED');demand(typeof token==='string'&&token.length>20,'INSTAGRAM_TOKEN_REQUIRED');this.version=version;this.token=token;this.fetcher=fetcher;}
 async request(endpoint,params={}){
  demand(/^(?:me(?:\/permissions)?|\d{1,40}(?:\/(?:permissions|content_publishing_limit))?)$/.test(endpoint),'INSTAGRAM_READ_ONLY_ENDPOINT_REQUIRED');
  const url=new URL(`https://graph.instagram.com/${this.version}/${endpoint}`);url.search=new URLSearchParams(params).toString();
  let response;try{response=await this.fetcher(url,{method:'GET',redirect:'error',headers:{authorization:'Bearer '+this.token},signal:AbortSignal.timeout(20000)});}catch{throw new StudioError('INSTAGRAM_READ_FAILED',502);}return jsonResponse(response);
 }
 async preflight(accountId){
  if(accountId)demand(/^\d{1,40}$/.test(accountId),'INVALID_INSTAGRAM_ID');
  const identity=await this.request(accountId??'me',{fields:'user_id,username,account_type'});
  const id=identity.user_id??identity.id;demand(typeof id==='string'&&/^\d{1,40}$/.test(id)&&typeof identity.username==='string','INSTAGRAM_IDENTITY_NOT_VERIFIED');
  if(accountId)demand(id===accountId,'INSTAGRAM_ACCOUNT_CHANGED',403);
  demand(['BUSINESS','CREATOR','MEDIA_CREATOR'].includes(identity.account_type),'PROFESSIONAL_INSTAGRAM_REQUIRED',403);
  const permissionResult=await this.request(id+'/permissions');
  const granted=(permissionResult.data??[]).filter(p=>p.status==='granted').map(p=>p.permission);
  demand(instagramLoginPermissions.every(p=>granted.includes(p)),'INSTAGRAM_PUBLISHING_PERMISSION_NOT_GRANTED',403);
  const limit=await this.request(id+'/content_publishing_limit',{fields:'quota_usage,config'});
  return {account:{id,username:identity.username,account_type:identity.account_type},permissions:instagramLoginPermissions,limit,uploaded:false,published:false};
 }
}
export async function exchangeInstagramCode({appId,secret,code,redirectUri,version,fetcher=fetch}){
 demand(/^\d+$/.test(appId)&&typeof secret==='string'&&secret.length>=16&&typeof code==='string'&&code.length>0&&code.length<=4096,'INVALID_INSTAGRAM_OAUTH_CONFIGURATION');
 let response;try{response=await fetcher('https://api.instagram.com/oauth/access_token',{method:'POST',redirect:'error',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:appId,client_secret:secret,grant_type:'authorization_code',redirect_uri:redirectURL(redirectUri),code}).toString(),signal:AbortSignal.timeout(20000)});}catch{throw new StudioError('INSTAGRAM_TOKEN_EXCHANGE_FAILED',502);}
 const raw=await jsonResponse(response);demand(!(raw.access_token&&raw.data),'AMBIGUOUS_INSTAGRAM_TOKEN_RESPONSE');
 const short=raw.access_token?raw:Array.isArray(raw.data)&&raw.data.length===1?raw.data[0]:null;
 demand(short&&typeof short.access_token==='string'&&typeof short.user_id==='string'&&/^\d{1,40}$/.test(short.user_id),'INVALID_INSTAGRAM_TOKEN_RESPONSE');
 // Official long-lived-token exchange: query secrets never reach local logs,
 // the browser, n8n, command arguments, connection receipts or database rows.
 const url=new URL('https://graph.instagram.com/access_token');url.search=new URLSearchParams({grant_type:'ig_exchange_token',client_secret:secret,access_token:short.access_token}).toString();
 try{response=await fetcher(url,{method:'GET',redirect:'error',signal:AbortSignal.timeout(20000)});}catch{throw new StudioError('INSTAGRAM_LONG_TOKEN_EXCHANGE_FAILED',502);}
 const long=await jsonResponse(response);demand(typeof long.access_token==='string'&&Number.isFinite(long.expires_in)&&long.expires_in>0,'INVALID_INSTAGRAM_LONG_TOKEN');
 const client=new InstagramLoginAPI({version,token:long.access_token,fetcher}),preflight=await client.preflight(short.user_id);
 return {token:long.access_token,expires_at:new Date(Date.now()+long.expires_in*1000).toISOString(),...preflight};
}
