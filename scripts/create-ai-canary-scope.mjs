// Proposal only. A manifest cannot grant authorization. Preserve an existing one.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=process.cwd(),files=[];
function collect(relative){const dir=path.join(root,relative);for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.isSymbolicLink())throw Error('SCOPE_LINK_FORBIDDEN');const rel=relative+'/'+entry.name;if(entry.isDirectory())collect(rel);else files.push(rel);}}
collect('services/ai-agent-manager');
files.push(...['server','contracts','db','operations'].map(x=>'services/studio-runtime/'+x+'.mjs'),'services/studio-runtime/package-lock.json','services/production-adapter/store.mjs','services/production-adapter/media.mjs','infrastructure/postgres/migrations/002-ai-brain.sql','infrastructure/n8n/workflows/02-ai-content-preparation.json');
files.push(...['ai-brain-canary.mjs','verify-ai-artifacts.mjs','record-ai-deployment.mjs','studio-test-client.mjs','generate-studio-workflows.mjs','check-ai-openmontage.py'].map(f=>'scripts/'+f));
files.push(...['horror','storytelling','motivation','travel','business-insights','company'].map(s=>'brands/'+s+'/config/ai.json'));
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const manifest={approval_id:'E2-REAL-CANARY-01',proposal_only:true,created_at:new Date().toISOString(),maximum_inference_requests:1,maximum_cost_usd:0,files:[...new Set(files)].sort().map(file=>({path:file,sha256:digest(file)}))};
const output='docs/AI_BRAIN_CANARY_SCOPE.json';fs.writeFileSync(path.join(root,output),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({proposal_only:true,files:manifest.files.length,scope_manifest_sha256:digest(output),packet_sha256:digest('docs/AI_BRAIN_CANARY_APPROVAL.md'),real_model_permission_granted:false}));
