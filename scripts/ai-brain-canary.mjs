// Actual signed n8n intake and durable PostgreSQL task path. Mock by default.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {demand,signWebhook,uuid} from '../services/studio-runtime/contracts.mjs';
import {safeProjectDirectory} from '../services/ai-agent-manager/safety.mjs';
import {verifyCanaryApproval} from '../services/ai-agent-manager/approval.mjs';
import {SCHEMA_VERSION,validateOutput} from '../services/ai-agent-manager/schemas.mjs';
import {toOpenMontage} from '../services/ai-agent-manager/openmontage.mjs';
import {control,readLocalKey,until,localGrant} from './studio-test-client.mjs';
const root=localGrant(),live=process.argv.includes('--live');
if(live){demand(process.argv.includes('--approved=E2-REAL-CANARY-01'),'REAL_CANARY_APPROVAL_REQUIRED');verifyCanaryApproval(root);}
const run=crypto.randomUUID(),start=performance.now(),started=new Date().toISOString();
const input={topic:'A mysterious voicemail from someone who disappeared ten years ago.',genre:'horror',audience:'Adult suspense viewers',duration_seconds:60,language:'en',tone:'Cinematic suspense',hook_style:'Immediate unsettling revelation',scene_count:6,platforms:['youtube','instagram','facebook']};
const payload={brand_id:'10000000-0000-4000-8000-000000000001',source_type:'ai_only',topic:input.topic,idempotency_key:'e2-canary:'+run,ai_request:{task_type:'content_package',input,output_schema_version:SCHEMA_VERSION,provider_policy:{mode:live?'live':'mock',providers:live?['codex','agy','9router']:['mock-unavailable','mock']},maximum_cost:0,timeout_ms:120000,retry_policy:{max_attempts_per_provider:1,initial_backoff_ms:100}}};
const sessionFile=path.join(root,'.runtime/ai-brain/canary-session.json');
if(live)fs.writeFileSync(sessionFile,JSON.stringify({run_id:run,approval_id:'E2-REAL-CANARY-01',created_at:started,job_id:null,maximum_tasks:1},null,2),{flag:'wx'});
const dir=path.join(root,'docs/test-evidence/milestone-e2',run);fs.mkdirSync(dir,{recursive:true});
async function deliver(){const envelope=signWebhook(payload,readLocalKey('webhook_key'));const r=await fetch('http://127.0.0.1:5678/webhook/social-studio/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(envelope),signal:AbortSignal.timeout(15000),redirect:'error'});const body=await r.json();demand(r.status===202&&uuid(body.job_id),'N8N_AI_INTAKE_FAILED');return body;}
try{
  const accepted=await deliver(),repeated=await deliver();demand(repeated.job_id===accepted.job_id&&repeated.deduplicated===true,'N8N_AI_DUPLICATE_NOT_PREVENTED');
  if(live)fs.writeFileSync(sessionFile,JSON.stringify({run_id:run,approval_id:'E2-REAL-CANARY-01',created_at:started,job_id:accepted.job_id,maximum_tasks:1},null,2));
  fs.writeFileSync(path.join(dir,'accepted.json'),JSON.stringify({run_id:run,job_id:accepted.job_id,started_at:started,mode:live?'live':'mock',payload},null,2));
  if(live){
    // Pause here for the separate approved worker invocation. No provider call
    // occurs in this script; task-specific scope is explicit and reviewable.
    console.log(JSON.stringify({job_id:accepted.job_id,waiting_for_approved_native_worker:true,evidence:dir}));
  }
  const state=await until(async()=>{const j=await control('/jobs/'+accepted.job_id);if(j.content_metadata?.ai_task_id)return j;const logs=await control('/jobs/'+accepted.job_id+'/logs');if(logs.events.some(e=>['ai.failed','ai.manual_review'].includes(e.event_type)))throw Error('AI_TASK_TERMINAL_FAILURE');return false;},{timeout:150000,interval:500});
  const task=await control('/ai/tasks/'+state.content_metadata.ai_task_id);demand(task.status==='completed','AI_CANARY_NOT_COMPLETED');validateOutput('content_package',task.validated_output,input);
  const mapping=toOpenMontage(task,'horror');demand(mapping.duration_seconds===60&&mapping.openmontage_artifacts.scene_plan.scenes.length===6,'OPENMONTAGE_MAPPING_FAILED');
  const artifacts=safeProjectDirectory(root,path.join('brands/horror/projects','ai-'+accepted.job_id));
  const files={'task-result.json':task,'content-package.json':task.validated_output,'openmontage-input.json':mapping,'script.json':mapping.openmontage_artifacts.script,'scene_plan.json':mapping.openmontage_artifacts.scene_plan};
  for(const [name,value]of Object.entries(files))fs.writeFileSync(path.join(artifacts,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  fs.writeFileSync(path.join(artifacts,'narration.txt'),task.validated_output.script.narration_text+'\n',{flag:'wx'});
  const history=await control('/ai/tasks/'+task.id+'/history'),publishing=await control('/publishing?job_id='+accepted.job_id);
  demand(publishing.publishing_jobs.length===0&&state.status==='manual_review','AI_ONLY_JOB_ENTERED_PUBLISHING_OR_RENDER');
  const deliveredAfterCompletion=await deliver();demand(deliveredAfterCompletion.job_id===accepted.job_id&&deliveredAfterCompletion.status==='manual_review','COMPLETED_AI_REDELIVERY_NOT_SUPPRESSED');
  const report={run_id:run,started_at:started,completed_at:new Date().toISOString(),elapsed_seconds:(performance.now()-start)/1000,passed:true,job_id:accepted.job_id,task_id:task.id,brand_id:state.brand_id,mode:live?'live':'mock',simulated:task.simulated,provider_used:task.provider_used,attempt_history:history.attempts,output_checksum:task.output_checksum,output_directory:artifacts,n8n_signed_webhook_executed:true,duplicate_delivery_verified:true,postgres_persistence_verified:true,openmontage_mapping_validated:true,rendered:false,public_posts:0,model_requests:live?null:0};
  fs.writeFileSync(path.join(dir,'canary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
}catch(e){fs.writeFileSync(path.join(dir,'failure.json'),JSON.stringify({passed:false,error:e.code??e.message,started_at:started,mode:live?'live':'mock',public_posts:0},null,2));console.error(JSON.stringify({passed:false,error:e.code??e.message,evidence:dir}));process.exitCode=1;}
