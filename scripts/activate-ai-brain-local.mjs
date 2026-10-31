// E2 local implementation only. No installs, new secrets, model auth or inference.
// Uses the existing application's operator CLI and internal database connection.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {demand} from '../services/studio-runtime/contracts.mjs';
import {childEnvironment} from '../services/production-adapter/media.mjs';
import {localGrant} from './studio-test-client.mjs';
const root=localGrant();demand(process.argv.includes('--local-mock-only'),'LOCAL_MOCK_ONLY_CONFIRMATION_REQUIRED');
const env={...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};
const exe='C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe';
const prefix=['-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml'];
const evidence=path.join(root,'docs/test-evidence/milestone-e2',new Date().toISOString().replaceAll(/[:.]/g,'-'));fs.mkdirSync(evidence,{recursive:true});
const events=[];
function command(name,args,{input}={}){
  const r=spawnSync(exe,[...prefix,...args],{cwd:root,env,windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:1048576,input});
  // Never persist raw CLI errors or imported execution data. Only typed receipts.
  events.push({name,exit_code:r.status,at:new Date().toISOString()});
  fs.writeFileSync(path.join(evidence,'activation.json'),JSON.stringify({steps:events,model_requests:0,credentials_created:0,public_posts:0},null,2));
  demand(r.status===0,'AI_LOCAL_STEP_FAILED_'+name);return r.stdout.trim();
}
const sql=q=>command('read-migration-metadata',['exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d','social_studio','-At','-c',q]);
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
demand(sql('SELECT checksum FROM studio.schema_migrations WHERE version=1')===digest('infrastructure/postgres/migrations/001-foundation.sql'),'FOUNDATION_DIGEST_CHANGED');
const v2=digest('infrastructure/postgres/migrations/002-ai-brain.sql'),existing=sql('SELECT checksum FROM studio.schema_migrations WHERE version=2');
if(existing)demand(existing===v2,'AI_MIGRATION_DIGEST_CHANGED');
else command('apply-ai-migration',['exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-v','migration_checksum='+v2,'-U','studio_bootstrap','-d','social_studio','-f','/studio-migrations/002-ai-brain.sql']);
demand(sql('SELECT checksum FROM studio.schema_migrations WHERE version=2')===v2,'AI_MIGRATION_NOT_VERIFIED');
command('restart-studio-api',['restart','studio-api']);
// Import only the changed workflow. Preserve all other workflow definitions and
// existing encrypted credential references; no owner bootstrap or secret reads.
const workflowUpdated=!process.argv.includes('--refresh-api-only');
if(workflowUpdated){
  command('import-workflow-02',['exec','-T','n8n','n8n','import:workflow','--input=/studio-workflows/02-ai-content-preparation.json']);
  command('publish-workflow-02',['exec','-T','n8n','n8n','publish:workflow','--id=socialstudio0002']);
  command('restart-n8n',['restart','n8n']);
}
console.log(JSON.stringify({evidence,migration_version:2,migration_checksum:v2,workflow:'socialstudio0002',workflow_updated:workflowUpdated,real_providers_activated:false,model_requests:0,public_posts:0}));
