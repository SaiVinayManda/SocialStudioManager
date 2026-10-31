import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {authenticate,signWebhook,verifyWebhook,reference,jobInput,retryDelay,canonical} from '../../services/studio-runtime/contracts.mjs';
import {performMockTask,NineRouterBoundary} from '../../services/ai-agent-manager/providers.mjs';
import {adapters,liveAdapter} from '../../services/publishing-adapter/providers.mjs';
import {youtubePlan,instagramPlan,facebookPlan,executeOfficialPlan} from '../../services/publishing-adapter/official-plans.mjs';
import {createServer} from '../../services/studio-runtime/server.mjs';
import {transaction} from '../../services/studio-runtime/db.mjs';
import {mediaPath,subtitleCheck,runProcess} from '../../services/production-adapter/media.mjs';
import {StableScanner,runIntake} from '../../services/production-adapter/folder-intake.mjs';
const brand={id:'10000000-0000-4000-8000-000000000001',slug:'horror'},id='a0000000-0000-4000-8000-000000000001';
const source={root_id:'generated',relative_path:'horror/pilot-001/final/horror_pilot_001.mp4',expected_checksum:'a'.repeat(64)};
const input=()=>({brand_id:brand.id,source_type:'existing_file',source:{...source},idempotency_key:'fixture:001',production_settings:{}});
const fixtureKeys={control:'public-fixture-control-not-a-service-secret',n8n:'public-fixture-n8n-not-a-service-secret',worker:'public-fixture-worker-not-a-service-secret'};
const ai=()=>({brand_id:brand.id,job_id:id,task_type:'title_generation',input:{topic:'The Second Caller'},provider_policy:{providers:['mock-unavailable','mock']},maximum_cost:0,timeout_ms:5000});
test('structured existing-file contract accepts the registered brand',()=>assert.equal(jobInput(input(),brand).source.relative_path,source.relative_path));
test('existing-file intake requires SHA256 for durable renamed-file deduplication',()=>{const body=input();delete body.source.expected_checksum;assert.throws(()=>jobInput(body,brand),/CHECKSUM_REQUIRED/);});
test('unknown request fields cannot supply a command or executable',()=>assert.throws(()=>jobInput({...input(),command:'powershell.exe'},brand),/UNKNOWN_FIELD/));
test('absolute, traversal, alternate stream, URL, reserved device and wrong-brand paths rejected',()=>{
  for(const value of ['C:/Windows/file.mp4','horror/../file.mp4','horror/x.mp4:stream','https://example.org/file.mp4','horror/CON.mp4','travel/file.mp4','horror/x%2f..mp4','horror/x\\file.mp4'])assert.throws(()=>reference({root_id:'generated',relative_path:value},brand.slug));
});
test('resolution, duration range, platform duplicates and unknown settings rejected',()=>{
  for(const settings of [{expected_width:999999},{min_duration:62,max_duration:58},{platforms:['youtube','youtube']},{requires_ai:'yes'},{shell:'cmd'}])assert.throws(()=>jobInput({...input(),production_settings:settings},brand));
});
test('render requests require a preapproved project, not an arbitrary topic command',()=>assert.throws(()=>jobInput({...input(),source_type:'approved_openmontage'},brand),/PREAPPROVED_PROJECT_REQUIRED/));
test('script references are constrained to local text within the brand',()=>{
  assert.throws(()=>jobInput({...input(),script_reference:{root_id:'generated',relative_path:'travel/script.txt'}},brand));
  assert.doesNotThrow(()=>jobInput({...input(),script_reference:{root_id:'generated',relative_path:'horror/pilot-001/scripts/story.txt'}},brand));
});
test('canonical request hashes do not depend on object key insertion order',()=>assert.deepEqual(canonical({b:2,a:{z:1,b:2}}),canonical({a:{b:2,z:1},b:2})));
test('fixture authentication separates control, n8n and worker roles',()=>{for(const [role,key]of Object.entries(fixtureKeys))assert.equal(authenticate('Bearer '+key,fixtureKeys),role);assert.throws(()=>authenticate('Bearer unknown',fixtureKeys),/UNAUTHORIZED/);});
test('signed webhook content modification is rejected',()=>{const e=signWebhook({job:'fixture'},'public-fixture-signing-key');assert.deepEqual(verifyWebhook(e,'public-fixture-signing-key'),e.body);e.body.job='modified';assert.throws(()=>verifyWebhook(e,'public-fixture-signing-key'),/INVALID_SIGNATURE/);});
test('expired and future webhook envelopes are rejected',()=>{for(const delta of [-61000,6000]){const e=signWebhook({},'fixture',crypto.randomUUID(),new Date(Date.now()+delta).toISOString());assert.throws(()=>verifyWebhook(e,'fixture'),/STALE_WEBHOOK/);}});
test('retry delays use bounded backoff and honor a bounded retry-after',()=>{assert.equal(retryDelay(1),2);assert.equal(retryDelay(3,60),60);assert.equal(retryDelay(100,999),300);});
test('database transient retry helper releases and rolls back each fixture connection',async()=>{
  let connections=0,releases=0,rollbacks=0,attempts=0;const db={connect:async()=>{connections++;return {query:async sql=>{if(sql==='ROLLBACK')rollbacks++;},release:()=>releases++};}};
  const result=await transaction(db,async()=>{if(++attempts<3)throw Object.assign(Error('fixture deadlock'),{code:'40P01'});return 'fixture result';});assert.equal(result,'fixture result');assert.equal(connections,3);assert.equal(releases,3);assert.equal(rollbacks,2);
});
test('database retry helper never retries a permanent error or exceeds three attempts',async()=>{let attempts=0;const db={connect:async()=>({query:async()=>{},release:()=>{}})};
  await assert.rejects(transaction(db,async()=>{attempts++;throw Object.assign(Error('fixture'),{code:'23514'});}));assert.equal(attempts,1);attempts=0;await assert.rejects(transaction(db,async()=>{attempts++;throw Object.assign(Error('fixture'),{code:'40001'});}));assert.equal(attempts,3);
});
test('AI mock failure falls back deterministically and costs zero',async()=>{const r=await performMockTask(ai());assert.equal(r.output.title,'The Second Caller');assert.equal(r.attempts[0].status,'temporary_failure');assert.equal(r.cost,0);});
test('AI exhausted providers returns a real failure',async()=>{const t=ai();t.provider_policy.providers=['mock-unavailable'];await assert.rejects(performMockTask(t),/MOCK_PROVIDERS_UNAVAILABLE/);});
test('AI paid providers, nonzero budgets and malformed input rejected',async()=>{
  for(const t of [{...ai(),maximum_cost:1},{...ai(),provider_policy:{providers:['paid-api']}},{...ai(),input:{topic:{shell:'bad'}}}])await assert.rejects(performMockTask(t));
});
test('all six AI task types produce structured local responses',async()=>{for(const task_type of ['script_generation','title_generation','caption_generation','hashtag_generation','storyboard_generation','content_review']){const r=await performMockTask({...ai(),task_type});assert.equal(typeof r.output,'object');assert.equal(r.mock,true);}});
test('9Router boundary cannot execute before separate installation/auth approval',async()=>await assert.rejects(new NineRouterBoundary().execute(),/NOT_APPROVED/));
for(const platform of ['youtube','instagram','facebook'])test(`${platform} mock receipts are deterministic and platform-specific`,async()=>{
  const destination={brand_id:brand.id,platform,connection_status:'mock',external_account_id:'mock:horror:'+platform},job={brand_id:brand.id,idempotency_key:'fixture-one',mode:'mock'};
  const one=await adapters[platform].publish(job,destination),two=await adapters[platform].publish(job,destination);assert.equal(one.post_id,two.post_id);assert.equal(one.stages.length,3);assert.equal(one.publicly_published,false);assert.equal(one.charges_usd,0);
});
test('cross-brand destinations and real connections fail closed',async()=>{
  const job={brand_id:brand.id,idempotency_key:'fixture-one',mode:'mock'};
  await assert.rejects(adapters.youtube.publish(job,{brand_id:id,platform:'youtube',connection_status:'mock',external_account_id:'mock:wrong'}),/BRAND_MISMATCH/);
  await assert.rejects(adapters.youtube.publish(job,{brand_id:brand.id,platform:'youtube',connection_status:'connected',external_account_id:'live'}),/NOT_APPROVED/);assert.throws(liveAdapter,/NOT_APPROVED/);
});
test('unknown publishing outcome requests manual review and never reuploads',async()=>assert.equal((await adapters.youtube.reconcile(null)).status,'manual_review'));
test('official plans preserve distinct platform steps and remain disabled',async()=>{
  const yt=youtubePlan({title:'Fixture',bytes:100});assert.equal(yt.steps[0].body.status.privacyStatus,'private');assert.equal(yt.steps[2].content_range,'bytes */100');
  const ig=instagramPlan({account_id:'123',api_version:'v00.0',media_url:'https://example.invalid/fixture.mp4'});assert.equal(ig.steps[1].required_state,'FINISHED');
  const fb=facebookPlan({page_id:'123',api_version:'v00.0'});assert.equal(fb.transport_verified,false);for(const p of [yt,ig,fb])assert.equal(p.enabled,false);
  await assert.rejects(executeOfficialPlan(),/NOT_ENABLED/);
});
test('official request plans reject malformed IDs and media URL credentials',()=>{assert.throws(()=>instagramPlan({account_id:'../../other',api_version:'v00.0',media_url:'https://example.invalid/file.mp4'}));assert.throws(()=>instagramPlan({account_id:'123',api_version:'v00.0',media_url:'https://user:password@example.invalid/file.mp4'}));});
test('HTTP authentication and role boundaries reject unauthenticated or worker approval calls',async()=>{
  let queries=0;const db={query:async()=>{queries++;return {rows:[{version:1}],rowCount:1};}};
  const server=createServer({db,secrets:fixtureKeys,webhookKey:'public-fixture'});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  try{let r=await fetch(base+'/jobs');assert.equal(r.status,401);
    r=await fetch(base+`/approvals/${id}/decision`,{method:'POST',headers:{authorization:'Bearer '+fixtureKeys.worker,'content-type':'application/json'},body:'{}'});assert.equal(r.status,403);
    r=await fetch(base+'/intake',{method:'POST',headers:{authorization:'Bearer '+fixtureKeys.control,'content-type':'application/json'},body:'{'});assert.equal(r.status,400);assert.equal((await r.json()).error.code,'INVALID_JSON');assert.equal(queries,0);
    r=await fetch(base+'/health');assert.equal(r.status,200);
  }finally{await new Promise(r=>server.close(r));}
});
test('empty migration history does not report healthy',async()=>{const server=createServer({db:{query:async()=>({rows:[],rowCount:0})},secrets:fixtureKeys,webhookKey:'fixture'});await new Promise(r=>server.listen(0,'127.0.0.1',r));try{const r=await fetch('http://127.0.0.1:'+server.address().port+'/health');assert.equal(r.status,503);}finally{await new Promise(r=>server.close(r));}});
test('native file boundary rejects cross-brand and unsafe paths before invoking any tool',()=>{for(const relative_path of ['horror/../x.mp4','travel/x.mp4','horror/NUL.mp4'])assert.throws(()=>mediaPath(process.cwd(),{root_id:'generated',relative_path},'horror'));});
test('stable-file scanner waits for stability and suppresses acknowledged duplicates',async()=>{
  const root=path.join(process.cwd(),'.runtime/orchestrator/tests',crypto.randomUUID()),dir=path.join(root,'brands/horror/inputs');fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(path.join(root,'generated-videos'));
  fs.writeFileSync(path.join(dir,'fixture.mp4'),'unit fixture, not a decodable video');const scanner=new StableScanner({workspace:root,brands:[brand],stableMs:5000});
  assert.equal((await scanner.scan(0)).length,0);assert.equal((await scanner.scan(4000)).length,0);const items=await scanner.scan(5000);assert.equal(items.length,1);scanner.acknowledge(items[0].key);assert.equal((await scanner.scan(6000)).length,0);
  const restarted=new StableScanner({workspace:root,brands:[brand],stableMs:5000});await restarted.scan(7000);const again=await restarted.scan(12000);assert.equal(again[0].job.idempotency_key,items[0].job.idempotency_key); // Durable suppression is the database's responsibility.
});
test('subtitle validator catches reversed timing in an isolated fixture',()=>{
  const file=path.join(process.cwd(),'.runtime/orchestrator/tests',crypto.randomUUID()+'.srt');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'1\n00:00:02,000 --> 00:00:01,000\nBad time\n');assert.throws(()=>subtitleCheck(file,60),/TIMING_INVALID/);
});
test('one-shot intake waits for two actual stable observations before submitting',async()=>{
  const root=path.join(process.cwd(),'.runtime/orchestrator/tests',crypto.randomUUID()),dir=path.join(root,'brands/horror/inputs');fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(path.join(root,'generated-videos'));fs.writeFileSync(path.join(dir,'fixture.mp4'),'public intake transport fixture; not media validation');const key=path.join(root,'public-fixture-key.txt');fs.writeFileSync(key,'public-fixture-signing-key-not-a-service-credential');
  const originalFetch=globalThis.fetch;let calls=0;const begin=performance.now();globalThis.fetch=async()=>{calls++;assert(performance.now()-begin>=5000);return new Response(JSON.stringify({job_id:id}),{status:202,headers:{'content-type':'application/json'}});};
  try{await runIntake({workspace:root,brands:[brand],stableMs:5000,webhook_url:'http://127.0.0.1:5678/webhook/social-studio/intake',webhook_key_file:key},{once:true});assert.equal(calls,1);}finally{globalThis.fetch=originalFetch;}
});
test('real child process exits are captured and timeout kills its process tree',async()=>{
  const one=await runProcess(process.execPath,['-e','process.exit(7)'],{workspace:process.cwd()});assert.equal(one.exit_code,7);
  const two=await runProcess(process.execPath,['-e','setInterval(()=>{},1000)'],{workspace:process.cwd(),timeoutMs:200});assert.equal(two.timed_out,true);assert.notEqual(two.exit_code,0);assert.equal(two.cleanup_failed,false);
});
test('real child process cancellation is distinct from a timeout',async()=>{
  const stop=new AbortController();setTimeout(()=>stop.abort(),150);const r=await runProcess(process.execPath,['-e','setInterval(()=>{},1000)'],{workspace:process.cwd(),timeoutMs:5000,signal:stop.signal});assert.equal(r.cancelled,true);assert.equal(r.timed_out,false);assert.equal(r.cleanup_failed,false);
});
test('workflow exports contain 12 connected graphs, fixed internal URLs and no shell/credential values',()=>{
  const dir=path.join(process.cwd(),'infrastructure/n8n/workflows'),files=fs.readdirSync(dir).filter(x=>x.endsWith('.json'));assert.equal(files.length,12);const ids=new Set();
  for(const file of files){const w=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));ids.add(w.id);assert.equal(w.active,false);assert(w.nodes.length>=2);const names=new Set(w.nodes.map(n=>n.name));for(const outputs of Object.values(w.connections))for(const branch of outputs.main)for(const edge of branch??[])assert(names.has(edge.node));for(const n of w.nodes){assert(!['executeCommand','ssh','code','readWriteFile'].some(t=>n.type.endsWith('.'+t)));if(n.type.endsWith('.httpRequest')){assert(n.parameters.url.includes('http://studio-api:8780/'));assert.equal(n.credentials.httpHeaderAuth.id,'socialstudioauth');}}assert(!JSON.stringify(w).includes('Bearer '));}
  assert.equal(ids.size,12);
});
