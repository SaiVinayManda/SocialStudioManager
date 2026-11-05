// Official Meta transport. Creating a container and transferring bytes are uploads;
// callers must durably consume the exact owner approval BEFORE calling either.
import {demand,StudioError} from '../studio-runtime/contracts.mjs';
export const instagramPermissions=['pages_show_list','pages_read_engagement','instagram_basic','instagram_content_publish'];
const identifier=value=>demand(typeof value==='string'&&/^\d{1,40}$/.test(value),'INVALID_META_ID');
export class InstagramAPI {
  constructor({version,token,fetcher=fetch}){
    demand(/^v\d{2}\.\d+$/.test(version),'META_VERSION_REQUIRED');
    demand(typeof token==='string'&&token.length>20,'META_TOKEN_REQUIRED');
    this.version=version;this.token=token;this.fetcher=fetcher;
  }
  async request(endpoint,{method='GET',params={}}={}){
    demand(/^(me(?:\/accounts|\/permissions)?|\d{1,40}(?:\/(?:media|media_publish|content_publishing_limit))?)$/.test(endpoint),'INVALID_META_ENDPOINT');
    const url=new URL(`https://graph.facebook.com/${this.version}/${endpoint}`);
    if(method==='GET')url.search=new URLSearchParams(params).toString();
    let response,data;
    try{response=await this.fetcher(url,{method,redirect:'error',headers:{authorization:'Bearer '+this.token,...(method==='POST'?{'content-type':'application/x-www-form-urlencoded'}:{})},...(method==='POST'?{body:new URLSearchParams(params).toString()}:{}),signal:AbortSignal.timeout(20000)});data=await response.json();}
    catch{throw new StudioError(method==='POST'?'META_OUTCOME_UNKNOWN':'META_READ_FAILED',502);}
    // Never propagate provider text, URLs, response headers or token-bearing errors.
    demand(response.ok&&!data.error,'META_REQUEST_REJECTED',502);return data;
  }
  async discover(){
    const permission=await this.request('me/permissions');
    demand(instagramPermissions.every(p=>permission.data?.some(x=>x.permission===p&&x.status==='granted')),'META_PERMISSIONS_MISSING',403);
    const accounts=[];let after;
    for(let page=0;page<20;page++){
      const result=await this.request('me/accounts',{params:{fields:'id,name,access_token,tasks,instagram_business_account{id,username,name}',limit:'100',...(after?{after}:{})}});
      for(const p of result.data??[])if(p.instagram_business_account)accounts.push({page_id:p.id,page_name:p.name,page_token:p.access_token,account_id:p.instagram_business_account.id,username:p.instagram_business_account.username});
      if(!result.paging?.next)return accounts;
      after=result.paging?.cursors?.after;demand(after,'META_PAGINATION_FAILED');
    }
    throw new StudioError('META_TOO_MANY_PAGES');
  }
  async preflight(accountId){identifier(accountId);const account=await this.request(accountId,{params:{fields:'id,username,account_type'}});const limit=await this.request(accountId+'/content_publishing_limit',{params:{fields:'quota_usage,config'}});return {account,limit,uploaded:false,published:false};}
  async create(accountId,caption){identifier(accountId);demand(typeof caption==='string'&&Array.from(caption).length<=2200,'INVALID_INSTAGRAM_CAPTION');const r=await this.request(accountId+'/media',{method:'POST',params:{media_type:'REELS',upload_type:'resumable',caption,share_to_feed:'true'}});identifier(r.id);return {id:r.id,uri:this.uploadURL(r.uri,r.id)};}
  uploadURL(uri,containerId){identifier(containerId);let url;try{url=new URL(uri);}catch{throw new StudioError('INVALID_META_UPLOAD_URI');}demand(url.protocol==='https:'&&url.hostname==='rupload.facebook.com'&&!url.port&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname===`/ig-api-upload/${this.version}/${containerId}`,'INVALID_META_UPLOAD_URI');return url.href;}
  async upload(container,bytes){demand(Buffer.isBuffer(bytes)&&bytes.length>0&&bytes.length<=1000000000,'INVALID_MEDIA_SIZE');const uri=this.uploadURL(container.uri,container.id);let response,data;try{response=await this.fetcher(uri,{method:'POST',redirect:'error',headers:{authorization:'OAuth '+this.token,offset:'0',file_size:String(bytes.length),'content-type':'application/octet-stream'},body:bytes,signal:AbortSignal.timeout(60000)});data=await response.json();}catch{throw new StudioError('META_OUTCOME_UNKNOWN',502);}demand(response.ok&&data.success===true,'META_UPLOAD_FAILED',502);}
  async status(containerId){identifier(containerId);return this.request(containerId,{params:{fields:'status_code,status'}});}
  async publish(accountId,containerId){identifier(accountId);identifier(containerId);const r=await this.request(accountId+'/media_publish',{method:'POST',params:{creation_id:containerId}});identifier(r.id);return r.id;}
  async permalink(mediaId){identifier(mediaId);const r=await this.request(mediaId,{params:{fields:'id,permalink'}});let url;try{url=new URL(r.permalink);}catch{throw new StudioError('META_PERMALINK_UNAVAILABLE');}demand(url.protocol==='https:'&&['www.instagram.com','instagram.com'].includes(url.hostname)&&/^\/(?:reel|p)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)&&!url.username&&!url.password&&!url.search&&!url.hash,'INVALID_META_PERMALINK');return url.href;}
}
