// All acceptance generation starts at the ACTUAL signed n8n intake webhook.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sessionFile,save,webhook,control,until,sql} from './e3-common.mjs';import {fileHash} from '../services/production-adapter/media.mjs';
const run=JSON.parse(fs.readFileSync(sessionFile,'utf8')),dir=path.join(root,'docs/test-evidence/milestone-e3',run.id);assert(/^[a-f0-9-]{36}$/.test(run.id));
const chosen=process.argv.find(x=>x.startsWith('--case='))?.slice(7);const finish=process.argv.includes('--finish-mock-tests');
for(const c of run.cases.filter(c=>!chosen||c.key===chosen)){
 const record=path.join(dir,c.key+'-attempt-'+c.attempt+'.json');let e=fs.existsSync(record)?JSON.parse(fs.readFileSync(record,'utf8')):{key:c.key,title:c.title,topic:c.topic,started_at:new Date().toISOString(),script_source:'explicit fixture fallback',model_calls:0,public_posts:0};
 try{
  const body={source_type:'topic',brand_id:'10000000-0000-4000-8000-000000000001',topic:c.topic,duration_seconds:5,idempotency_key:`e3:${run.id}:${c.key}:${c.attempt}`,provider_mode:'fixture',acceptance_run_id:c.acceptance_run_id};
  if(!e.job_id){const accepted=await webhook('intake',body);assert(accepted.job_id);e.job_id=accepted.job_id;save(record,e);}
  const id=e.job_id;assert(/^[a-f0-9-]{36}$/.test(id));
  const review=await until(async()=>{const j=await control('/jobs/'+id);if(['failed','cancelled','manual_review'].includes(j.status)){e.job_error=j.error_details;save(record,e);throw Error('GENERATION_'+j.status);}const a=await control('/approvals?job_id='+id);return a.approvals[0];},{timeout:360000,interval:1500});
  const job=await control('/jobs/'+id),output=await control('/jobs/'+id+'/output'),asset=output.asset;
  assert.equal(job.production_settings.generation_template,'storyboard-v1');assert.equal(asset.validation_report.new_render,true);assert.equal(asset.validation_report.source_job_id,id);assert.equal(asset.validation_status,'passed');assert.equal(asset.validation_report.full_decode_exit_code,0);assert(asset.duration>=4.85&&asset.duration<=5.15&&asset.width===1080&&asset.height===1920);
  const file=path.join(root,'generated-videos',asset.file_reference.relative_path);assert.equal(await fileHash(file),asset.checksum);assert(asset.validation_report.quality.passed);
  const ai=await control('/ai/tasks/'+job.content_metadata.ai_task_id);assert.equal(ai.status,'completed');assert.equal(ai.simulated,true);assert.equal(ai.provider_used,'mock');assert.equal(ai.attempt_history.length,1);
  e.ai={task_id:ai.id,provider:ai.provider_used,model:ai.model_used,simulated:ai.simulated,duration_ms:ai.duration_ms,checksum:ai.output_checksum,attempt_history:ai.attempt_history};e.script=ai.validated_output.script.narration_text;e.package=ai.validated_output;e.asset={...asset,windows_path:file};e.approval={id:review.id,checksum:review.content_checksum,version:review.content_version};e.rendered_at=asset.created_at;save(record,e);
  if(finish){
   const comparison=JSON.parse(fs.readFileSync(path.join(dir,'visual-comparison.json'),'utf8'));assert(comparison.passed,'Distinct visual comparison must pass before mock-test approvals');
   if(review.decision==='pending'){
    await control('/scheduler/tick',{method:'POST',role:'n8n',body:{job_id:id},expect:409});
    await control('/approvals/'+review.id+'/decision',{method:'POST',body:{decision:'approved',checksum:review.content_checksum,content_version:review.content_version,test_mock_only:true,comments:'MOCK-PUBLISH TEST APPROVAL — owner E3 acceptance only. No human creative signoff or public posting permission.'}});
   }
   const pubs=await until(async()=>{const p=(await control('/publishing?job_id='+id)).publishing_jobs;return p.length===3&&p.every(x=>x.status==='published')?p:null;},{timeout:120000});
   for(const p of pubs){assert.equal(p.mode,'mock');assert.equal(p.media_asset_id,asset.id);assert.equal(p.approved_checksum,asset.checksum);assert.equal(p.attempt_count,1);}assert.deepEqual(pubs.map(p=>p.platform).sort(),['facebook','instagram','youtube']);
   e.publishing=pubs.map(p=>({id:p.id,platform:p.platform,status:p.status,post_id:p.platform_post_id,media_asset_id:p.media_asset_id,checksum:p.approved_checksum,attempt_count:p.attempt_count,completed_at:p.updated_at,last_error:p.last_error}));
   assert.equal((await webhook('intake',body)).job_id,id);assert.equal((await control('/publishing?job_id='+id)).publishing_jobs.length,3);
   e.report=await webhook('reports',{job_id:id,operation:'report'});
   e.notifications=await until(async()=>{const rows=(await control('/notifications')).notifications.filter(n=>n.job_id===id);return rows.filter(r=>r.event_type==='publishing.succeeded').length===3?rows.map(n=>({id:n.id,event_type:n.event_type,sink:n.sink})):null;});
   // The unique content UUID is the association. Do not drop intake evidence
   // because Docker and Windows clocks differ by a few milliseconds.
   e.executions=await until(async()=>{const rows=JSON.parse(sql('n8n_internal',`SELECT COALESCE(json_agg(x),'[]') FROM (SELECT e.id,e."workflowId" AS workflow_id,e.status,e."startedAt" AS started_at,e."stoppedAt" AS stopped_at FROM n8n.execution_entity e JOIN n8n.execution_data d ON d."executionId"=e.id WHERE e."workflowId" LIKE 'socialstudio%' AND d.data LIKE '%${id}%' ORDER BY e.id) x`));return new Set(rows.filter(r=>r.status==='success').map(r=>r.workflow_id)).size>=11?rows:null;},{timeout:90000,interval:3000});
   e.events=JSON.parse(sql('social_studio',`SELECT json_agg(x) FROM (SELECT id,event_type,created_at FROM studio.job_events WHERE job_id='${id}' ORDER BY id) x`));
   if(e.error)e.prior_test_harness_errors=[...(e.prior_test_harness_errors??[]),{error:e.error,resolution:'Actual publishing had completed. Corrected metadata association to unique job UUID without cross-host clock cutoff.'}];e.completed_at=new Date(Math.max(...pubs.map(p=>Date.parse(p.updated_at)))).toISOString();e.evidence_collected_at=new Date().toISOString();e.acceptance_passed=true;delete e.error;
  }
  console.log(JSON.stringify({case:c.key,rendered:true,pipeline_passed:e.acceptance_passed??false,job_id:id,output:file,evidence:record}));
 }catch(error){e.acceptance_passed=false;e.error=error.code??error.message;console.log(JSON.stringify({case:c.key,passed:false,error:e.error,evidence:record}));process.exitCode=1;save(record,e);break;}
 save(record,e);
}
