// One explicit reviewed candidate. A name containing "free" is not authority.
export const E4_MODEL='openrouter/nvidia/nemotron-3.5-super-vl:free';
export const E4_UPSTREAM_MODEL='nvidia/nemotron-3.5-super-vl:free';
export const E4_TOPIC='A shadow appears behind a woman every time she closes her eyes.';
export const E4_PROVIDER_PREFERENCES=Object.freeze({only:['nvidia'],order:['nvidia'],allow_fallbacks:false,require_parameters:true,max_price:{prompt:0,completion:0,request:0}});
export const E4_ID='E4-FREE-CANARY-02';
export const E4_BRAND='10000000-0000-4000-8000-000000000001';
export const E4_INSTRUCTIONS='Generate original English content, not a fixture: 8 to 12 spoken words, one scene starting at 0 and lasting exactly 5 seconds. Topic: a shadow appears behind a woman every time she closes her eyes. Use an available procedural environment or original image-motion component; asset_id must be empty. Include concept, timed storyboard, script and platform metadata matching the schema. No URLs, tools, external media acquisition or extra scenes.';
export function e4ReadinessMatches(scope,body,now=Date.now()){
 return scope?.approval_id===E4_ID&&now<Date.parse(scope.expires_at)&&scope.brand_id===E4_BRAND&&body.brand_id===E4_BRAND&&scope.topic===E4_TOPIC&&body.topic===E4_TOPIC&&scope.idempotency_key==='e4-real:'+scope.acceptance_run_id&&scope.idempotency_key===body.idempotency_key&&scope.acceptance_run_id===body.acceptance_run_id&&body.duration_seconds===5&&body.provider_mode==='live'&&body.script===undefined&&body.production===undefined&&scope.maximum_cost===0;
}
