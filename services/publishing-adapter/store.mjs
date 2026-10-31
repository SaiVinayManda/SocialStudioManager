import crypto from 'node:crypto';
import {demand,uuid,retryDelay} from '../studio-runtime/contracts.mjs';
import {transaction,event} from '../studio-runtime/db.mjs';
import {job} from '../production-adapter/store.mjs';
import {adapters,validateDestination} from './providers.mjs';
export async function publishingJob(db,id,lock=false){demand(uuid(id),'INVALID_PUBLISHING_ID');const r=await db.query('SELECT p.*,a.platform,a.external_account_id,a.connection_status,a.account_label FROM studio.publishing_jobs p JOIN studio.social_accounts a ON a.id=p.social_account_id WHERE p.id=$1'+(lock?' FOR UPDATE OF p':''),[id]);demand(r.rowCount,'PUBLISHING_JOB_NOT_FOUND',404);return r.rows[0];}
// A durable approved job must not depend on a particular in-memory n8n Wait surviving.
export async function scheduleNextApproved(db){const row=(await db.query(`SELECT j.id FROM studio.content_jobs j WHERE j.status='approved' AND EXISTS(SELECT 1 FROM studio.approvals a JOIN studio.media_assets m ON m.job_id=j.id AND m.media_type='video' WHERE a.job_id=j.id AND a.decision='approved' AND a.invalidated_at IS NULL AND a.expires_at>now() AND a.content_version=j.content_version AND a.content_checksum=m.checksum AND m.validation_status='passed') ORDER BY j.updated_at LIMIT 1`)).rows[0];if(row)await schedule(db,row.id);}
export async function schedule(db,id){return transaction(db,async c=>{
  const j=await job(c,id,true);demand(['approved','scheduled','published'].includes(j.status),'APPROVAL_REQUIRED',409);
  const asset=(await c.query("SELECT * FROM studio.media_assets WHERE job_id=$1 AND media_type='video' AND validation_status='passed'",[id])).rows[0];demand(asset,'VALIDATED_ASSET_REQUIRED',409);
  const approval=(await c.query("SELECT * FROM studio.approvals WHERE job_id=$1 AND content_checksum=$2 AND content_version=$3 AND decision='approved' AND invalidated_at IS NULL AND expires_at>now()",[id,asset.checksum,j.content_version])).rows[0];demand(approval,'CURRENT_APPROVAL_REQUIRED',409);
  const accounts=(await c.query("SELECT * FROM studio.social_accounts WHERE brand_id=$1 AND connection_status='mock' ORDER BY platform",[j.brand_id])).rows.filter(a=>(j.production_settings.platforms??['youtube','instagram','facebook']).includes(a.platform));
  demand(accounts.length===(j.production_settings.platforms??['youtube','instagram','facebook']).length,'DESTINATION_UNAVAILABLE',409);
  for(const a of accounts){validateDestination(a,j.brand_id);const key=[j.id,j.content_version,a.id,asset.checksum].join(':');await c.query(`INSERT INTO studio.publishing_jobs(id,content_job_id,social_account_id,brand_id,approval_id,media_asset_id,approved_checksum,content_version,scheduled_at,idempotency_key)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(content_job_id,social_account_id,content_version) DO NOTHING`,[crypto.randomUUID(),j.id,a.id,j.brand_id,approval.id,asset.id,asset.checksum,j.content_version,j.production_settings.scheduled_at??new Date().toISOString(),key]);}
  if(j.status!=='published')await c.query("UPDATE studio.content_jobs SET status='scheduled' WHERE id=$1",[id]);await event(c,id,'publishing.scheduled',{destinations:accounts.map(a=>a.platform)},'scheduled:'+id+':'+j.content_version);
  return (await c.query('SELECT id,status,scheduled_at FROM studio.publishing_jobs WHERE content_job_id=$1 ORDER BY id',[id])).rows;
});}
export async function claimDue(db){return transaction(db,async c=>{
  const r=await c.query(`SELECT p.* FROM studio.publishing_jobs p
    JOIN studio.approvals a ON a.id=p.approval_id JOIN studio.media_assets m ON m.id=p.media_asset_id JOIN studio.content_jobs j ON j.id=p.content_job_id
    WHERE p.status IN ('scheduled','retry_wait') AND p.scheduled_at<=now() AND (p.next_attempt_at IS NULL OR p.next_attempt_at<=now()) AND p.attempt_count<3
      AND a.decision='approved' AND a.invalidated_at IS NULL AND a.expires_at>now() AND a.content_checksum=p.approved_checksum
      AND a.content_version=j.content_version AND p.content_version=j.content_version AND m.checksum=p.approved_checksum AND m.validation_status='passed' AND j.status<>'cancelled'
    ORDER BY p.scheduled_at,p.id FOR UPDATE OF p SKIP LOCKED LIMIT 1`);
  if(!r.rowCount)return {idle:true};const p=r.rows[0],lease=crypto.randomUUID();
  await c.query("UPDATE studio.publishing_jobs SET status='verifying',lease_token=$2,lease_until=now()+interval '2 minutes' WHERE id=$1",[p.id,lease]);
  await c.query("INSERT INTO studio.production_tasks(id,job_id,publishing_job_id,kind) VALUES($1,$2,$3,'verify_publish') ON CONFLICT(job_id,kind,publishing_job_id) DO UPDATE SET status='queued',cancel_requested=false,lease_token=NULL,lease_until=NULL WHERE studio.production_tasks.status NOT IN ('running')",[crypto.randomUUID(),p.content_job_id,p.id]);
  await event(c,p.content_job_id,'publishing.verification_requested',{publishing_job_id:p.id});return {...await publishingJob(c,p.id),idle:false};
});}
export async function publish(db,id,platform){return transaction(db,async c=>{
  const p=await publishingJob(c,id,true),j=await job(c,p.content_job_id,true);demand(p.platform===platform,'PLATFORM_DESTINATION_MISMATCH',403);validateDestination(p,p.brand_id);
  if(p.status==='published')return {...p,deduplicated:true,publicly_published:false};
  demand(p.status==='ready','PUBLISH_NOT_READY',409);demand(p.attempt_count<3,'RETRY_LIMIT',409);
  const approval=(await c.query("SELECT * FROM studio.approvals WHERE id=$1 AND decision='approved' AND invalidated_at IS NULL AND expires_at>now()",[p.approval_id])).rows[0];
  const asset=(await c.query('SELECT * FROM studio.media_assets WHERE id=$1',[p.media_asset_id])).rows[0];
  demand(approval&&j.status!=='cancelled'&&approval.content_checksum===asset.checksum&&p.approved_checksum===asset.checksum&&asset.validation_status==='passed'&&approval.content_version===j.content_version&&p.content_version===j.content_version,'APPROVAL_INVALIDATED',409);
  demand(p.verified_checksum===p.approved_checksum&&Date.now()-new Date(p.verified_at).getTime()<30000,'FRESH_CHECKSUM_REQUIRED',409);
  await c.query("UPDATE studio.publishing_jobs SET status='dispatching',attempt_count=attempt_count+1 WHERE id=$1",[id]);
  const old=(await c.query('SELECT * FROM studio.mock_receipts WHERE idempotency_key=$1',[p.idempotency_key])).rows[0];
  const receipt=old?.receipt??await adapters[platform].publish(p,p);
  await c.query('INSERT INTO studio.mock_receipts(idempotency_key,platform,post_id,receipt) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[p.idempotency_key,platform,receipt.post_id,receipt]);
  await c.query("UPDATE studio.publishing_jobs SET status='published',platform_post_id=$2,lease_until=NULL,last_error=NULL WHERE id=$1",[id,receipt.post_id]);
  await event(c,j.id,'publishing.succeeded',{publishing_job_id:id,platform,post_id:receipt.post_id,mode:'mock'},'published:'+id);
  const pending=(await c.query("SELECT id FROM studio.publishing_jobs WHERE content_job_id=$1 AND content_version=$2 AND status<>'published' LIMIT 1",[j.id,j.content_version])).rowCount;
  if(!pending)await c.query("UPDATE studio.content_jobs SET status='published' WHERE id=$1",[j.id]);return {...await publishingJob(c,id),receipt,publicly_published:false};
});}
export async function reconcile(db,id){return transaction(db,async c=>{const p=await publishingJob(c,id,true);if(p.status==='published')return p;demand(['outcome_unknown','manual_review'].includes(p.status),'NOT_RECONCILABLE',409);const row=(await c.query('SELECT * FROM studio.mock_receipts WHERE idempotency_key=$1',[p.idempotency_key])).rows[0];const result=await adapters[p.platform].reconcile(row?.receipt);if(result.status==='published'){await c.query("UPDATE studio.publishing_jobs SET status='published',platform_post_id=$2,lease_until=NULL WHERE id=$1",[id,row.post_id]);await event(c,p.content_job_id,'publishing.reconciled',{publishing_job_id:id,post_id:row.post_id});}else await c.query("UPDATE studio.publishing_jobs SET status='manual_review',last_error=$2 WHERE id=$1",[id,{code:'UNKNOWN_OUTCOME_DO_NOT_REUPLOAD'}]);return {...await publishingJob(c,id),reconciliation:result};});}
export async function recordFailure(db,id,{code,retryable=false,retry_after=0,outcome_unknown=false}){return transaction(db,async c=>{const p=await publishingJob(c,id,true);const state=outcome_unknown?'outcome_unknown':retryable&&p.attempt_count<3?'retry_wait':'failed';const delay=retryDelay(p.attempt_count,retry_after);await c.query('UPDATE studio.publishing_jobs SET status=$2,last_error=$3,next_attempt_at=now()+($4::text||\' seconds\')::interval WHERE id=$1',[id,state,{code},delay]);await event(c,p.content_job_id,'publishing.failed',{publishing_job_id:id,code,status:state});return {status:state};});}
