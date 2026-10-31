// Read-only source inventory plus a BLOCKED proposal. Never creates an approval,
// inspects protected model config or marks an unverified route ready to run.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=process.cwd(),files=[];
for(const dir of ['services/ai-agent-manager','services/production-adapter','services/studio-runtime'])for(const name of fs.readdirSync(path.join(root,dir)))if(/\.(mjs|py)$/.test(name))files.push(dir+'/'+name);
for(const slug of ['horror','storytelling','motivation','travel','business-insights','company'])for(const file of ['ai.json','production.json','asset-catalog.json'])files.push(`brands/${slug}/config/${file}`);
files.push('infrastructure/n8n/workflows/02-ai-content-preparation.json','docs/E3_AI_APPROVAL.md');
const manifest={approval_id:'E3-REAL-AI-01',state:'BLOCKED_ROUTE_EVIDENCE',prepared_at:new Date().toISOString(),expires_at:'2026-11-01T16:00:00Z',model:'agnes/agnes-2.5-flash',endpoint:'http://127.0.0.1:20128/v1/chat/completions',maximum_calls:3,maximum_cost_usd:0,owner_approved:false,files:files.sort().map(relative=>({path:relative,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,relative))).digest('hex')}))};
fs.writeFileSync(path.join(root,'docs/E3_AI_SCOPE.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({state:manifest.state,files:manifest.files.length,model_requests:0,owner_grant_created:false}));
