// Unauthenticated official pricing metadata only; never inference or account API.
import {demand} from '../studio-runtime/contracts.mjs';import {boundedJsonResponse} from './adapters.mjs';import {E4_UPSTREAM_MODEL} from './e4-route.mjs';
export const E4_PUBLIC_ENDPOINT='https://openrouter.ai/api/v1/models/nvidia/nemotron-3.5-super-vl:free/endpoints';
export function checkE4PublicPricing(data){
 const entries=data?.data?.endpoints;demand(Array.isArray(entries)&&entries.length>0,'E4_PUBLIC_PRICE_UNAVAILABLE');
 const selected=entries.filter(e=>e.tag==='nvidia'&&e.model_id===E4_UPSTREAM_MODEL);
 demand(selected.length>0&&selected.every(e=>String(e.pricing?.prompt)==='0'&&String(e.pricing?.completion)==='0'&&e.status===0&&['response_format','structured_outputs','max_tokens'].every(p=>e.supported_parameters?.includes(p))),'E4_PUBLIC_PRICE_OR_CAPABILITY_CHANGED',403);
 return {model:E4_UPSTREAM_MODEL,provider:'nvidia',prompt_price:0,completion_price:0,public_endpoint:E4_PUBLIC_ENDPOINT,checked_at:new Date().toISOString(),account_entitlement_verified:false};
}
export async function e4PublicPreflight(fetchImpl=fetch){
 const r=await fetchImpl(E4_PUBLIC_ENDPOINT,{redirect:'error',signal:AbortSignal.timeout(10000)});demand(r.ok,'E4_PUBLIC_PRICE_UNAVAILABLE');return checkE4PublicPricing(await boundedJsonResponse(r));
}
