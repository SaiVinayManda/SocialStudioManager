import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {demand} from '../studio-runtime/contracts.mjs';
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export function verifyCanaryApproval(root){
  const receipt=path.join(root,'.runtime/ai-brain/canary-approval.json');
  demand(fs.existsSync(receipt)&&!fs.lstatSync(receipt).isSymbolicLink(),'ACTUAL_CANARY_OWNER_GRANT_REQUIRED');
  const grant=JSON.parse(fs.readFileSync(receipt,'utf8'));
  demand(grant.approval_id==='E2-REAL-CANARY-01'&&grant.approved===true&&grant.zero_cost_route_confirmed_by_owner===true,'ACTUAL_CANARY_OWNER_GRANT_REQUIRED');
  demand(Number.isFinite(Date.parse(grant.approved_at))&&Date.parse(grant.approved_at)<=Date.now()&&Date.parse(grant.expires_at)-Date.parse(grant.approved_at)<=1200000,'INVALID_CANARY_APPROVAL_WINDOW');
  demand(Date.now()<Date.parse(grant.expires_at)&&Date.parse(grant.expires_at)<=Date.parse('2026-11-01T18:00:00Z'),'CANARY_APPROVAL_EXPIRED');
  demand(grant.maximum_calls===1&&grant.maximum_cost_usd===0&&grant.model==='oc/jev-1.13-free','CANARY_SCOPE_CHANGED');
  demand(digest(path.join(root,'docs/AI_BRAIN_CANARY_APPROVAL.md'))===grant.packet_sha256&&digest(path.join(root,'docs/AI_BRAIN_CANARY_SCOPE.json'))===grant.scope_manifest_sha256,'CANARY_APPROVAL_DIGEST_CHANGED');
  const scope=JSON.parse(fs.readFileSync(path.join(root,'docs/AI_BRAIN_CANARY_SCOPE.json'),'utf8'));
  for(const file of scope.files){demand(/^(services|scripts|infrastructure|brands)\/[A-Za-z0-9/_.-]+$/.test(file.path)&&!file.path.split('/').includes('..'),'INVALID_CANARY_SCOPE_PATH');demand(digest(path.join(root,file.path))===file.sha256,'CANARY_IMPLEMENTATION_DIGEST_CHANGED');}
  return grant;
}
