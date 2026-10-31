import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {childEnvironment} from '../services/production-adapter/media.mjs';
import {localGrant,control} from './studio-test-client.mjs';import {demand,uuid} from '../services/studio-runtime/contracts.mjs';
const root=localGrant(),run=process.argv[2];demand(uuid(run),'CANARY_RUN_ID_REQUIRED');
const canary=JSON.parse(fs.readFileSync(path.join(root,'docs/test-evidence/milestone-e2',run,'canary.json'),'utf8'));
const dir=path.join(root,'docs/test-evidence/milestone-e2',new Date().toISOString().replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});
const exe='C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe',prefix=['-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml'];
const env={...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};
function command(args,input){const r=spawnSync(exe,[...prefix,...args],{cwd:root,env,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,input});demand(r.status===0,'AI_DEPLOYMENT_METADATA_FAILED');return r.stdout.trim();}
const report=JSON.parse(fs.readFileSync(path.join(root,'.runtime/ai-brain/discovery/report.json'),'utf8'));report.codex_version=fs.readFileSync(path.join(root,'.runtime/ai-brain/discovery/codex-version.txt'),'utf8').match(/^codex-cli \d+\.\d+\.\d+/m)?.[0];demand(report.codex_version,'CODEX_VERSION_EVIDENCE_MISSING');
const imported=JSON.parse(command(['exec','-T','studio-api','node','/studio/services/ai-agent-manager/record-discovery.mjs'],JSON.stringify(report)));demand(imported.passed,'DISCOVERY_IMPORT_FAILED');
fs.writeFileSync(path.join(dir,'provider-discovery.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
const since=new Date(canary.started_at).toISOString();demand(uuid(canary.job_id)&&uuid(canary.task_id),'INVALID_CANARY_METADATA');
const queries={
  n8n:['n8n_internal',`SELECT json_build_object('workflow_02',(SELECT json_build_object('id',id,'active',active) FROM n8n.workflow_entity WHERE id='socialstudio0002'),'canary_workflow_executions',(SELECT json_agg(x) FROM (SELECT id,"workflowId",status,"startedAt","stoppedAt" FROM n8n.execution_entity WHERE "workflowId" IN ('socialstudio0001','socialstudio0002') AND "startedAt">='${since}'::timestamptz ORDER BY id) x))`],
  postgres:['social_studio',`SELECT json_build_object('task',(SELECT json_build_object('id',id,'brand_id',brand_id,'job_id',job_id,'status',status,'provider_used',provider_used,'output_checksum',output_checksum) FROM studio.ai_tasks WHERE id='${canary.task_id}'),'outputs',(SELECT count(*) FROM studio.ai_outputs WHERE task_id='${canary.task_id}'),'attempts',(SELECT count(*) FROM studio.ai_task_attempts WHERE task_id='${canary.task_id}'),'production_tasks',(SELECT count(*) FROM studio.production_tasks WHERE job_id='${canary.job_id}'),'publishing_jobs',(SELECT count(*) FROM studio.publishing_jobs WHERE content_job_id='${canary.job_id}'),'schema_versions',(SELECT json_agg(version ORDER BY version) FROM studio.schema_migrations))`]
};
const proof={};for(const [name,[database,sql]]of Object.entries(queries)){proof[name]=JSON.parse(command(['exec','-T','postgres','psql','-U','studio_bootstrap','-d',database,'-At','-c',sql]));fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(proof[name],null,2)+'\n',{flag:'wx'});}
demand(proof.postgres.outputs===1&&proof.postgres.production_tasks===0&&proof.postgres.publishing_jobs===0,'AI_DURABLE_OUTPUT_BOUNDARY_FAILED');
demand(proof.n8n.canary_workflow_executions.some(e=>e.workflowId==='socialstudio0002'&&e.status==='success'),'AI_WORKFLOW_NOT_ACTUALLY_SUCCESSFUL');
const providerStatus=await control('/ai/providers/status');fs.writeFileSync(path.join(dir,'providers.json'),JSON.stringify(providerStatus,null,2)+'\n',{flag:'wx'});
const services=JSON.parse(command(['ps','--format','json']).split(/\r?\n/).filter(Boolean).join(',' ).replace(/^/,'[').replace(/$/,']'));
const health=services.map(s=>({service:s.Service,state:s.State,health:s.Health}));fs.writeFileSync(path.join(dir,'services.json'),JSON.stringify(health,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,evidence:dir,workflow_02_success:true,persisted_ai_outputs:proof.postgres.outputs,provider_inference_verified:false,services:health}));
