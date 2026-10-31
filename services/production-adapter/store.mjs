import crypto from 'node:crypto';
import {demand,exact,uuid,checksum,hash,canonical,jobInput} from '../studio-runtime/contracts.mjs';
import {transaction,event} from '../studio-runtime/db.mjs';
export async function job(db,id,lock=false){
  demand(uuid(id),'INVALID_JOB_ID');const r=await db.query('SELECT j.*,b.slug AS brand_slug FROM studio.content_jobs j JOIN studio.brands b ON b.id=j.brand_id WHERE j.id=$1'+(lock?' FOR UPDATE OF j':''),[id]);
  demand(r.rowCount,'JOB_NOT_FOUND',404);return r.rows[0];
}
export async function intake(db,body){
  demand(uuid(body?.brand_id),'INVALID_BRAND');const brand=(await db.query('SELECT * FROM studio.brands WHERE id=$1',[body.brand_id])).rows[0];demand(brand,'UNKNOWN_BRAND',404);
  const input=jobInput(body,brand),fingerprint=hash(canonical({brand:brand.id,type:input.source_type,source:input.source.expected_checksum??input.source})),requestHash=hash(canonical(input));
  return transaction(db,async c=>{
    const id=crypto.randomUUID(),r=await c.query(`INSERT INTO studio.content_jobs(id,brand_id,source_type,source_reference,topic,script_reference,production_settings,content_metadata,idempotency_key,source_fingerprint,request_checksum)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING RETURNING *`,[id,brand.id,input.source_type,input.source,input.topic??null,input.script_reference??null,input.production_settings,input.metadata,input.idempotency_key,fingerprint,requestHash]);
    if(!r.rowCount){const old=(await c.query('SELECT * FROM studio.content_jobs WHERE brand_id=$1 AND (idempotency_key=$2 OR source_fingerprint=$3) ORDER BY created_at LIMIT 1',[brand.id,input.idempotency_key,fingerprint])).rows[0];demand(old,'INTAKE_CONFLICT',409);if(old.idempotency_key===input.idempotency_key)demand(old.request_checksum===requestHash,'IDEMPOTENCY_PAYLOAD_CONFLICT',409);return {...old,job_id:old.id,deduplicated:true};}
    await event(c,id,'job.accepted',{brand_id:brand.id,source_type:input.source_type},'accepted:'+id);return {...r.rows[0],job_id:id,deduplicated:false};
  });
}
export async function start(db,id){return transaction(db,async c=>{
  const j=await job(c,id,true);if(['processing','produced','validated','awaiting_approval','approved','scheduled','published'].includes(j.status))return {...j,job_id:id};
  demand(j.status==='queued','JOB_NOT_STARTABLE',409);const kind=j.source_type==='existing_file'?'validate':'render';
  await c.query('INSERT INTO studio.production_tasks(id,job_id,kind) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[crypto.randomUUID(),id,kind]);
  const engine=j.source_reference.engine_project?'openmontage/'+j.source_reference.engine_project:'existing/'+id;
  await c.query("UPDATE studio.content_jobs SET status='processing',engine_job_id=$2 WHERE id=$1",[id,engine]);await event(c,id,'production.queued',{kind,engine_job_id:engine});return {...j,status:'processing',job_id:id,engine_job_id:engine};
});}
export async function cancel(db,id){return transaction(db,async c=>{
  const j=await job(c,id,true);demand(j.status!=='published','ALREADY_PUBLISHED',409);
  await c.query("UPDATE studio.content_jobs SET status='cancelled' WHERE id=$1",[id]);
  await c.query("UPDATE studio.production_tasks SET cancel_requested=true,status=CASE WHEN status='queued' THEN 'cancelled' ELSE status END WHERE job_id=$1 AND status IN ('queued','running')",[id]);
  await c.query("UPDATE studio.publishing_jobs SET status='cancelled' WHERE content_job_id=$1 AND status NOT IN ('published','failed')",[id]);await event(c,id,'job.cancelled');return {job_id:id,status:'cancelled'};
});}
export async function claim(db){return transaction(db,async c=>{
  await c.query('SELECT pg_advisory_xact_lock(70630102)');
  const busy=await c.query("SELECT id FROM studio.production_tasks WHERE status='running' LIMIT 1");if(busy.rowCount)return {idle:true};
  const r=await c.query("SELECT * FROM studio.production_tasks WHERE status='queued' AND attempts<3 AND NOT cancel_requested ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1");if(!r.rowCount)return {idle:true};
  const task=r.rows[0],j=await job(c,task.job_id),lease=crypto.randomUUID();
  await c.query("UPDATE studio.production_tasks SET status='running',attempts=attempts+1,lease_token=$2,lease_until=now()+interval '20 seconds' WHERE id=$1",[task.id,lease]);
  await event(c,j.id,'worker.claimed',{task_id:task.id,kind:task.kind});return {idle:false,task:{...task,status:'running',lease_token:lease,job:j}};
});}
export async function heartbeat(db,id,body){exact(body,['lease_token'],['lease_token']);demand(uuid(id)&&uuid(body.lease_token),'INVALID_LEASE');const r=await db.query("UPDATE studio.production_tasks SET lease_until=now()+interval '20 seconds' WHERE id=$1 AND lease_token=$2 AND status='running' RETURNING cancel_requested",[id,body.lease_token]);demand(r.rowCount,'STALE_LEASE',409);return r.rows[0];}
export async function complete(db,taskId,body){
  exact(body,['lease_token','report','logs'],['lease_token','report']);demand(uuid(taskId)&&uuid(body.lease_token),'INVALID_LEASE');demand(JSON.stringify(body.report).length<=131072&&typeof(body.logs??'')==='string'&&(body.logs??'').length<=65536,'RESULT_TOO_LARGE');
  return transaction(db,async c=>{
    const task=(await c.query('SELECT * FROM studio.production_tasks WHERE id=$1 FOR UPDATE',[taskId])).rows[0];demand(task&&task.status==='running'&&task.lease_token===body.lease_token,'STALE_LEASE',409);const j=await job(c,task.job_id,true),report=body.report;
    const cancelled=task.cancel_requested||j.status==='cancelled';
    if(cancelled){await c.query("UPDATE studio.production_tasks SET status='cancelled',result=$2,bounded_logs=$3 WHERE id=$1",[taskId,report,body.logs??'']);await event(c,j.id,'production.cancelled',{task_id:taskId});return {status:'cancelled'};}
    const valid=report.passed===true&&checksum(report.checksum)&&Number.isFinite(report.duration)&&report.duration>0&&Number.isInteger(report.width)&&report.width>0&&Number.isInteger(report.height)&&report.height>0;
    let accepted=false;
    if(task.kind==='verify_publish'){
      const pub=(await c.query('SELECT * FROM studio.publishing_jobs WHERE id=$1 FOR UPDATE',[task.publishing_job_id])).rows[0];demand(pub,'PUBLISHING_JOB_NOT_FOUND');
      if(valid&&report.ffprobe_exit_code===0&&report.checksum===pub.approved_checksum){await c.query("UPDATE studio.publishing_jobs SET status='ready',verified_checksum=$2,verified_at=now() WHERE id=$1 AND status='verifying'",[pub.id,report.checksum]);accepted=true;}
      else{await c.query("UPDATE studio.media_assets SET checksum=COALESCE($2,checksum),validation_status=$3 WHERE id=$1",[pub.media_asset_id,checksum(report.checksum)?report.checksum:null,report.code==='FILE_NOT_FOUND'?'missing':'changed']);await c.query("UPDATE studio.content_jobs SET status='manual_review',error_details=$2 WHERE id=$1",[j.id,{code:'MEDIA_CHANGED_OR_MISSING'}]);}
    }else if(valid&&report.ffprobe_exit_code===0&&report.full_decode_exit_code===0&&(!j.source_reference.expected_checksum||j.source_reference.expected_checksum===report.checksum)){
      accepted=true;
      await c.query(`INSERT INTO studio.media_assets(id,job_id,brand_id,file_reference,media_type,checksum,duration,width,height,byte_size,licence_metadata,validation_report,validation_status)
        VALUES($1,$2,$3,$4,'video',$5,$6,$7,$8,$9,$10,$11,'passed') ON CONFLICT(job_id,media_type) DO UPDATE SET checksum=EXCLUDED.checksum,file_reference=EXCLUDED.file_reference,duration=EXCLUDED.duration,width=EXCLUDED.width,height=EXCLUDED.height,byte_size=EXCLUDED.byte_size,validation_report=EXCLUDED.validation_report,validation_status='passed'`,[crypto.randomUUID(),j.id,j.brand_id,report.output_reference??j.source_reference,report.checksum,report.duration,report.width,report.height,report.bytes,report.licence_metadata??{},report]);
      await c.query("UPDATE studio.content_jobs SET status='produced',production_seconds=$2,error_details=NULL WHERE id=$1",[j.id,report.elapsed_seconds??0]);await event(c,j.id,'production.completed',{task_id:taskId,checksum:report.checksum,exit_code:0});
    }else{await c.query("UPDATE studio.content_jobs SET status='failed',error_details=$2 WHERE id=$1",[j.id,{code:report.code??'VALIDATION_FAILED',exit_code:report.exit_code??null}]);await event(c,j.id,'production.failed',{code:report.code??'VALIDATION_FAILED'});}
    await c.query("UPDATE studio.production_tasks SET status=$2,result=$3,bounded_logs=$4,lease_until=NULL WHERE id=$1",[taskId,accepted?'completed':'failed',report,body.logs??'']);
    return {job_id:j.id,status:(await job(c,j.id)).status};
  });
}
export async function quality(db,id){return transaction(db,async c=>{const j=await job(c,id,true);if(['validated','awaiting_approval','approved','scheduled','published'].includes(j.status))return {...j,job_id:id};demand(j.status==='produced','OUTPUT_NOT_READY',409);const asset=(await c.query("SELECT * FROM studio.media_assets WHERE job_id=$1 AND validation_status='passed'",[id])).rows[0];demand(asset,'VALIDATED_ASSET_REQUIRED',409);await c.query("UPDATE studio.content_jobs SET status='validated' WHERE id=$1",[id]);await event(c,id,'quality.passed',{checksum:asset.checksum});return {...j,status:'validated',job_id:id,checksum:asset.checksum};});}
export async function requestApproval(db,id){return transaction(db,async c=>{const j=await job(c,id,true);demand(['validated','awaiting_approval','approved','scheduled','published'].includes(j.status),'QUALITY_GATE_REQUIRED',409);const asset=(await c.query("SELECT * FROM studio.media_assets WHERE job_id=$1 AND validation_status='passed' AND media_type='video'",[id])).rows[0];demand(asset,'VALIDATED_ASSET_REQUIRED',409);let row=(await c.query('SELECT * FROM studio.approvals WHERE job_id=$1 AND content_checksum=$2 AND content_version=$3',[id,asset.checksum,j.content_version])).rows[0];if(!row){row=(await c.query("INSERT INTO studio.approvals(id,job_id,brand_id,content_checksum,content_version,expires_at) VALUES($1,$2,$3,$4,$5,now()+interval '24 hours') RETURNING *",[crypto.randomUUID(),id,j.brand_id,asset.checksum,j.content_version])).rows[0];await c.query("UPDATE studio.content_jobs SET status='awaiting_approval' WHERE id=$1",[id]);await event(c,id,'approval.requested',{approval_id:row.id,checksum:asset.checksum});}return {...row,job_id:id,preview_reference:asset.file_reference};});}
export async function approval(db,id){demand(uuid(id),'INVALID_APPROVAL_ID');const r=await db.query('SELECT * FROM studio.approvals WHERE id=$1',[id]);demand(r.rowCount,'APPROVAL_NOT_FOUND',404);const row=r.rows[0];return {...row,effective_decision:row.invalidated_at?'invalidated':new Date(row.expires_at).getTime()<=Date.now()?'expired':row.decision};}
export async function decide(db,id,body){
  demand(uuid(id),'INVALID_APPROVAL_ID');
  exact(body,['decision','checksum','content_version','comments','test_mock_only'],['decision','checksum','content_version']);demand(['approved','rejected'].includes(body.decision)&&checksum(body.checksum)&&Number.isInteger(body.content_version)&&body.content_version>0,'INVALID_DECISION');demand(body.comments===undefined||(typeof body.comments==='string'&&body.comments.length<=2000),'INVALID_COMMENTS');demand(body.test_mock_only===undefined||typeof body.test_mock_only==='boolean','INVALID_TEST_APPROVAL_FLAG');
  return transaction(db,async c=>{const r=await c.query('SELECT * FROM studio.approvals WHERE id=$1 FOR UPDATE',[id]);demand(r.rowCount,'APPROVAL_NOT_FOUND',404);const row=r.rows[0],j=await job(c,row.job_id,true);demand(!row.invalidated_at&&new Date(row.expires_at)>new Date(),'APPROVAL_EXPIRED_OR_INVALIDATED',409);demand(row.content_checksum===body.checksum&&row.content_version===body.content_version&&j.content_version===body.content_version,'APPROVAL_CONTENT_MISMATCH',409);const asset=(await c.query("SELECT * FROM studio.media_assets WHERE job_id=$1 AND media_type='video'",[j.id])).rows[0];demand(asset?.checksum===body.checksum&&asset.validation_status==='passed','MEDIA_CHANGED',409);if(row.decision!=='pending'){demand(row.decision===body.decision,'DECISION_ALREADY_FINAL',409);return row;}if(body.test_mock_only)demand(uuid(j.production_settings.acceptance_run_id),'TEST_APPROVAL_REQUIRES_TEST_JOB',403);const identity=body.test_mock_only?'explicit-mock-acceptance-test':'authenticated-local-operator';const result=(await c.query('UPDATE studio.approvals SET decision=$2,reviewer_identity=$3,decision_timestamp=now(),comments=$4 WHERE id=$1 RETURNING *',[id,body.decision,identity,body.comments??''])).rows[0];await c.query('UPDATE studio.content_jobs SET status=$2 WHERE id=$1',[j.id,body.decision]);await event(c,j.id,'approval.'+body.decision,{approval_id:id,checksum:body.checksum,reviewer:identity});return result;});
}
