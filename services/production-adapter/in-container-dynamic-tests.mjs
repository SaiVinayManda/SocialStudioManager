// Real PostgreSQL execution in an outer rollback transaction. No actual provider
// or media subprocess runs; synthetic reports are never labelled video QC.
import assert from 'node:assert/strict';import crypto from 'node:crypto';import {database} from '../studio-runtime/db.mjs';
import {intakeTopic} from './topic-intake.mjs';import * as production from './store.mjs';import * as ai from '../ai-agent-manager/store.mjs';import {saveResult} from '../ai-agent-manager/intake.mjs';import {mockOutput} from '../ai-agent-manager/mock.mjs';
const pool=await database(),client=await pool.connect();let serial=0;const checks=[];await client.query('BEGIN');
const db={query:(...a)=>client.query(...a),connect:async()=>{const name='e3_'+(++serial);return {release(){},query:(sql,a)=>client.query(sql==='BEGIN'?'SAVEPOINT '+name:sql==='COMMIT'?'RELEASE SAVEPOINT '+name:sql==='ROLLBACK'?'ROLLBACK TO SAVEPOINT '+name:sql,a)};}};
const run=crypto.randomUUID(),input={source_type:'topic',brand_id:'10000000-0000-4000-8000-000000000001',topic:'A mirror whispers your name when nobody is home.',duration_seconds:5,idempotency_key:'e3-db:'+run,provider_mode:'fixture'};
const check=async(name,fn)=>{await fn();checks.push({name,passed:true});};
try{
 await check('migration 003 and its digest are persisted',async()=>assert.equal((await db.query('SELECT checksum FROM studio.schema_migrations WHERE version=3')).rows[0].checksum.length,64));
 const j=await intakeTopic(db,input,'/studio/media');
 await check('topic intake registers a new ordinary generation job without test approval',async()=>{assert.equal(j.source_type,'approved_openmontage');assert.equal(j.production_settings.generation_template,'storyboard-v1');assert(!j.production_settings.acceptance_run_id);});
 await check('duplicate topic delivery is durable and idempotent',async()=>assert.equal((await intakeTopic(db,input)).id,j.id));
 await check('changed topic with same idempotency key is rejected',async()=>assert.rejects(intakeTopic(db,{...input,topic:'A changed topic'}),/IDEMPOTENCY_PAYLOAD_CONFLICT/));
 await check('uncleared live mode fails before creating a paid task',async()=>assert.rejects(intakeTopic(db,{...input,provider_mode:'live',idempotency_key:input.idempotency_key+':live'}),/NOT_CLEARED/));
 await check('generation cannot start before a completed AI/fixture result',async()=>assert.rejects(production.start(db,j.id),/AI_PREPARATION_REQUIRED/));
 const settings=j.production_settings.ai_request,t=await ai.submit(db,{...settings,content_job_id:j.id,brand_id:j.brand_id,idempotency_key:'ai:'+j.id,content_version:j.content_version});
 const claim=await ai.claim(db,'mock',j.id);assert.equal(claim.task.id,t.id);
 await ai.complete(db,t.id,{lease_token:claim.lease_token,result:{output:mockOutput('production_package',settings.input),provider:'mock',model:'explicit PostgreSQL fixture',simulated:true,actual_cost:0,estimated_cost:0}});
 await check('production package schema and attempt history persist',async()=>{const result=await ai.getTask(db,t.id);assert.equal(result.status,'completed');assert.equal(result.attempt_history.length,1);assert(result.validated_output.concept&&result.validated_output.storyboard&&result.validated_output.metadata);});
 const attached=await saveResult(db,j.id,{task_id:t.id});
 await check('AI-to-OpenMontage mapping preserves topic and timed storyboard',async()=>{assert.equal(attached.openmontage_mapping.schema_version,'social-studio.openmontage-input.v2');assert.equal(attached.openmontage_mapping.duration_seconds,5);assert.equal(attached.status,'queued');});
 await production.start(db,j.id);const task=await production.claim(db);
 await check('production queue records real render kind rather than existing-file validation',async()=>{assert.equal(task.task.kind,'render');assert.equal(task.task.job.id,j.id);});
 await production.complete(db,task.task.id,{lease_token:task.task.lease_token,report:{passed:false,code:'EXPLICIT_TEST_RENDER_FAILURE'}});
 await check('failed dynamic rendering cannot reach approval',async()=>{assert.equal((await production.job(db,j.id)).status,'failed');await assert.rejects(production.requestApproval(db,j.id),/QUALITY_GATE/);});
 const travel=await intakeTopic(db,{...input,brand_id:'10000000-0000-4000-8000-000000000004',topic:'A mountain lake at dawn',idempotency_key:'e3-travel:'+run});
 await check('Travel topic has isolated output, profile and audience',async()=>{assert(travel.source_reference.relative_path.startsWith('travel/'));assert.equal(travel.production_settings.dynamic.profile.slug,'travel');assert.notEqual(travel.production_settings.ai_request.input.audience,settings.input.audience);});
 await check('cross-brand AI attachment is rejected',async()=>assert.rejects(saveResult(db,travel.id,{task_id:t.id}),/AI_BRAND_MISMATCH/));
 console.log(JSON.stringify({passed:true,actual_postgres:true,rolled_back:true,providers:'explicit mock fixtures only',checks}));
}catch(error){console.log(JSON.stringify({passed:false,error:error.code??error.message,checks}));process.exitCode=1;}
finally{await client.query('ROLLBACK');client.release();await pool.end();}
