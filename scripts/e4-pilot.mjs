// This remains blocked until the NEW owner grant and verified route exist.
// Never creates its own approval or edits 9Router credentials/settings.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,save,compose,webhook,control,until,restartMediaWorker,sql} from './e3-common.mjs';import {verifyE4Policy,e4Body} from '../services/ai-agent-manager/e4-policy.mjs';import {E4_ID,E4_MODEL} from '../services/ai-agent-manager/e4-route.mjs';import {childEnvironment,fileHash} from '../services/production-adapter/media.mjs';import {runnerFiles} from '../services/production-adapter/dynamic-render.mjs';
import {e4PublicPreflight} from '../services/ai-agent-manager/e4-public-preflight.mjs';
assert(process.argv.includes('--approved='+E4_ID),'New E4 approval required');const verified=verifyE4Policy(root),{grant,scope}=verified;
const local=path.join(root,'.runtime/ai-brain'),sessionFile=path.join(local,'e4-session.json'),dir=path.join(root,'docs/test-evidence/milestone-e4',grant.run_id),body=e4Body(grant.run_id);fs.mkdirSync(dir,{recursive:true});
const readiness={approval_id:E4_ID,expires_at:grant.expires_at,brand_id:body.brand_id,topic:body.topic,idempotency_key:body.idempotency_key,acceptance_run_id:body.acceptance_run_id,maximum_cost:0,model:E4_MODEL,scope_sha256:grant.scope_sha256,route_evidence_sha256:grant.route_evidence_sha256};
const evidenceFile=path.join(dir,'e2e.json'),evidence=fs.existsSync(evidenceFile)?JSON.parse(fs.readFileSync(evidenceFile,'utf8')):{run_id:grant.run_id,started_at:new Date().toISOString(),public_posts:0,fixture_used:false};
try{
 evidence.public_pricing=await e4PublicPreflight();
 if(!fs.existsSync(sessionFile))save(sessionFile,{run_id:grant.run_id,scope_sha256:grant.scope_sha256});let session=JSON.parse(fs.readFileSync(sessionFile,'utf8'));assert.equal(session.scope_sha256,grant.scope_sha256);
 if(!session.job_id){
  compose(['restart','studio-api']);
  compose(['exec','-T','studio-api','node','/studio/services/ai-agent-manager/e4-readiness.mjs'],JSON.stringify(readiness));
  await restartMediaWorker(async config=>({...config,dynamic_render_policy:{enabled:true,policy_id:grant.run_id,maximum_jobs:1,expires_at:grant.expires_at,allowed_brands:['horror'],acceptance_runs:[grant.run_id],allow_operator_topic_jobs:false,max_duration_seconds:5,runner_digests:Object.fromEntries(await Promise.all(runnerFiles.map(async f=>[f,await fileHash(path.join(root,'services/production-adapter',f))]))),scope:'Owner-approved E4 one real-AI video only; mock publishing only'}}),path.join(root,'.runtime/orchestrator/e4',grant.run_id));
  const accepted=await webhook('intake',body);assert(accepted.job_id);session={...session,job_id:accepted.job_id};save(sessionFile,session);
 }
 evidence.job_id=session.job_id;save(evidenceFile,evidence);
 const current=await control('/jobs/'+session.job_id);
 if(current.status==='queued'){
  const r=spawnSync(process.execPath,['services/ai-agent-manager/e4-worker.mjs','--approved='+E4_ID],{cwd:root,env:childEnvironment(root),encoding:'utf8',windowsHide:true,timeout:190000,maxBuffer:1048576});evidence.ai_worker_exit_code=r.status;fs.writeFileSync(path.join(dir,'ai-worker.log'),(r.stdout??'')+(r.stderr??''));assert.equal(r.status,0,'Real AI worker failed; preserve request ledger, never blindly retry');
 }
 compose(['exec','-T','studio-api','node','/studio/services/ai-agent-manager/e4-readiness.mjs','--withdraw'],JSON.stringify(readiness));
 const approval=await until(async()=>{const j=await control('/jobs/'+session.job_id);if(['failed','cancelled','manual_review'].includes(j.status)){evidence.job_error=j.error_details;throw Error('E4_PRODUCTION_'+j.status);}return (await control('/approvals?job_id='+j.id)).approvals[0];},{timeout:300000,interval:1500});
 const job=await control('/jobs/'+session.job_id),output=await control('/jobs/'+job.id+'/output'),ai=await control('/ai/tasks/'+job.content_metadata.ai_task_id);assert.equal(ai.simulated,false);assert.equal(ai.status,'completed');assert.equal(ai.provider_used,'9router');assert.equal(ai.input.script,undefined);assert(ai.attempt_history.some(a=>a.provider==='9router'&&a.status==='completed'&&!a.simulated));assert.equal(output.asset.validation_report.script_source,'real provider output');
 const file=path.join(root,'generated-videos',output.asset.file_reference.relative_path);assert.equal(await fileHash(file),output.asset.checksum);assert(output.asset.validation_report.quality.passed);
 evidence.ai=ai;evidence.asset={...output.asset,windows_path:file};evidence.approval={id:approval.id,checksum:approval.content_checksum,version:approval.content_version};evidence.request_ledger=JSON.parse(fs.readFileSync(path.join(local,'e4-usage-'+grant.run_id+'.json'),'utf8'));assert.equal(evidence.request_ledger.calls,1);save(evidenceFile,evidence);
 if(process.argv.includes('--complete-mock-test')){
  if(approval.decision==='pending')await control('/approvals/'+approval.id+'/decision',{method:'POST',body:{decision:'approved',checksum:approval.content_checksum,content_version:approval.content_version,test_mock_only:true,comments:'E4 authorised checksum-bound MOCK-PUBLISH TEST APPROVAL. Real model-generated local preview; no public posting permission.'}});
  evidence.publishing=await until(async()=>{const p=(await control('/publishing?job_id='+job.id)).publishing_jobs;return p.length===3&&p.every(p=>p.status==='published')?p:null;});for(const p of evidence.publishing){assert.equal(p.mode,'mock');assert.equal(p.attempt_count,1);assert.equal(p.media_asset_id,output.asset.id);assert.equal(p.approved_checksum,output.asset.checksum);}
  evidence.report=await webhook('reports',{operation:'report',job_id:job.id});const id=job.id;
  evidence.executions=await until(async()=>{const rows=JSON.parse(sql('n8n_internal',`SELECT json_agg(x) FROM (SELECT e.id,e."workflowId" AS workflow_id,e.status FROM n8n.execution_entity e JOIN n8n.execution_data d ON d."executionId"=e.id WHERE e."workflowId" LIKE 'socialstudio%' AND d.data LIKE '%${id}%' ORDER BY e.id) x`));return new Set((rows??[]).filter(r=>r.status==='success').map(r=>r.workflow_id)).size>=11?rows:null;},{timeout:90000});evidence.passed=true;
 }
 console.log(JSON.stringify({rendered:true,completed:evidence.passed??false,job_id:job.id,file,evidence:evidenceFile,public_posts:0}));
}catch(error){evidence.passed=false;evidence.error=error.code??error.message;console.log(JSON.stringify({passed:false,error:evidence.error,evidence:evidenceFile}));process.exitCode=1;}
evidence.updated_at=new Date().toISOString();save(evidenceFile,evidence);
