import crypto from 'node:crypto';
import {demand,exact,uuid,hash,canonical} from '../studio-runtime/contracts.mjs';
import {transaction,event} from '../studio-runtime/db.mjs';
import {job} from '../production-adapter/store.mjs';
import {validateRequest,requestChecksum,nextStep,TERMINAL,categorize,ProviderError} from './contracts.mjs';
import {validateOutput,SCHEMA_VERSION} from './schemas.mjs';
import {MockAdapter} from './mock.mjs';

const columns='id,job_id AS content_job_id,brand_id,task_type,input,status,provider_policy,output_schema_version,content_version,provider_used,model_used,token_usage,actual_cost,estimated_cost,reserved_cost,duration_ms,error_category,error_details,created_at,updated_at,started_at,completed_at,deadline_at,output_checksum,artifact_reference,cancel_requested';
async function reviewFailure(c,t,category){await c.query("UPDATE studio.content_jobs SET status='manual_review',error_details=$2 WHERE id=$1 AND status='queued'",[t.job_id,{code:'AI_PREPARATION_STOPPED',task_id:t.id,error_category:category}]);}
export async function getTask(db,id){
  demand(uuid(id),'INVALID_AI_ID');const task=(await db.query(`SELECT ${columns},output FROM studio.ai_tasks WHERE id=$1`,[id])).rows[0];demand(task,'AI_TASK_NOT_FOUND',404);
  const attempts=(await db.query('SELECT id,provider,model,attempt_number,status,error_category,duration_ms,token_usage,actual_cost,estimated_cost,reserved_cost,exit_code,simulated,started_at,completed_at FROM studio.ai_task_attempts WHERE task_id=$1 ORDER BY attempt_number',[id])).rows;
  const normalized=attempts.map(a=>({...a,duration_ms:a.duration_ms===null?null:Number(a.duration_ms),actual_cost:a.actual_cost===null?null:Number(a.actual_cost),estimated_cost:a.estimated_cost===null?null:Number(a.estimated_cost),reserved_cost:Number(a.reserved_cost)}));
  return {...task,duration_ms:task.duration_ms===null?null:Number(task.duration_ms),task_id:task.id,validated_output:task.output?.output??null,attempt_history:normalized,cost:{actual:task.actual_cost===null?null:Number(task.actual_cost),estimated:task.estimated_cost===null?null:Number(task.estimated_cost),reserved:Number(task.reserved_cost),currency:'USD'},simulated:attempts.length?attempts.every(a=>a.simulated):task.provider_policy.mode==='mock'};
}
export async function submit(db,body){
  const request=validateRequest(body),digest=requestChecksum(request);
  return transaction(db,async c=>{
    const j=await job(c,request.content_job_id,true);demand(j.brand_id===request.brand_id,'AI_BRAND_MISMATCH',403);
    const old=(await c.query('SELECT id,request_checksum FROM studio.ai_tasks WHERE brand_id=$1 AND idempotency_key=$2',[request.brand_id,request.idempotency_key])).rows[0];
    if(old){demand(old.request_checksum===digest,'AI_IDEMPOTENCY_CONFLICT',409);return {...await getTask(c,old.id),deduplicated:true};}
    demand(j.status==='queued','AI_AFTER_PRODUCTION_DENIED',409);
    if(request.content_version!==undefined)demand(j.content_version===request.content_version,'AI_CONTENT_VERSION_CHANGED',409);
    const id=request.task_id??crypto.randomUUID();
    await c.query("INSERT INTO studio.ai_tasks(id,job_id,brand_id,task_type,input,provider_policy,maximum_cost,timeout_ms,status,idempotency_key,request_checksum,output_schema_version,content_version,retry_policy,deadline_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'queued',$9,$10,$11,$12,$13,now()+$8::integer*interval '1 millisecond')",[id,j.id,j.brand_id,request.task_type,request.input,request.provider_policy,request.maximum_cost,request.timeout_ms,request.idempotency_key,digest,SCHEMA_VERSION,j.content_version,request.retry_policy]);
    await event(c,j.id,'ai.queued',{task_id:id,mode:request.provider_policy.mode,schema:SCHEMA_VERSION});
    return {...await getTask(c,id),deduplicated:false};
  });
}
export async function cancel(db,id){return transaction(db,async c=>{
  demand(uuid(id),'INVALID_AI_ID');const t=(await c.query('SELECT * FROM studio.ai_tasks WHERE id=$1 FOR UPDATE',[id])).rows[0];demand(t,'AI_TASK_NOT_FOUND',404);
  if(!TERMINAL.has(t.status)){
    await c.query("UPDATE studio.ai_tasks SET cancel_requested=true,status=CASE WHEN status='running' THEN status ELSE 'cancelled' END,completed_at=CASE WHEN status='running' THEN NULL ELSE now() END,error_category='cancelled' WHERE id=$1",[id]);
    if(t.status!=='running')await reviewFailure(c,t,'cancelled');
    await event(c,t.job_id,'ai.cancel_requested',{task_id:id});
  }
  return getTask(c,id);
});}
export async function recover(db){return transaction(db,async c=>{
  await c.query('SELECT pg_advisory_xact_lock(70630201)');
  const lost=(await c.query("SELECT * FROM studio.ai_tasks WHERE output_schema_version=$1 AND status='running' AND lease_until<now() FOR UPDATE",[SCHEMA_VERSION])).rows;
  for(const t of lost){
    const simulated=t.provider_policy.mode==='mock';
    await c.query("UPDATE studio.ai_task_attempts SET status='interrupted',error_category=$2,completed_at=now(),duration_ms=GREATEST(0,EXTRACT(EPOCH FROM(now()-started_at))*1000)::bigint WHERE task_id=$1 AND status='running'",[t.id,simulated?'transport_failure':'uncertain_side_effect']);
    await c.query("UPDATE studio.ai_tasks SET status=$2,error_category=$3,lease_token=NULL,lease_until=NULL,completed_at=CASE WHEN $2='manual_review' THEN now() ELSE NULL END WHERE id=$1",[t.id,simulated?'retry_wait':'manual_review',simulated?'transport_failure':'uncertain_side_effect']);
    if(!simulated)await reviewFailure(c,t,'uncertain_side_effect');
    await event(c,t.job_id,'ai.recovered',{task_id:t.id,requeued:simulated,possible_usage_unknown:!simulated});
  }
  const expired=(await c.query("UPDATE studio.ai_tasks SET status=CASE WHEN cancel_requested THEN 'cancelled' ELSE 'failed' END,error_category=CASE WHEN cancel_requested THEN 'cancelled' ELSE 'timeout' END,completed_at=now() WHERE output_schema_version=$1 AND status IN ('queued','retry_wait') AND (deadline_at<=now() OR cancel_requested) RETURNING *",[SCHEMA_VERSION])).rows;
  for(const t of expired)await reviewFailure(c,t,t.error_category);
  return {recovered_ai_tasks:lost.length};
});}
export async function claim(db,mode,jobId=null){
  demand(['mock','live'].includes(mode),'INVALID_AI_MODE');await recover(db);
  if(jobId)demand(uuid(jobId),'INVALID_JOB_ID');
  return transaction(db,async c=>{
    await c.query('SELECT pg_advisory_xact_lock(70630201)');
    if((await c.query("SELECT 1 FROM studio.ai_task_attempts WHERE status='running'")).rowCount)return {idle:true};
    const tasks=(await c.query("SELECT t.*,b.slug AS brand_slug FROM studio.ai_tasks t JOIN studio.brands b ON b.id=t.brand_id WHERE t.output_schema_version=$1 AND t.provider_policy->>'mode'=$2 AND t.status IN ('queued','retry_wait') AND ($3::uuid IS NULL OR t.job_id=$3) ORDER BY t.created_at LIMIT 20 FOR UPDATE OF t SKIP LOCKED",[SCHEMA_VERSION,mode,jobId])).rows;
    for(const t of tasks){
      const attempts=(await c.query('SELECT * FROM studio.ai_task_attempts WHERE task_id=$1 ORDER BY attempt_number',[t.id])).rows,step=nextStep(t,attempts);
      if(step.action==='terminal'){await c.query("UPDATE studio.ai_tasks SET status=$2,error_category=$3,completed_at=now() WHERE id=$1",[t.id,step.status,step.category??null]);if(step.status!=='completed')await reviewFailure(c,t,step.category);await event(c,t.job_id,'ai.'+step.status,{task_id:t.id,error_category:step.category??null});continue;}
      if(step.action!=='run')continue;
      const token=crypto.randomUUID(),attemptId=crypto.randomUUID();
      await c.query("INSERT INTO studio.ai_task_attempts(id,task_id,provider,attempt_number,status,simulated) VALUES($1,$2,$3,$4,'running',$5)",[attemptId,t.id,step.provider,attempts.length+1,mode==='mock']);
      await c.query("UPDATE studio.ai_tasks SET status='running',started_at=COALESCE(started_at,now()),lease_token=$2,lease_until=LEAST(deadline_at,now()+interval '45 seconds') WHERE id=$1",[t.id,token]);
      return {idle:false,lease_token:token,attempt_id:attemptId,provider:step.provider,task:{...t,maximum_cost:Number(t.maximum_cost),reserved_cost:Number(t.reserved_cost),content_job_id:t.job_id}};
    }
    return {idle:true};
  });
}
async function owned(c,id,token){
  demand(uuid(id)&&uuid(token),'INVALID_AI_LEASE');const t=(await c.query("SELECT * FROM studio.ai_tasks WHERE id=$1 AND lease_token=$2 AND status='running' AND lease_until>now() FOR UPDATE",[id,token])).rows[0];demand(t,'AI_LEASE_LOST',409);return t;
}
export async function heartbeat(db,id,body){
  exact(body,['lease_token'],['lease_token']);return transaction(db,async c=>{const t=await owned(c,id,body.lease_token);await c.query("UPDATE studio.ai_tasks SET lease_until=LEAST(deadline_at,now()+interval '45 seconds') WHERE id=$1",[id]);return {cancel_requested:t.cancel_requested,deadline_at:t.deadline_at};});
}
export async function reserve(db,id,body){
  exact(body,['lease_token','reserved_cost'],['lease_token','reserved_cost']);demand(Number.isFinite(body.reserved_cost)&&body.reserved_cost>=0,'INVALID_AI_RESERVATION');
  return transaction(db,async c=>{const t=await owned(c,id,body.lease_token);demand(!t.cancel_requested,'AI_CANCELLED',409);
    const a=(await c.query("SELECT * FROM studio.ai_task_attempts WHERE task_id=$1 AND status='running' FOR UPDATE",[id])).rows[0];demand(a,'AI_ATTEMPT_NOT_RUNNING',409);
    if(Number(a.reserved_cost)>0){demand(Number(a.reserved_cost)===body.reserved_cost,'AI_RESERVATION_CONFLICT',409);return {reserved:true,deduplicated:true};}
    demand(Number(t.reserved_cost)+body.reserved_cost<=Number(t.maximum_cost),'AI_BUDGET_EXHAUSTED',403);
    await c.query('UPDATE studio.ai_tasks SET reserved_cost=reserved_cost+$2 WHERE id=$1',[id,body.reserved_cost]);await c.query('UPDATE studio.ai_task_attempts SET reserved_cost=$2 WHERE id=$1',[a.id,body.reserved_cost]);return {reserved:true};
  });
}
export async function complete(db,id,body){
  exact(body,['lease_token','result','error_category'],['lease_token']);
  demand(Boolean(body.result)!==Boolean(body.error_category),'AI_RESULT_OR_ERROR_REQUIRED');
  if(body.error_category)demand(['unavailable','unsupported','quota_exhausted','rate_limited','provider_outage','transport_failure','timeout','invalid_output','authorization','credential_policy','unsafe_request','cancelled','budget_exhausted','uncertain_side_effect','cleanup_failed'].includes(body.error_category),'INVALID_AI_ERROR');
  return transaction(db,async c=>{
    const t=await owned(c,id,body.lease_token),a=(await c.query("SELECT * FROM studio.ai_task_attempts WHERE task_id=$1 AND status='running' FOR UPDATE",[id])).rows[0];demand(a,'AI_ATTEMPT_NOT_RUNNING',409);
    let category=body.error_category??null,result=body.result;
    if(result){
      exact(result,['output','provider','model','token_usage','actual_cost','estimated_cost','simulated','exit_code'],['output','simulated']);
      demand(result.simulated===(t.provider_policy.mode==='mock'),'AI_PROVIDER_MODE_MISMATCH',403);
      if(result.provider)demand(result.provider===a.provider,'AI_PROVIDER_MISMATCH',403);
      if(result.model!==undefined)demand(typeof result.model==='string'&&result.model.length<=160,'INVALID_AI_MODEL');
      if(result.exit_code!==undefined&&result.exit_code!==null)demand(Number.isInteger(result.exit_code),'INVALID_EXIT_CODE');
      if(result.token_usage!==undefined&&result.token_usage!==null){exact(result.token_usage,['input_tokens','output_tokens','cached_input_tokens','reasoning_tokens','total_tokens']);demand(Object.values(result.token_usage).every(v=>Number.isInteger(v)&&v>=0),'INVALID_AI_USAGE');}
      for(const k of ['actual_cost','estimated_cost'])if(result[k]!==undefined&&result[k]!==null)demand(Number.isFinite(result[k])&&result[k]>=0,'INVALID_AI_COST');
      if(result.actual_cost!==null&&result.actual_cost!==undefined)demand(result.actual_cost<=Number(a.reserved_cost),'UNRESERVED_AI_COST',403);
      try{validateOutput(t.task_type,result.output,t.input);}catch(e){category=categorize(e);}
    }
    const j=await job(c,t.job_id,true);
    if(t.cancel_requested)category='cancelled';else if(Date.now()>=Date.parse(t.deadline_at))category='timeout';else if(j.content_version!==t.content_version)category='unsafe_request';
    const status=category?'failed':'completed',digest=!category?hash(canonical(result.output)):null;
    await c.query("UPDATE studio.ai_task_attempts SET status=$2,error_category=$3,model=$4,token_usage=$5,actual_cost=$6,estimated_cost=$7,exit_code=$8,completed_at=now(),duration_ms=GREATEST(0,EXTRACT(EPOCH FROM(now()-started_at))*1000)::bigint WHERE id=$1",[a.id,category==='cancelled'?'cancelled':status,category,result?.model??null,result?.token_usage??null,result?.actual_cost??(a.simulated?0:null),result?.estimated_cost??(a.simulated?0:null),result?.exit_code??null]);
    const nextStatus=!category?'completed':category==='cancelled'?'cancelled':['uncertain_side_effect','cleanup_failed'].includes(category)?'manual_review':['authorization','credential_policy','unsafe_request','budget_exhausted'].includes(category)?'failed':'retry_wait';
    await c.query("UPDATE studio.ai_tasks SET status=$2,error_category=$3,error_details=$4,provider_used=CASE WHEN $2='completed' THEN $5 ELSE provider_used END,model_used=$6,token_usage=$7,actual_cost=(SELECT CASE WHEN count(*) FILTER(WHERE actual_cost IS NULL)>0 THEN NULL ELSE sum(actual_cost) END FROM studio.ai_task_attempts WHERE task_id=$1),estimated_cost=(SELECT sum(estimated_cost) FROM studio.ai_task_attempts WHERE task_id=$1),output=$8,output_checksum=$9,completed_at=CASE WHEN $2 IN ('completed','failed','cancelled','manual_review') THEN now() ELSE NULL END,duration_ms=GREATEST(0,EXTRACT(EPOCH FROM(now()-created_at))*1000)::bigint,lease_token=NULL,lease_until=NULL WHERE id=$1",[id,nextStatus,category,category?{code:category}:null,a.provider,result?.model??null,result?.token_usage??null,!category?{output:result.output,provider:a.provider,model:result.model??null,mock:result.simulated}:null,digest]);
    if(!category){await c.query('INSERT INTO studio.ai_outputs(id,task_id,brand_id,content_version,output_schema_version,output_json,checksum) VALUES($1,$2,$3,$4,$5,$6,$7)',[crypto.randomUUID(),id,t.brand_id,t.content_version,t.output_schema_version,result.output,digest]);}
    else if(TERMINAL.has(nextStatus))await reviewFailure(c,t,category);
    await c.query("INSERT INTO studio.ai_provider_health(provider,status,last_checked,last_success,last_failure,error_category) VALUES($1,$2,now(),CASE WHEN $2='available' THEN now() ELSE NULL END,CASE WHEN $2<>'available' THEN now() ELSE NULL END,$3) ON CONFLICT(provider) DO UPDATE SET status=EXCLUDED.status,last_checked=now(),last_success=COALESCE(EXCLUDED.last_success,studio.ai_provider_health.last_success),last_failure=COALESCE(EXCLUDED.last_failure,studio.ai_provider_health.last_failure),error_category=EXCLUDED.error_category",[a.provider.startsWith('mock')?'mock':a.provider,!category?'available':category==='unsupported'?'unsupported':category==='credential_policy'?'approval_required':'degraded',category]);
    await event(c,t.job_id,'ai.attempt_finished',{task_id:id,attempt_id:a.id,provider:a.provider,simulated:a.simulated,status:nextStatus,error_category:category,output_checksum:digest});
    return getTask(c,id);
  });
}
export async function tickMock(db){
  const item=await claim(db,'mock');if(item.idle)return item;
  try{const result=await new MockAdapter(item.provider).execute(item.task);return await complete(db,item.task.id,{lease_token:item.lease_token,result});}
  catch(e){return complete(db,item.task.id,{lease_token:item.lease_token,error_category:categorize(e)});}
}
export async function health(db){return {provider_order:['codex','agy','9router'],providers:(await db.query('SELECT * FROM studio.ai_provider_health ORDER BY CASE provider WHEN \'codex\' THEN 1 WHEN \'agy\' THEN 2 WHEN \'9router\' THEN 3 ELSE 4 END')).rows,live_execution_requires_operator_policy:true};}
