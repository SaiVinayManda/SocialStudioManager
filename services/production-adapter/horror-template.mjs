import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {demand,uuid,canonical} from '../studio-runtime/contracts.mjs';
import {safeProjectDirectory} from '../ai-agent-manager/safety.mjs';
import {childEnvironment,fileHash,runProcess,validateVideo} from './media.mjs';

export const TEMPLATE_ID='horror-door-5s-v1';
export const HORROR_TOPIC='The Door That Opened Itself';
export const HORROR_SCRIPT='I locked the door. Then something knocked from inside.';
export function templateJob(runId){
  demand(uuid(runId),'INVALID_ACCEPTANCE_RUN');const project='door-5s-'+runId;
  return {brand_id:'10000000-0000-4000-8000-000000000001',source_type:'approved_openmontage',source:{root_id:'generated',relative_path:`horror/${project}/final/the_door_that_opened_itself.mp4`,engine_project:project},topic:HORROR_TOPIC,idempotency_key:'generated-5s:'+runId,
    production_settings:{generation_template:TEMPLATE_ID,acceptance_run_id:runId,expected_width:1080,expected_height:1920,min_duration:4.8,max_duration:5.2,require_audio:true,requires_ai:true,platforms:['youtube','instagram','facebook'],timeout_ms:240000,ai_request:{task_type:'script_generation',input:{topic:HORROR_TOPIC,script:HORROR_SCRIPT,duration_seconds:5,scene_count:1,language:'en'},output_schema_version:'social-studio.ai.v2',provider_policy:{mode:'mock',providers:['mock']},maximum_cost:0,timeout_ms:15000,retry_policy:{max_attempts_per_provider:1,initial_backoff_ms:100}}},
    metadata:{title:HORROR_TOPIC,description:'Original fictional five-second Horror production. Supplied-script fixture; local Piper narration and original animated scene/audio. MOCK-PUBLISH TEST ONLY.',caption:'I locked the door. The knocking came from inside. Original fiction.',hashtags:['#Horror','#ShortStory','#OriginalFiction']}};
}
export function verifyTemplateJob(job,config){
  const run=job.production_settings?.acceptance_run_id;demand(uuid(run),'TEMPLATE_ACCEPTANCE_RUN_REQUIRED');
  const expected=templateJob(run),project=expected.source.engine_project,grant=config.approved_engine_projects?.[project];
  demand(grant?.template_id===TEMPLATE_ID&&grant.acceptance_run_id===run&&Date.now()<Date.parse(grant.expires_at),'ENGINE_PROJECT_NOT_PREAPPROVED');
  demand(job.brand_id===expected.brand_id&&job.brand_slug==='horror'&&job.source_type==='approved_openmontage'&&job.topic===HORROR_TOPIC,'TEMPLATE_BRAND_OR_TOPIC_MISMATCH');
  demand(JSON.stringify(canonical(job.source_reference))===JSON.stringify(canonical(expected.source)),'TEMPLATE_OUTPUT_PATH_MISMATCH');
  demand(job.production_settings.generation_template===TEMPLATE_ID&&job.production_settings.expected_width===1080&&job.production_settings.expected_height===1920,'TEMPLATE_SETTINGS_MISMATCH');
  demand(job.content_metadata?.ai_output?.narration_text===HORROR_SCRIPT&&uuid(job.content_metadata.ai_task_id),'TEMPLATE_APPROVED_SCRIPT_REQUIRED');
  return {run,project,grant};
}
export async function renderHorrorTemplate(job,config,signal){
  const {project,grant}=verifyTemplateJob(job,config),begin=performance.now();
  const script=path.join(config.workspace,'services/production-adapter/generate-horror-template.py');
  demand(await fileHash(script)===grant.runner_sha256,'TEMPLATE_RUNNER_DIGEST_CHANGED');
  const dir=safeProjectDirectory(config.workspace,path.join('generated-videos','horror',project));
  const target=path.join(dir,'final/the_door_that_opened_itself.mp4');demand(!fs.existsSync(target),'EXISTING_OUTPUT_PRESERVED');
  const request=path.join(dir,'generation-job.json');demand(!fs.existsSync(request),'EXISTING_GENERATION_STATE_REQUIRES_REVIEW');
  fs.writeFileSync(request,JSON.stringify({schema_version:1,job_id:job.id,brand_id:job.brand_id,project_id:project,template_id:TEMPLATE_ID,topic:job.topic,script:job.content_metadata.ai_output.narration_text,script_source:'owner-supplied deterministic AI-manager fixture',ai_task_id:job.content_metadata.ai_task_id,content_version:job.content_version,acceptance_run_id:job.production_settings.acceptance_run_id},null,2),{flag:'wx'});
  const logs=safeProjectDirectory(config.workspace,path.join('generated-videos','horror',project,'logs')),samples=[];let busy=false;
  async function sample(){if(busy)return;busy=true;try{const row={at:new Date().toISOString(),host_ram_used_bytes:os.totalmem()-os.freemem(),scope:'whole host/GPU, includes other applications'};try{const gpu=await runProcess('C:\\Windows\\System32\\nvidia-smi.exe',['--query-gpu=memory.used,utilization.gpu','--format=csv,noheader,nounits'],{workspace:config.workspace,timeoutMs:3000});if(gpu.exit_code===0)row.gpu=gpu.stdout.trim();}catch{}samples.push(row);}finally{busy=false;}}
  await sample();const sampler=setInterval(()=>sample().catch(()=>{}),1000);
  const env=childEnvironment(config.workspace);env.PATH=[path.join(config.workspace,'.runtime/openmontage-pilot/venv/Scripts'),config.ffmpeg_bin,env.PATH].join(';');
  let result;try{result=await runProcess(path.join(config.workspace,'.runtime/openmontage-pilot/venv/Scripts/python.exe'),['-I',script,request],{workspace:config.workspace,signal,env,timeoutMs:job.production_settings.timeout_ms??240000});}finally{clearInterval(sampler);await sample();fs.writeFileSync(path.join(logs,'resources.json'),JSON.stringify(samples,null,2));}
  fs.writeFileSync(path.join(logs,'worker-process.json'),JSON.stringify({exit_code:result.exit_code,elapsed_seconds:result.elapsed_seconds,timed_out:result.timed_out,cancelled:result.cancelled,cleanup_failed:result.cleanup_failed},null,2));
  fs.writeFileSync(path.join(logs,'render.stdout'),result.stdout);fs.writeFileSync(path.join(logs,'render.stderr'),result.stderr);
  demand(!result.cleanup_failed,'PROCESS_TREE_CLEANUP_UNVERIFIED');demand(!result.cancelled&&!result.timed_out&&result.exit_code===0,result.cancelled?'CANCELLED':result.timed_out?'PROCESS_TIMEOUT':'OPENMONTAGE_TEMPLATE_FAILED');
  const generated=JSON.parse(fs.readFileSync(path.join(logs,'generation-result.json'),'utf8'));
  demand(generated.job_id===job.id&&generated.success===true&&generated.new_render===true,'TEMPLATE_RESULT_INVALID');
  const effective={...job,production_settings:{...job.production_settings,subtitle_reference:{root_id:'generated',relative_path:`horror/${project}/subtitles/captions.srt`},licence_reference:{root_id:'generated',relative_path:`horror/${project}/assets/ATTRIBUTION.md`,checksum:await fileHash(path.join(dir,'assets/ATTRIBUTION.md'))}}};
  const validation=await validateVideo(effective,config,signal);
  return {...validation,elapsed_seconds:(performance.now()-begin)/1000,generation_seconds:result.elapsed_seconds,engine:'OpenMontage registry video_compose',script_source:generated.script_source,narration:generated.narration,subtitle_burn_evidence:generated.subtitle_burn_evidence,source_job_id:job.id,new_render:true,resource_samples:samples.length};
}
