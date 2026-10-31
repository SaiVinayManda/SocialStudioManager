// Creates only a conditional review inventory. Never owner grants or route proof.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {E4_ID,E4_MODEL,E4_TOPIC} from '../services/ai-agent-manager/e4-route.mjs';
const root=process.cwd(),file=path.join(root,'docs/E4_AI_SCOPE.json'),old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null,files=[];
for(const dir of ['services/ai-agent-manager','services/production-adapter','services/studio-runtime'])for(const name of fs.readdirSync(path.join(root,dir)))if(/\.(mjs|py)$/.test(name))files.push(dir+'/'+name);
for(const slug of ['horror','storytelling','motivation','travel','business-insights','company'])for(const name of ['ai.json','production.json','asset-catalog.json'])files.push(`brands/${slug}/config/${name}`);
for(const name of fs.readdirSync(path.join(root,'infrastructure/n8n/workflows')))if(name.endsWith('.json'))files.push('infrastructure/n8n/workflows/'+name);
files.push('scripts/e4-pilot.mjs','scripts/e3-common.mjs','scripts/studio-test-client.mjs','docs/E4_AI_APPROVAL.md','docs/E4_ROUTE_EVIDENCE.example.json','docs/E4_OWNER_GRANT.example.json');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
const manifest={approval_id:E4_ID,state:'REVIEWABLE_CONDITIONAL',owner_approved:false,prepared_at:new Date().toISOString(),expires_at:'2026-11-01T18:00:00Z',run_id:old?.approval_id===E4_ID&&old?.topic===E4_TOPIC?old.run_id:crypto.randomUUID(),model:E4_MODEL,topic:E4_TOPIC,maximum_calls:1,maximum_cost_usd:0,requires_owner_approval:true,requires_verified_live_route:true,files:files.sort().map(relative=>({path:relative,sha256:hash(relative)}))};
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({approval_id:E4_ID,state:manifest.state,scope_sha256:hash('docs/E4_AI_SCOPE.json'),files:manifest.files.length,run_id:manifest.run_id,model_requests:0,owner_grant_created:false}));
