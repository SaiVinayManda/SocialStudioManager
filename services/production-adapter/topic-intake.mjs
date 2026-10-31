import {demand,uuid} from '../studio-runtime/contracts.mjs';import {topicRequest} from './dynamic-contract.mjs';import {intake} from './store.mjs';
import fs from 'node:fs';import path from 'node:path';
import {e4ReadinessMatches,E4_INSTRUCTIONS} from '../ai-agent-manager/e4-route.mjs';
export async function intakeTopic(db,body,mediaRoot){
 demand(uuid(body?.brand_id),'INVALID_BRAND');const brand=(await db.query('SELECT id,slug FROM studio.brands WHERE id=$1',[body.brand_id])).rows[0];demand(brand,'UNKNOWN_BRAND',404);let clearance;
 if(body.provider_mode==='live'){const ready=await db.query("SELECT provider,status,capability_metadata FROM studio.ai_provider_health WHERE provider IN ('codex','agy','9router')");clearance=ready.rows.find(r=>r.provider==='9router'&&e4ReadinessMatches(r.capability_metadata?.e4_readiness,body));demand(clearance||ready.rows.some(r=>r.status==='available'),'REAL_AI_PROVIDER_NOT_CLEARED',409);}
 let profile={};if(mediaRoot){const file=path.join(mediaRoot,'brands',brand.slug,'config/production.json');if(fs.existsSync(file)){demand(!fs.lstatSync(file).isSymbolicLink()&&fs.statSync(file).size<16384,'INVALID_BRAND_PRODUCTION_PROFILE');profile=JSON.parse(fs.readFileSync(file,'utf8'));}}
 const input=topicRequest({...body,production:{...profile,...body.production}},brand);if(clearance)Object.assign(input.production_settings.ai_request.input,{scene_count:1,instructions:E4_INSTRUCTIONS});return intake(db,input);
}
