import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {childEnvironment} from '../services/production-adapter/media.mjs';
import {localGrant} from './studio-test-client.mjs';import {demand} from '../services/studio-runtime/contracts.mjs';
const root=localGrant(),stamp=new Date().toISOString(),dir=path.join(root,process.argv.includes('--e4')?'docs/test-evidence/milestone-e4/regressions':process.argv.includes('--e3')?'docs/test-evidence/milestone-e3/regressions':'docs/test-evidence/milestone-e2',stamp.replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});
const env={...childEnvironment(root),DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};
const exe='C:\\Program Files\\Docker\\Docker\\resources\\cli-plugins\\docker-compose.exe',prefix=['-p','socialstudio','-f','infrastructure/docker-compose.yml','-f','infrastructure/docker-compose.local-access.yml'];
function run(name,args){const r=spawnSync(exe,[...prefix,...args],{cwd:root,env,windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:2097152});let data;try{data=JSON.parse(r.stdout.trim());}catch{data={passed:false,error:'COMMAND_OR_JSON_FAILURE',exit_code:r.status};}fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(data,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({name,passed:data.passed??true,checks:data.checks??null,error:data.error??null,evidence:path.join(dir,name+'.json')}));demand(r.status===0&&data.passed!==false,'DEPLOYED_AI_CHECK_FAILED_'+name);return data;}
run('postgres-ai-checks',['exec','-T','studio-api','node','/studio/services/ai-agent-manager/in-container-tests.mjs']);
run('ai-api-auth-checks',['exec','-T','studio-api','node','/studio/services/ai-agent-manager/api-checks.mjs']);
run('existing-api-regression',['exec','-T','studio-api','node','/studio/services/studio-runtime/in-container-checks.mjs']);
if(process.argv.includes('--e4'))run('e4-scoped-intake-database-checks',['exec','-T','studio-api','node','/studio/services/ai-agent-manager/e4-database-tests.mjs']);
// Query the two databases separately; the app role never receives n8n access.
const n8n="SELECT json_build_object('workflows',(SELECT json_agg(json_build_object('id',id,'active',active)) FROM n8n.workflow_entity WHERE id LIKE 'socialstudio%'),'recent_executions',(SELECT json_agg(x) FROM (SELECT id,\"workflowId\",status,\"startedAt\",\"stoppedAt\" FROM n8n.execution_entity WHERE \"workflowId\" LIKE 'socialstudio%' ORDER BY id DESC LIMIT 30) x))";
run('n8n-execution-metadata',['exec','-T','postgres','psql','-U','studio_bootstrap','-d','n8n_internal','-At','-c',n8n]);
