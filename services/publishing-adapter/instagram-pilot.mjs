import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {demand,hash,exact,uuid,StudioError} from '../studio-runtime/contracts.mjs';
import {transaction,event} from '../studio-runtime/db.mjs';
import {InstagramAPI} from './instagram-api.mjs';
import {InstagramLoginAPI} from './instagram-login.mjs';
import {UnifiedInstagramAPI} from './meta-unified-login.mjs';
export const PILOT_ID='horror-existing-reel-01';
export const PILOT_SHA='499b3adda87757b164423a77ce5cd3071c5bd5b05cb8f823ac4b85b0736cc335';
export const PILOT_PATH='horror/topic-6135ef9b54a8828f41231d84d849ec1c/final/video.mp4';
export const HORROR_ID='10000000-0000-4000-8000-000000000001';
export function assertPilotBinding(p,s,a){
  demand(p.brand_id===HORROR_ID&&p.platform==='instagram'&&p.mode==='instagram_live'&&p.connection_status==='connected','INSTAGRAM_PILOT_DESTINATION_MISMATCH',403);
  demand(s.account_id===p.external_account_id&&s.media_checksum===PILOT_SHA&&p.approved_checksum===PILOT_SHA&&s.caption_checksum===hash(s.caption),'INSTAGRAM_PILOT_SCOPE_CHANGED',403);
  demand(a?.validation_status==='passed'&&a.checksum===PILOT_SHA&&a.file_reference?.root_id==='generated'&&a.file_reference.relative_path===PILOT_PATH,'INSTAGRAM_PILOT_MEDIA_MISMATCH',403);
  demand(Date.now()<new Date(s.expires_at).getTime(),'INSTAGRAM_PILOT_EXPIRED',403);
}
export function makePilot({db,credential,mediaRoot='/studio/media',apiFactory=c=>c.loginMode==='unified'?new UnifiedInstagramAPI(c):c.loginMode==='instagram'?new InstagramLoginAPI(c):new InstagramAPI(c)}){
  const api=()=>{const c=credential();demand(c.brand_id===HORROR_ID&&['facebook_business','instagram','unified'].includes(c.login_mode),'INSTAGRAM_CREDENTIAL_SCOPE',403);if(c.login_mode==='instagram'||c.expires_at)demand(Date.now()<Date.parse(c.expires_at),'INSTAGRAM_TOKEN_EXPIRED',403);return {c,client:apiFactory({version:c.version,token:c.token,loginMode:c.login_mode,permissions:c.granted_permissions??c.permissions})};};
  async function preview(){
    const {c,client}=api(),check=await client.preflight(c.account_id);
    demand(check.account.id===c.account_id,'INSTAGRAM_ACCOUNT_CHANGED',403);
    const rows=(await db.query("SELECT j.id,j.content_version,j.content_metadata,a.id AS asset_id,a.checksum,a.file_reference,a.validation_status FROM studio.content_jobs j JOIN studio.media_assets a ON a.job_id=j.id AND a.media_type='video' WHERE j.brand_id=$1 AND a.checksum=$2",[HORROR_ID,PILOT_SHA])).rows;
    demand(rows.length===1,'EXACT_PILOT_ASSET_REQUIRED',409);const j=rows[0];
    demand(j.file_reference.relative_path===PILOT_PATH&&j.validation_status==='passed','PILOT_MEDIA_NOT_VALIDATED',409);
    const caption=j.content_metadata.caption??j.content_metadata.ai_output?.metadata?.instagram_caption??j.content_metadata.ai_output?.captions?.instagram_caption;
    demand(typeof caption==='string'&&caption.length>0&&Array.from(caption).length<=2200,'EXISTING_INSTAGRAM_CAPTION_REQUIRED',409);
    return {pilot_id:PILOT_ID,brand:'Horror',login_mode:c.login_mode,permissions:check.permissions??[],job_id:j.id,content_version:j.content_version,account:{id:c.account_id,username:check.account.username,...(c.page_id?{page_id:c.page_id}:{})},video:PILOT_PATH,checksum:PILOT_SHA,caption,caption_checksum:hash(caption),quota:check.limit,uploaded:false,published:false};
  }
  async function connectAccount(){const {c,client}=api(),check=await client.preflight(c.account_id);demand(check.account.id===c.account_id,'INSTAGRAM_ACCOUNT_CHANGED');const r=await db.query("INSERT INTO studio.social_accounts(id,brand_id,platform,account_label,external_account_id,connection_status,credential_reference) VALUES($1,$2,'instagram',$3,$4,'connected','instagram-horror-v1') ON CONFLICT(brand_id,platform,external_account_id) DO UPDATE SET account_label=EXCLUDED.account_label,connection_status='connected',credential_reference=EXCLUDED.credential_reference RETURNING id,account_label,external_account_id,brand_id",[crypto.randomUUID(),HORROR_ID,'@'+check.account.username,c.account_id]);return {account:r.rows[0],uploaded:false,published:false};}
  async function approve(body){
    exact(body,['job_id','account_id','checksum','caption_checksum','caption','expires_at','owner_reference','approve_upload_and_publish'],['job_id','account_id','checksum','caption_checksum','caption','expires_at','owner_reference','approve_upload_and_publish']);
    demand(!['instagram','unified'].includes(credential().login_mode),'INSTAGRAM_CONNECTION_ONLY_NO_PUBLISHING',403);
    demand(body.approve_upload_and_publish===true&&uuid(body.job_id)&&body.checksum===PILOT_SHA&&body.caption_checksum===hash(body.caption),'EXACT_OWNER_APPROVAL_REQUIRED',403);
    demand(typeof body.owner_reference==='string'&&body.owner_reference.length>=10&&body.owner_reference.length<=2000,'OWNER_REFERENCE_REQUIRED');
    const expiry=Date.parse(body.expires_at);demand(expiry>Date.now()&&expiry<=Date.now()+3600000,'MAXIMUM_ONE_HOUR_APPROVAL');
    const view=await preview();demand(view.job_id===body.job_id&&view.account.id===body.account_id&&view.caption===body.caption,'REVIEW_CHANGED',409);
    return transaction(db,async c=>{
      // A singleton row plus an exclusive advisory lock limits this integration
      // to one approved Reel, even across concurrent requests and restarts.
      await c.query('SELECT pg_advisory_xact_lock(70630103)');
      demand(!(await c.query('SELECT id FROM studio.instagram_pilot')).rowCount,'PILOT_ALREADY_AUTHORIZED',409);
      const account=(await c.query("SELECT * FROM studio.social_accounts WHERE brand_id=$1 AND platform='instagram' AND external_account_id=$2 AND connection_status='connected'",[HORROR_ID,body.account_id])).rows[0];demand(account,'CONNECT_INSTAGRAM_FIRST',409);
      const j=(await c.query('SELECT * FROM studio.content_jobs WHERE id=$1 FOR UPDATE',[body.job_id])).rows[0];demand(j&&j.brand_id===HORROR_ID&&j.status!=='cancelled'&&j.content_version===view.content_version,'CONTENT_CHANGED',409);
      const a=(await c.query("SELECT * FROM studio.media_assets WHERE job_id=$1 AND media_type='video' AND checksum=$2 AND validation_status='passed'",[j.id,PILOT_SHA])).rows[0];demand(a,'MEDIA_CHANGED',409);
      // Explicitly renew the existing media approval, retaining the prior row in
      // an audit event. This is never invoked by discovery, preflight or scheduler.
      const old=(await c.query('SELECT * FROM studio.approvals WHERE job_id=$1 AND content_checksum=$2 AND content_version=$3 FOR UPDATE',[j.id,PILOT_SHA,j.content_version])).rows[0];
      if(old)await event(c,j.id,'instagram.media_approval_renewed',{previous:old,pilot_id:PILOT_ID});
      const approval=(await c.query("INSERT INTO studio.approvals(id,job_id,brand_id,content_checksum,content_version,reviewer_identity,decision,decision_timestamp,comments,expires_at) VALUES($1,$2,$3,$4,$5,'authenticated-local-operator','approved',now(),$6,$7) ON CONFLICT(job_id,content_checksum,content_version) DO UPDATE SET reviewer_identity=EXCLUDED.reviewer_identity,decision='approved',decision_timestamp=now(),comments=EXCLUDED.comments,expires_at=EXCLUDED.expires_at,invalidated_at=NULL RETURNING id",[crypto.randomUUID(),j.id,HORROR_ID,PILOT_SHA,j.content_version,body.owner_reference,body.expires_at])).rows[0];
      const id=crypto.randomUUID();await c.query("INSERT INTO studio.publishing_jobs(id,content_job_id,social_account_id,brand_id,approval_id,media_asset_id,approved_checksum,content_version,scheduled_at,idempotency_key,mode) VALUES($1,$2,$3,$4,$5,$6,$7,$8,now(),$9,'instagram_live')",[id,j.id,account.id,HORROR_ID,approval.id,a.id,PILOT_SHA,j.content_version,PILOT_ID]);
      await c.query('INSERT INTO studio.instagram_pilot(id,publishing_job_id,account_id,caption,caption_checksum,media_checksum,reviewer_identity,owner_reference,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[PILOT_ID,id,body.account_id,body.caption,body.caption_checksum,PILOT_SHA,'authenticated-local-operator',body.owner_reference,body.expires_at]);
      await event(c,j.id,'instagram.exact_post_approved',{publishing_job_id:id,account_id:body.account_id,caption_checksum:body.caption_checksum,media_checksum:PILOT_SHA,expires_at:body.expires_at});return {publishing_job_id:id,status:'scheduled',uploaded:false,published:false};
    });
  }
  async function publish(id){
    demand(uuid(id),'INVALID_PUBLISHING_ID');
    // No provider mutation is inside transaction(), which can retry on deadlock.
    const {c:secret,client}=api();
    demand(!['instagram','unified'].includes(secret.login_mode),'INSTAGRAM_CONNECTION_ONLY_NO_PUBLISHING',403);
    const state=await transaction(db,async c=>{
      const p=(await c.query('SELECT p.*,a.platform,a.connection_status,a.external_account_id FROM studio.publishing_jobs p JOIN studio.social_accounts a ON a.id=p.social_account_id WHERE p.id=$1 FOR UPDATE OF p',[id])).rows[0];demand(p,'PUBLISHING_JOB_NOT_FOUND',404);
      const s=(await c.query('SELECT * FROM studio.instagram_pilot WHERE id=$1 AND publishing_job_id=$2 FOR UPDATE',[PILOT_ID,id])).rows[0];demand(s,'EXACT_OWNER_APPROVAL_REQUIRED',403);
      demand(secret.account_id===s.account_id,'CREDENTIAL_ACCOUNT_CHANGED',403);
      if(s.media_id)return {done:true,media_id:s.media_id,permalink:s.permalink,job_id:p.content_job_id};
      demand(!s.consumed_at&&s.phase==='approved','PILOT_ALREADY_CONSUMED_RECONCILE_ONLY',409);
      const a=(await c.query('SELECT * FROM studio.media_assets WHERE id=$1',[p.media_asset_id])).rows[0];assertPilotBinding(p,s,a);demand(secret.account_id===s.account_id,'CREDENTIAL_ACCOUNT_CHANGED',403);
      const valid=(await c.query("SELECT j.id FROM studio.content_jobs j JOIN studio.approvals a ON a.job_id=j.id WHERE j.id=$1 AND a.id=$2 AND j.status<>'cancelled' AND j.content_version=$3 AND a.content_version=$3 AND a.content_checksum=$4 AND a.decision='approved' AND a.invalidated_at IS NULL AND a.expires_at>now()",[p.content_job_id,p.approval_id,p.content_version,PILOT_SHA])).rowCount;
      demand(valid&&p.status==='ready'&&p.verified_checksum===PILOT_SHA&&Date.now()-new Date(p.verified_at).getTime()<30000,'FRESH_APPROVED_MEDIA_REQUIRED',409);
      await c.query("UPDATE studio.instagram_pilot SET consumed_at=now(),phase='creating',updated_at=now() WHERE id=$1",[PILOT_ID]);
      await c.query("UPDATE studio.publishing_jobs SET status='dispatching',attempt_count=attempt_count+1,lease_until=now()+interval '10 minutes' WHERE id=$1",[id]);return {p,s};
    });
    if(state.done){
      // Recover a lost local completion or failed permalink GET without issuing
      // another Meta POST. The durable media ID is authoritative for this pilot.
      const permalink=state.permalink??await client.permalink(state.media_id);
      await db.query("UPDATE studio.publishing_jobs SET status='published',platform_post_id=$2,lease_until=NULL WHERE id=$1",[id,state.media_id]);
      await db.query('UPDATE studio.instagram_pilot SET permalink=$2 WHERE id=$1',[PILOT_ID,permalink]);
      await event(db,state.job_id,'publishing.succeeded',{publishing_job_id:id,platform:'instagram',post_id:state.media_id,mode:'instagram_live'},'published:'+id);
      return {...state,permalink,publicly_published:true};
    }
    try{
      const file=path.join(mediaRoot,'generated',...PILOT_PATH.split('/'));let current=path.join(mediaRoot,'generated');for(const part of PILOT_PATH.split('/')){current=path.join(current,part);demand(!fs.lstatSync(current).isSymbolicLink(),'LINK_FORBIDDEN');}
      const stat=fs.statSync(file);demand(stat.isFile()&&stat.nlink===1&&stat.size<=1000000000,'UNSAFE_MEDIA_FILE');
      const bytes=fs.readFileSync(file);demand(crypto.createHash('sha256').update(bytes).digest('hex')===PILOT_SHA,'MEDIA_CHANGED',409);
      const container=await client.create(secret.account_id,state.s.caption);
      await db.query("UPDATE studio.instagram_pilot SET container_id=$2,phase='uploading',updated_at=now() WHERE id=$1",[PILOT_ID,container.id]);
      await client.upload(container,bytes);await db.query("UPDATE studio.instagram_pilot SET phase='processing',updated_at=now() WHERE id=$1",[PILOT_ID]);
      const processingDeadline=Date.now()+180000;
      let finished=false;for(let n=0;n<60&&Date.now()<processingDeadline;n++){demand(Date.now()<new Date(state.s.expires_at).getTime(),'INSTAGRAM_PILOT_EXPIRED');const r=await client.status(container.id);if(r.status_code==='FINISHED'){finished=true;break;}demand(!['ERROR','EXPIRED','PUBLISHED'].includes(r.status_code),'META_PROCESSING_FAILED');await new Promise(r=>setTimeout(r,3000));}demand(finished,'META_PROCESSING_TIMEOUT');
      const valid=(await db.query("SELECT p.id FROM studio.publishing_jobs p JOIN studio.approvals a ON a.id=p.approval_id JOIN studio.content_jobs j ON j.id=p.content_job_id JOIN studio.media_assets m ON m.id=p.media_asset_id WHERE p.id=$1 AND p.status='dispatching' AND j.status<>'cancelled' AND j.content_version=p.content_version AND a.content_version=p.content_version AND a.content_checksum=p.approved_checksum AND a.decision='approved' AND a.invalidated_at IS NULL AND a.expires_at>now() AND m.checksum=p.approved_checksum AND m.validation_status='passed'",[id])).rowCount;demand(valid,'APPROVAL_INVALIDATED',409);
      await db.query("UPDATE studio.instagram_pilot SET phase='publishing',updated_at=now() WHERE id=$1",[PILOT_ID]);
      const mediaId=await client.publish(secret.account_id,container.id);
      // Persist the media ID before attempting the separate permalink read.
      await db.query("UPDATE studio.instagram_pilot SET media_id=$2,phase='published',updated_at=now() WHERE id=$1",[PILOT_ID,mediaId]);
      await db.query("UPDATE studio.publishing_jobs SET status='published',platform_post_id=$2,lease_until=NULL WHERE id=$1",[id,mediaId]);
      await event(db,state.p.content_job_id,'publishing.succeeded',{publishing_job_id:id,platform:'instagram',post_id:mediaId,mode:'instagram_live'},'published:'+id);
      const permalink=await client.permalink(mediaId);await db.query('UPDATE studio.instagram_pilot SET permalink=$2 WHERE id=$1',[PILOT_ID,permalink]);return {id,job_id:state.p.content_job_id,media_id:mediaId,permalink,publicly_published:true};
    }catch(error){
      // A timeout or crash is never permission to create another container/post.
      const code=error instanceof StudioError?error.code:'INSTAGRAM_LOCAL_FAILURE';
      await db.query("UPDATE studio.instagram_pilot SET phase=CASE WHEN media_id IS NULL THEN 'manual_review' ELSE 'published' END,last_error=$2,updated_at=now() WHERE id=$1",[PILOT_ID,code]);
      await db.query("UPDATE studio.publishing_jobs SET status=CASE WHEN platform_post_id IS NULL THEN 'outcome_unknown' ELSE 'published' END,last_error=$2 WHERE id=$1",[id,{code}]);throw new StudioError(code,502);
    }
  }
  return {preview,connectAccount,approve,publish};
}
