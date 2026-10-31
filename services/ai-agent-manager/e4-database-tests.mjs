// Actual PostgreSQL, outer rollback only. NO inference, readiness deployment,
// render or n8n execution. Readiness records here are FICTIONAL TESTS.
import assert from 'node:assert/strict';import crypto from 'node:crypto';import {database} from '../studio-runtime/db.mjs';
import {intakeTopic} from '../production-adapter/topic-intake.mjs';import {e4Body} from './e4-policy.mjs';import {E4_ID,E4_INSTRUCTIONS} from './e4-route.mjs';
const pool=await database(),client=await pool.connect(),checks=[];let serial=0;await client.query('BEGIN');
const db={query:(...a)=>client.query(...a),connect:async()=>{const n='e4_'+(++serial);return {release(){},query:(s,a)=>client.query(s==='BEGIN'?'SAVEPOINT '+n:s==='COMMIT'?'RELEASE SAVEPOINT '+n:s==='ROLLBACK'?'ROLLBACK TO SAVEPOINT '+n:s,a)};}};
const check=async(name,fn)=>{await fn();checks.push({name,passed:true});},body=e4Body(crypto.randomUUID());
try{
 await db.query("UPDATE studio.ai_provider_health SET status='approval_required',capability_metadata=capability_metadata-'e4_readiness' WHERE provider IN ('codex','agy','9router')");
 await check('uncleared new live topic fails before task creation',()=>assert.rejects(intakeTopic(db,body),/NOT_CLEARED/));
 const r={...body,approval_id:E4_ID,expires_at:new Date(Date.now()+60000).toISOString(),maximum_cost:0};
 await db.query("UPDATE studio.ai_provider_health SET capability_metadata=jsonb_build_object('e4_readiness',$1::jsonb) WHERE provider='9router'",[JSON.stringify(r)]);
 const j=await intakeTopic(db,body);
 await check('scoped readiness permits only the approved live new-video job',async()=>{assert.equal(j.source_type,'approved_openmontage');assert.equal(j.production_settings.ai_request.provider_policy.mode,'live');assert.deepEqual(j.production_settings.ai_request.provider_policy.providers,['codex','agy','9router']);assert.equal(j.production_settings.ai_request.input.script,undefined);assert.equal(j.production_settings.ai_request.input.scene_count,1);assert.equal(j.production_settings.ai_request.input.instructions,E4_INSTRUCTIONS);});
 await check('readiness does not falsely label the provider available',async()=>assert.equal((await db.query("SELECT status FROM studio.ai_provider_health WHERE provider='9router'")).rows[0].status,'approval_required'));
 await check('duplicate approved intake reuses exactly one durable job',async()=>assert.equal((await intakeTopic(db,body)).id,j.id));
 for(const [name,patch]of Object.entries({topic:{topic:'A different topic'},brand:{brand_id:'10000000-0000-4000-8000-000000000004'},duration:{duration_seconds:6},fixture_script:{script:'Fixture'},production_override:{production:{}},run:{acceptance_run_id:crypto.randomUUID()},idempotency:{idempotency_key:'e4-real:'+crypto.randomUUID()}}))await check('readiness rejects changed '+name,()=>assert.rejects(intakeTopic(db,{...body,...patch}),/NOT_CLEARED/));
 await db.query("UPDATE studio.ai_provider_health SET capability_metadata=jsonb_build_object('e4_readiness',$1::jsonb) WHERE provider='9router'",[JSON.stringify({...r,expires_at:'2000-01-01'})]);
 await check('expired readiness cannot authorize another live intake',()=>assert.rejects(intakeTopic(db,body),/NOT_CLEARED/));
 console.log(JSON.stringify({passed:true,actual_postgres:true,rolled_back:true,model_calls:0,checks}));
}catch(e){console.log(JSON.stringify({passed:false,error:e.code??e.message,checks}));process.exitCode=1;}
finally{await client.query('ROLLBACK');client.release();await pool.end();}
