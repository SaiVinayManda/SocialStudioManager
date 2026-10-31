// Operator-only in-container receiver for a VERIFIED non-secret readiness record.
// Does not claim the provider has executed successfully. No model credentials.
import {database} from '../studio-runtime/db.mjs';import {demand,uuid} from '../studio-runtime/contracts.mjs';import {E4_ID,E4_TOPIC,E4_MODEL,E4_BRAND} from './e4-route.mjs';
let text='';for await(const bytes of process.stdin){text+=bytes;demand(text.length<=16384,'READINESS_TOO_LARGE');}const r=JSON.parse(text);
demand(r.approval_id===E4_ID&&uuid(r.acceptance_run_id)&&r.brand_id===E4_BRAND&&r.idempotency_key==='e4-real:'+r.acceptance_run_id&&r.topic===E4_TOPIC&&r.model===E4_MODEL&&r.maximum_cost===0&&Date.now()<Date.parse(r.expires_at)&&/^[a-f0-9]{64}$/.test(r.scope_sha256)&&/^[a-f0-9]{64}$/.test(r.route_evidence_sha256),'E4_VERIFIED_READINESS_REQUIRED');
const withdraw=process.argv.includes('--withdraw');const db=await database();try{
 if(withdraw)await db.query("UPDATE studio.ai_provider_health SET status='approval_required',capability_metadata=capability_metadata-'e4_readiness',last_checked=now() WHERE provider='9router' AND capability_metadata->'e4_readiness'->>'acceptance_run_id'=$1",[r.acceptance_run_id]);
 else await db.query("UPDATE studio.ai_provider_health SET capability_metadata=capability_metadata||jsonb_build_object('e4_readiness',$1::jsonb),last_checked=now() WHERE provider='9router'",[JSON.stringify(r)]);
 console.log(JSON.stringify({approval_id:E4_ID,scoped_intake_readiness:!withdraw,live_inference_verified:false}));
}finally{await db.end();}
