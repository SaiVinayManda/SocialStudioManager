// Actual deployed n8n acceptance, never a local-function substitute for rendering.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {localGrant,readLocalKey,control,until} from './studio-test-client.mjs';import {templateJob,HORROR_SCRIPT} from '../services/production-adapter/horror-template.mjs';import {signWebhook} from '../services/studio-runtime/contracts.mjs';import {fileHash,childEnvironment} from '../services/production-adapter/media.mjs';
const root=localGrant(),session=path.join(root,'.runtime/orchestrator/generated-video-session.json'),run=JSON.parse(fs.readFileSync(session,'utf8'));
assert(/^[a-f0-9-]{36}$/.test(run.id));
const dir=path.join(root,'docs/test-evidence/generated-video',run.id);fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,'e2e.json'),evidence=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{run_id:run.id,started_utc:run.started_utc,tests:[],model_inferences:0,public_posts:0};
const save=()=>fs.writeFileSync(file,JSON.stringify(evidence,null,2)+'\n');
function query(database,sql){const r=spawnSync('C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe',['-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml','exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d',database,'-At','-c',sql],{cwd:root,windowsHide:true,env:{...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')},encoding:'utf8',timeout:15000,maxBuffer:1048576});assert.equal(r.status,0,'Metadata query failed; raw errors omitted');return JSON.parse(r.stdout.trim()||'null');}
async function webhook(route,body){const r=await fetch('http://127.0.0.1:5678/webhook/social-studio/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(signWebhook(body,readLocalKey('webhook_key'))),signal:AbortSignal.timeout(15000)});assert(r.ok,'Deployed signed n8n webhook failed');return r.json();}
try{
  const body=templateJob(run.id);
  if(!evidence.job_id){const accepted=await webhook('intake',body);assert(accepted.job_id);evidence.job_id=accepted.job_id;save();}
  const id=evidence.job_id;assert(/^[a-f0-9-]{36}$/.test(id));
  const review=await until(async()=>{const j=await control('/jobs/'+id);if(['failed','cancelled','manual_review'].includes(j.status)){evidence.job_error=j.error_details;save();throw Error('GENERATION_'+j.status.toUpperCase());}const a=await control('/approvals?job_id='+id);return a.approvals?.[0];},{timeout:300000,interval:1500});
  const j=await control('/jobs/'+id),output=await control('/jobs/'+id+'/output');
  assert.equal(j.source_type,'approved_openmontage');assert.equal(j.content_metadata.ai_output.narration_text,HORROR_SCRIPT);
  const asset=output.asset,target=path.join(root,'generated-videos',asset.file_reference.relative_path);
  assert.equal(asset.validation_report.new_render,true);assert.equal(asset.validation_report.source_job_id,id);assert.equal(asset.validation_status,'passed');
  assert.equal(asset.checksum,await fileHash(target));assert.notEqual(asset.checksum,'48fb3d02aecb4e83c43654d111194fd44870011c229a8b7387d8a83096858528');
  assert(asset.duration>=4.8&&asset.duration<=5.2&&asset.width===1080&&asset.height===1920);
  assert.equal(asset.validation_report.full_decode_exit_code,0);assert.equal(asset.validation_report.ffprobe_exit_code,0);
  evidence.asset={id:asset.id,job_id:id,path:target,checksum:asset.checksum,duration:asset.duration,width:asset.width,height:asset.height,bytes:asset.byte_size,validation_report:asset.validation_report};
  evidence.ai=await control('/ai/tasks/'+j.content_metadata.ai_task_id);evidence.ai_history=await control('/ai/tasks/'+j.content_metadata.ai_task_id+'/history');evidence.approval={id:review.id,checksum:review.content_checksum,content_version:review.content_version};
  evidence.tests=[...new Set([...evidence.tests,'new MP4 produced by native worker from deployed n8n generation job','Piper narration and explicit supplied-script AI fixture','FFprobe and full media decode','PostgreSQL media checksum and brand linkage'])];save();
  if(!process.argv.includes('--finish-mock-test')){console.log(JSON.stringify({rendered:true,job_id:id,output:target,approval:'pending mock-test decision',evidence:file}));}
  else{
    evidence.full_quality=JSON.parse(fs.readFileSync(path.join(path.dirname(path.dirname(target)),'logs/full-quality.json'),'utf8'));assert(evidence.full_quality.passed&&evidence.full_quality.checksum===asset.checksum,'Matching full QC evidence required before test approval');
    if(review.decision==='pending'){
      await control('/scheduler/tick',{method:'POST',role:'n8n',body:{job_id:id},expect:409});evidence.tests.push('unapproved generated asset cannot be scheduled');
      await control(`/approvals/${review.id}/decision`,{method:'POST',role:'n8n',body:{},expect:403});
      await control(`/approvals/${review.id}/decision`,{method:'POST',body:{decision:'approved',checksum:review.content_checksum,content_version:review.content_version,test_mock_only:true,comments:'MOCK-PUBLISH TEST APPROVAL: owner explicitly permits this isolated generated-video acceptance test only. No public publishing.'}});
    }
    const publications=await until(async()=>{const r=await control('/publishing?job_id='+id);return r.publishing_jobs.length===3&&r.publishing_jobs.every(p=>p.status==='published')?r.publishing_jobs:null;},{timeout:120000});
    assert.deepEqual(publications.map(p=>p.platform).sort(),['facebook','instagram','youtube']);
    for(const p of publications){assert.equal(p.mode,'mock');assert.equal(p.media_asset_id,asset.id);assert.equal(p.approved_checksum,asset.checksum);assert.equal(p.attempt_count,1);assert(p.platform_post_id.startsWith('mock-'+p.platform));}
    evidence.publishing_results=publications.map(p=>({id:p.id,platform:p.platform,mode:p.mode,status:p.status,post_id:p.platform_post_id,media_asset_id:p.media_asset_id,checksum:p.approved_checksum,attempt_count:p.attempt_count,completed_at:p.updated_at,last_error:p.last_error}));
    const duplicate=await webhook('intake',body);assert.equal(duplicate.job_id,id);await new Promise(r=>setTimeout(r,3000));assert.equal((await control('/publishing?job_id='+id)).publishing_jobs.length,3);evidence.tests.push('duplicate n8n intake retains one job and three single-attempt mock publications');
    evidence.report=await webhook('reports',{operation:'report',job_id:id});
    const notices=await until(async()=>{const r=await control('/notifications');const n=r.notifications.filter(n=>n.job_id===id);return n.filter(x=>x.event_type==='publishing.succeeded').length===3?n:null;});evidence.notifications=notices.map(n=>({id:n.id,event_type:n.event_type,sink:n.sink}));
    evidence.production_tasks=query('social_studio',`SELECT json_agg(x) FROM (SELECT id,kind,status,attempts,created_at,updated_at FROM studio.production_tasks WHERE job_id='${id}' ORDER BY created_at) x`);
    evidence.events=query('social_studio',`SELECT json_agg(x) FROM (SELECT id,event_type,event_payload,created_at FROM studio.job_events WHERE job_id='${id}' ORDER BY id) x`);
    const since=new Date(run.started_utc).toISOString();
    evidence.workflow_executions=await until(async()=>{const rows=query('n8n_internal',`SELECT COALESCE(json_agg(x),'[]') FROM (SELECT e.id,e."workflowId" AS workflow_id,e.status,e."startedAt" AS started_at,e."stoppedAt" AS stopped_at FROM n8n.execution_entity e JOIN n8n.execution_data d ON d."executionId"=e.id WHERE e."startedAt">='${since}'::timestamptz AND e."workflowId" LIKE 'socialstudio%' AND d.data LIKE '%${id}%' ORDER BY e.id) x`);return new Set(rows.filter(r=>r.status==='success').map(r=>r.workflow_id)).size>=10?rows:null;},{timeout:90000,interval:3000});
    evidence.tests.push('actual n8n approval, scheduler and three mock platform workflows completed','durable publishing results, notifications and reporting');evidence.passed=true;delete evidence.error;
    console.log(JSON.stringify({passed:true,job_id:id,output:target,evidence:file,public_posts:0}));
  }
}catch(error){evidence.passed=false;evidence.error={code:error.code??error.message};console.log(JSON.stringify({passed:false,error:evidence.error,evidence:file}));process.exitCode=1;}
evidence.updated_utc=new Date().toISOString();save();
