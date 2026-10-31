// Read-only, unauthenticated metadata. Never reads 9Router's live config,
// credential stores, cookies or model keys; never sends an inference request.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {boundedJsonResponse} from '../services/ai-agent-manager/adapters.mjs';
const at=new Date().toISOString(),root=process.cwd(),dir=path.join(root,'docs/test-evidence/milestone-e4/connections',at.replaceAll(/[:.]/g,'-'));
fs.mkdirSync(dir,{recursive:true});const report={at,model_calls:0,credential_access:false,authentication_changes:false,local:[],models:[],official:{}};
for(const route of ['/v1/models','/api/models/alias','/api/combos','/api/pricing']){
 try{const r=await fetch('http://127.0.0.1:20128'+route,{redirect:'error',signal:AbortSignal.timeout(8000)});const item={route,http_status:r.status};
 if(r.ok&&route==='/v1/models'){const body=await boundedJsonResponse(r,{maxBytes:16777216});report.models=(body.data??[]).map(m=>({id:String(m.id).slice(0,200),owned_by:String(m.owned_by??'').slice(0,80)}));}else await r.body?.cancel();report.local.push(item);
 }catch(e){report.local.push({route,error:e.cause?.code??e.name});}
}
for(const [name,url]of [['catalog','https://openrouter.ai/api/v1/models'],['exact_endpoint','https://openrouter.ai/api/v1/models/nvidia/nemotron-3.5-super-vl:free/endpoints']]){
 try{const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});const item={url,http_status:r.status};if(r.ok){const body=await boundedJsonResponse(r,{maxBytes:16777216});item.body_sha256=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
 if(name==='catalog'){item.free_text_candidates=(body.data??[]).filter(m=>m.architecture?.output_modalities?.includes('text')&&m.id.endsWith(':free')&&['prompt','completion'].every(k=>m.pricing?.[k]!==undefined&&Number(m.pricing[k])===0)).map(m=>({id:m.id,pricing:m.pricing,supported_parameters:m.supported_parameters,architecture:m.architecture}));}
 else item.endpoints=(body.data?.endpoints??[]).map(e=>({name:e.name,model_id:e.model_id,tag:e.tag,provider_name:e.provider_name,status:e.status,pricing:e.pricing,supported_parameters:e.supported_parameters}));
 }else await r.body?.cancel();report.official[name]=item;
 }catch(e){report.official[name]={url,error:e.cause?.code??e.name};}
}
const groups={};for(const m of report.models){const key=m.id.split('/')[0];groups[key]=(groups[key]??0)+1;}
report.summary={total_models:report.models.length,by_route_prefix:groups,openrouter_models:report.models.filter(m=>m.id.startsWith('openrouter/')),antigravity_models:report.models.filter(m=>m.id.startsWith('ag/')),free_text_candidates:report.official.catalog?.free_text_candidates?.map(m=>m.id)??[],inference_authorised:false,account_entitlement_verified:false,paid_substitution_rules_verified:false};
fs.writeFileSync(path.join(dir,'metadata.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({evidence:dir,local:report.local,summary:report.summary,exact_endpoint:report.official.exact_endpoint}));
