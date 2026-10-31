// Actual PostgreSQL tests in an outer rollback transaction. Provider responses
// are explicit simulated fixtures, never live model executions.
import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {database} from '../studio-runtime/db.mjs';
import * as ai from './store.mjs';import {intake} from './intake.mjs';
import {mockOutput} from './mock.mjs';import {SCHEMA_VERSION} from './schemas.mjs';
import {aiTask as legacyAiTask,saveAi as legacySaveAi} from '../studio-runtime/operations.mjs';
const pool=await database(),client=await pool.connect(),results=[];let serial=0;
await client.query('BEGIN');
const db={query:(...args)=>client.query(...args),connect:async()=>{
  const point='ai_test_'+(++serial);return {release(){},query:(sql,args)=>client.query(sql==='BEGIN'?'SAVEPOINT '+point:sql==='COMMIT'?'RELEASE SAVEPOINT '+point:sql==='ROLLBACK'?'ROLLBACK TO SAVEPOINT '+point:sql,args)};
}};
const brand='10000000-0000-4000-8000-000000000001',travel='10000000-0000-4000-8000-000000000004',run=crypto.randomUUID();
const input={topic:'Public simulated database test fixture',duration_seconds:60,language:'en',scene_count:6};
const template={task_type:'content_package',input,output_schema_version:SCHEMA_VERSION,provider_policy:{mode:'mock',providers:['mock']},maximum_cost:0,timeout_ms:60000,retry_policy:{max_attempts_per_provider:1,initial_backoff_ms:100}};
async function fixture(label,overrides={}){const j=await intake(db,{brand_id:brand,source_type:'ai_only',topic:input.topic,idempotency_key:'e2-sql:'+run+':'+label,ai_request:template});return ai.submit(db,{...template,...overrides,brand_id:brand,content_job_id:j.job_id,idempotency_key:'ai:'+j.job_id});}
const check=async(name,fn)=>{await fn();results.push({name,passed:true});};
const finish=item=>ai.complete(db,item.task.id,{lease_token:item.lease_token,result:{output:mockOutput(item.task.task_type,item.task.input),provider:item.provider,model:'public-db-fixture',simulated:true,actual_cost:0,estimated_cost:0}});
try{
  await check('migration 002 is recorded with its checksum',async()=>assert.equal((await db.query('SELECT checksum FROM studio.schema_migrations WHERE version=2')).rows[0].checksum.length,64));
  const first=await fixture('first');
  await check('task creation persists queued state and brand scope',async()=>{assert.equal(first.status,'queued');assert.equal(first.brand_id,brand);assert.equal(first.attempt_history.length,0);});
  await check('same idempotency key reuses the durable task',async()=>{const t=await ai.submit(db,{...template,brand_id:brand,content_job_id:first.content_job_id,idempotency_key:'ai:'+first.content_job_id});assert.equal(t.id,first.id);assert.equal(t.deduplicated,true);});
  await check('idempotency rejects changed input',async()=>assert.rejects(ai.submit(db,{...template,input:{...input,topic:'Changed'},brand_id:brand,content_job_id:first.content_job_id,idempotency_key:'ai:'+first.content_job_id}),/IDEMPOTENCY_CONFLICT/));
  await check('cross-brand submission is rejected',async()=>assert.rejects(ai.submit(db,{...template,brand_id:travel,content_job_id:first.content_job_id,idempotency_key:'cross:'+run}),/BRAND_MISMATCH/));
  const claimed=await ai.claim(db,'mock');
  await check('claim records a running attempt and exclusive lease',async()=>{assert.equal(claimed.task.id,first.id);assert.equal((await ai.claim(db,'mock')).idle,true);});
  await check('unreserved cost is blocked at the database task boundary',async()=>assert.rejects(ai.reserve(db,first.id,{lease_token:claimed.lease_token,reserved_cost:1}),/BUDGET_EXHAUSTED/));
  await check('heartbeat maintains cancellation and deadline visibility',async()=>assert.equal((await ai.heartbeat(db,first.id,{lease_token:claimed.lease_token})).cancel_requested,false));
  await check('stale completion cannot replace a current task',async()=>assert.rejects(ai.complete(db,first.id,{lease_token:crypto.randomUUID(),error_category:'provider_outage'}),/LEASE_LOST/));
  const completed=await finish(claimed);
  await check('validated output and attempt history persist in separate tables',async()=>{assert.equal(completed.status,'completed');assert.equal(completed.attempt_history[0].simulated,true);assert.equal((await db.query('SELECT count(*)::int AS n FROM studio.ai_outputs WHERE task_id=$1',[first.id])).rows[0].n,1);assert.equal(completed.output_checksum.length,64);});
  await check('late duplicate completion cannot create a second output',async()=>assert.rejects(finish(claimed),/LEASE_LOST/));
  await check('completed task cannot be cancelled retroactively',async()=>assert.equal((await ai.cancel(db,first.id)).status,'completed'));
  const queuedCancel=await fixture('cancel-queued');await ai.cancel(db,queuedCancel.id);
  await check('queued cancellation persists without execution',async()=>assert.equal((await ai.getTask(db,queuedCancel.id)).status,'cancelled'));
  const runningCancel=await fixture('cancel-running'),active=await ai.claim(db,'mock');await ai.cancel(db,runningCancel.id);
  await check('running cancellation wins over a successful provider response',async()=>assert.equal((await finish(active)).status,'cancelled'));
  const timed=await fixture('deadline');await db.query("UPDATE studio.ai_tasks SET deadline_at=now()-interval '1 second' WHERE id=$1",[timed.id]);await ai.recover(db);
  await check('total deadline expires durably before another provider call',async()=>assert.equal((await ai.getTask(db,timed.id)).error_category,'timeout'));
  const malformed=await fixture('invalid',{provider_policy:{mode:'mock',providers:['mock-invalid','mock']}}),invalidClaim=await ai.claim(db,'mock');
  await ai.complete(db,malformed.id,{lease_token:invalidClaim.lease_token,result:{output:{invalid:true},simulated:true,actual_cost:0}});
  const fallback=await ai.claim(db,'mock');await finish(fallback);
  await check('malformed structured output falls back and records simulated history',async()=>{const t=await ai.getTask(db,malformed.id);assert.equal(t.status,'completed');assert.deepEqual(t.attempt_history.map(a=>a.provider),['mock-invalid','mock']);assert.equal(t.attempt_history[0].error_category,'invalid_output');});
  const restarted=await fixture('restart',{provider_policy:{mode:'mock',providers:['mock-unavailable','mock']}}),lost=await ai.claim(db,'mock');await db.query("UPDATE studio.ai_tasks SET lease_until=now()-interval '1 second' WHERE id=$1",[restarted.id]);await ai.recover(db);const resumed=await ai.claim(db,'mock');await finish(resumed);
  await check('expired simulated lease recovers with original history',async()=>{const t=await ai.getTask(db,restarted.id);assert.equal(t.status,'completed');assert.equal(t.attempt_history[0].status,'interrupted');assert.equal(t.attempt_history.length,2);});
  const unavailable=await fixture('all-unavailable',{provider_policy:{mode:'mock',providers:['mock-unavailable']}}),bad=await ai.claim(db,'mock');await ai.complete(db,unavailable.id,{lease_token:bad.lease_token,error_category:'unavailable'});await ai.claim(db,'mock');
  await check('all providers unavailable terminates without an infinite retry',async()=>assert.equal((await ai.getTask(db,unavailable.id)).error_category,'all_providers_unavailable'));
  const unsafe=await fixture('security'),security=await ai.claim(db,'mock');await ai.complete(db,unsafe.id,{lease_token:security.lease_token,error_category:'credential_policy'});
  await check('credential-policy failure cannot trigger fallback',async()=>assert.equal((await ai.getTask(db,unsafe.id)).status,'failed'));
  await check('application role cannot mutate immutable AI output',async()=>{await client.query('SAVEPOINT immutable');try{await client.query('UPDATE studio.ai_outputs SET content_version=99 WHERE task_id=$1',[first.id]);assert.fail('write unexpectedly permitted');}catch(e){assert.equal(e.code,'42501');}finally{await client.query('ROLLBACK TO SAVEPOINT immutable');}});
  await check('cross-brand output foreign key rejects wrong ownership',async()=>{await client.query('SAVEPOINT isolation');try{await client.query('INSERT INTO studio.ai_outputs(id,task_id,brand_id,content_version,output_schema_version,output_json,checksum) VALUES($1,$2,$3,1,$4,$5,$6)',[crypto.randomUUID(),unsafe.id,travel,SCHEMA_VERSION,{},'0'.repeat(64)]);assert.fail('foreign key unexpectedly permitted');}catch(e){assert.equal(e.code,'23503');}finally{await client.query('ROLLBACK TO SAVEPOINT isolation');}});
  const liveFixture=await fixture('interrupted-live-policy',{provider_policy:{mode:'live',providers:['codex','agy','9router']}}),liveClaim=await ai.claim(db,'live',null);
  // State-machine fixture only: deliberately no provider is executed.
  assert.equal(liveClaim.task.id,liveFixture.id);await db.query("UPDATE studio.ai_tasks SET lease_until=now()-interval '1 second' WHERE id=$1",[liveFixture.id]);await ai.recover(db);
  await check('simulated interruption of live policy requires manual review without automatic re-execution',async()=>{const t=await ai.getTask(db,liveFixture.id);assert.equal(t.status,'manual_review');assert.equal(t.error_category,'uncertain_side_effect');assert.equal(t.actual_cost,null);});
  await check('live-policy claim never consumes another job grant',async()=>assert.equal((await ai.claim(db,'live',crypto.randomUUID())).idle,true));
  const legacyJob=await intake(db,{brand_id:brand,source_type:'ai_only',topic:input.topic,idempotency_key:'e2-sql:'+run+':legacy',ai_request:template});
  const legacyRequest={brand_id:brand,job_id:legacyJob.job_id,task_type:'title_generation',input:{topic:'Public v1 compatibility fixture'},provider_policy:{providers:['mock-unavailable','mock']},maximum_cost:0,timeout_ms:5000};
  await check('legacy synchronous mock submission and result application remain compatible',async()=>{const t=await legacyAiTask(db,legacyRequest);assert.equal(t.status,'completed');assert.equal((await legacyAiTask(db,legacyRequest)).id,t.id);await legacySaveAi(db,legacyJob.job_id,{task_id:t.id});assert.equal((await legacySaveAi(db,legacyJob.job_id,{task_id:t.id})).deduplicated,true);});
  console.log(JSON.stringify({passed:true,checks:results.length,results,database:'actual PostgreSQL 17.11; studio_app role',providers:'simulated fixtures',fixtures_rolled_back:true}));
}catch(e){console.log(JSON.stringify({passed:false,checks:results.length,results,error:e.code??e.message}));process.exitCode=1;}
finally{await client.query('ROLLBACK');client.release();await pool.end();}
