// Actual PostgreSQL behavior in an outer rollback transaction. Media reports in
// these negative/recovery tests are labelled fixtures, not rendered video QC.
import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {database} from '../studio-runtime/db.mjs';import * as production from './store.mjs';import * as publishing from '../publishing-adapter/store.mjs';import {recover} from '../studio-runtime/operations.mjs';
const pool=await database(),client=await pool.connect(),checks=[];let serial=0;await client.query('BEGIN');
const db={query:(...a)=>client.query(...a),connect:async()=>{const save='generation_'+(++serial);return {release(){},query:(sql,a)=>client.query(sql==='BEGIN'?'SAVEPOINT '+save:sql==='COMMIT'?'RELEASE SAVEPOINT '+save:sql==='ROLLBACK'?'ROLLBACK TO SAVEPOINT '+save:sql,a)};}};
const brand='10000000-0000-4000-8000-000000000001',run=crypto.randomUUID();
async function fixture(kind='render'){const id=crypto.randomUUID();return production.intake(db,{brand_id:brand,source_type:kind==='render'?'approved_openmontage':'existing_file',source:{root_id:'generated',relative_path:'horror/sql-fixture-'+id+'/final/test.mp4',...(kind==='render'?{engine_project:'sql-fixture-'+id}:{expected_checksum:crypto.createHash('sha256').update(id).digest('hex')})},idempotency_key:'sql-generated:'+id,production_settings:{acceptance_run_id:run}});}
const check=async(name,fn)=>{await fn();checks.push({name,passed:true});};
const valid={passed:true,checksum:'1'.repeat(64),duration:5,width:1080,height:1920,bytes:100,ffprobe_exit_code:0,full_decode_exit_code:0};
try{
  const failed=await fixture();await production.start(db,failed.id);const f=await production.claim(db);
  await production.complete(db,f.task.id,{lease_token:f.task.lease_token,report:{passed:false,code:'TEST_RENDER_EXIT_NONZERO'},logs:'Explicit simulated render failure in PostgreSQL rollback test'});
  await check('failed render persists error and cannot enter QC or approval',async()=>{assert.equal((await production.job(db,failed.id)).status,'failed');assert((await production.job(db,failed.id)).error_details);await assert.rejects(production.quality(db,failed.id),/OUTPUT_NOT_READY/);await assert.rejects(production.requestApproval(db,failed.id),/QUALITY_GATE/);});
  const badQc=await fixture('validate');await production.start(db,badQc.id);const q=await production.claim(db);await production.complete(db,q.task.id,{lease_token:q.task.lease_token,report:{...valid,full_decode_exit_code:1}});
  await check('failed full-decode report creates no media and cannot schedule',async()=>{assert.equal((await db.query('SELECT count(*)::int n FROM studio.media_assets WHERE job_id=$1',[badQc.id])).rows[0].n,0);await assert.rejects(publishing.schedule(db,badQc.id),/APPROVAL_REQUIRED/);});
  const interruption=await fixture();await production.start(db,interruption.id);const r=await production.claim(db);await db.query("UPDATE studio.production_tasks SET lease_until=now()-interval '1 second' WHERE id=$1",[r.task.id]);await recover(db);
  await check('expired render lease preserves job for manual recovery without blind rerender',async()=>{assert.equal((await production.job(db,interruption.id)).status,'manual_review');assert.equal((await db.query('SELECT status FROM studio.production_tasks WHERE id=$1',[r.task.id])).rows[0].status,'interrupted');});
  const interruptedQc=await fixture('validate');await production.start(db,interruptedQc.id);const v=await production.claim(db);await db.query("UPDATE studio.production_tasks SET lease_until=now()-interval '1 second' WHERE id=$1",[v.task.id]);await recover(db);
  await check('interrupted read-only validation requeues within its retry bound',async()=>assert.equal((await db.query('SELECT status FROM studio.production_tasks WHERE id=$1',[v.task.id])).rows[0].status,'queued'));await production.cancel(db,interruptedQc.id);
  const cancelled=await fixture();await production.start(db,cancelled.id);const c=await production.claim(db);await production.cancel(db,cancelled.id);await production.complete(db,c.task.id,{lease_token:c.task.lease_token,report:valid});
  await check('cancellation wins over late worker success',async()=>assert.equal((await production.job(db,cancelled.id)).status,'cancelled'));
  const approved=await fixture();await production.start(db,approved.id);const a=await production.claim(db);await production.complete(db,a.task.id,{lease_token:a.task.lease_token,report:valid});await production.quality(db,approved.id);const review=await production.requestApproval(db,approved.id);
  await check('unapproved media cannot schedule',async()=>assert.rejects(publishing.schedule(db,approved.id),/APPROVAL_REQUIRED/));
  await check('approval with wrong checksum fails',async()=>assert.rejects(production.decide(db,review.id,{decision:'approved',checksum:'2'.repeat(64),content_version:review.content_version,test_mock_only:true}),/CONTENT_MISMATCH/));
  await production.decide(db,review.id,{decision:'approved',checksum:valid.checksum,content_version:review.content_version,test_mock_only:true});await publishing.schedule(db,approved.id);
  await db.query("UPDATE studio.media_assets SET checksum=$2 WHERE job_id=$1",[approved.id,'3'.repeat(64)]);
  await check('changed media checksum invalidates approval and prevents dispatch',async()=>{assert.equal((await production.approval(db,review.id)).effective_decision,'invalidated');assert.equal((await publishing.claimDue(db)).idle,true);});
  console.log(JSON.stringify({passed:true,actual_postgres:true,rolled_back:true,media_reports:'explicit synthetic fixtures; no claim of rendered QC',checks}));
}catch(error){console.log(JSON.stringify({passed:false,error:error.code??error.message,checks}));process.exitCode=1;}
finally{await client.query('ROLLBACK');client.release();await pool.end();}
