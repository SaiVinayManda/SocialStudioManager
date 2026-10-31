import crypto from 'node:crypto';
import {demand,exact,uuid,hash,canonical} from '../studio-runtime/contracts.mjs';
import {transaction,event} from '../studio-runtime/db.mjs';
import {validateRequest} from './contracts.mjs';
import {job} from '../production-adapter/store.mjs';
import {getTask} from './store.mjs';
import {toOpenMontage} from './openmontage.mjs';

export async function intake(db,body){
  exact(body,['brand_id','source_type','topic','idempotency_key','ai_request'],['brand_id','source_type','topic','idempotency_key','ai_request']);
  demand(body.source_type==='ai_only'&&uuid(body.brand_id),'INVALID_AI_INTAKE');
  exact(body.ai_request,['task_type','input','output_schema_version','provider_policy','maximum_cost','timeout_ms','retry_policy'],['task_type','input','output_schema_version','provider_policy','maximum_cost','timeout_ms','retry_policy']);
  demand(body.topic===body.ai_request.input.topic,'AI_TOPIC_MISMATCH');
  validateRequest({...body.ai_request,brand_id:body.brand_id,content_job_id:'00000000-0000-4000-8000-000000000001',idempotency_key:body.idempotency_key});
  const digest=hash(canonical(body));
  return transaction(db,async c=>{
    const brand=(await c.query('SELECT id FROM studio.brands WHERE id=$1 FOR UPDATE',[body.brand_id])).rows[0];demand(brand,'UNKNOWN_BRAND');
    const old=(await c.query('SELECT * FROM studio.content_jobs WHERE brand_id=$1 AND idempotency_key=$2',[body.brand_id,body.idempotency_key])).rows[0];
    if(old){demand(old.request_checksum===digest,'IDEMPOTENCY_CONFLICT',409);return {job_id:old.id,...old,deduplicated:true};}
    const id=crypto.randomUUID(),settings={requires_ai:true,ai_request:body.ai_request};
    await c.query("INSERT INTO studio.content_jobs(id,brand_id,source_type,source_reference,topic,production_settings,idempotency_key,source_fingerprint,request_checksum) VALUES($1,$2,'ai_only',$3,$4,$5,$6,$7,$8)",[id,brand.id,{kind:'editorial_topic'},body.topic,settings,body.idempotency_key,hash('ai-only:'+brand.id+':'+body.idempotency_key),digest]);
    await event(c,id,'job.accepted',{source_type:'ai_only',rendering:false,publishing:false});
    return {job_id:id,...await job(c,id),deduplicated:false};
  });
}
export async function saveResult(db,id,body){
  exact(body,['task_id'],['task_id']);const task=await getTask(db,body.task_id);
  if(task.output_schema_version==='legacy.v1')return null;
  return transaction(db,async c=>{
    const j=await job(c,id,true);demand(task.content_job_id===id&&task.brand_id===j.brand_id,'AI_BRAND_MISMATCH',403);demand(task.status==='completed','COMPLETED_AI_TASK_REQUIRED',409);
    const output=task.validated_output;
    if(j.content_metadata.ai_output_checksum===task.output_checksum)return {job_id:id,status:j.status,source_type:j.source_type,deduplicated:true,task_id:task.id};
    demand(j.status==='queued'&&j.content_version===task.content_version,'AI_CONTENT_VERSION_CHANGED',409);
    const metadata={ai_task_id:task.id,ai_output_checksum:task.output_checksum,ai_output_schema:task.output_schema_version,ai_output:output};
    if(task.task_type==='content_package')Object.assign(metadata,{title:output.titles.titles[0].title,description:output.captions.youtube_description,caption:output.captions.instagram_caption,hashtags:output.hashtags.instagram});
    const mapping=['script_generation','content_package'].includes(task.task_type)?toOpenMontage(task,j.brand_slug):null;
    await c.query("UPDATE studio.content_jobs SET content_metadata=content_metadata||$2,content_version=content_version+1,status=CASE WHEN source_type='ai_only' THEN 'manual_review' ELSE status END WHERE id=$1",[id,metadata]);
    await event(c,id,'ai.result_attached',{task_id:task.id,output_checksum:task.output_checksum,openmontage_mapping_validated:Boolean(mapping),rendered:false});
    return {job_id:id,status:j.source_type==='ai_only'?'manual_review':j.status,source_type:j.source_type,task_id:task.id,openmontage_mapping:mapping,rendered:false};
  });
}
