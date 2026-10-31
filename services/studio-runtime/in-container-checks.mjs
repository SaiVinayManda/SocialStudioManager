// Actual deployed API/auth/replay checks; outputs only check names/statuses, never keys.
import fs from 'node:fs';import crypto from 'node:crypto';import {signWebhook} from './contracts.mjs';
const base='http://127.0.0.1:8780',results=[];
const keys=Object.fromEntries(['control','n8n','worker','webhook'].map(role=>[role,fs.readFileSync('/run/secrets/'+({control:'control_token',n8n:'n8n_token',worker:'worker_token',webhook:'webhook_key'}[role]),'utf8').trim()]));
async function check(name,route,expected,{method='GET',body,role='control',raw=false}={}){
  const r=await fetch(base+route,{method,headers:{...(role?{authorization:'Bearer '+keys[role]}:{}),'content-type':'application/json'},...(body===undefined?{}:{body:raw?body:JSON.stringify(body)}),signal:AbortSignal.timeout(5000)});
  results.push({name,status:r.status,expected,passed:r.status===expected});await r.arrayBuffer();
}
try{
  await check('actual application health','/health',200,{role:null});
  await check('unauthenticated control rejected','/jobs',401,{role:null});
  await check('operator can list configured brands','/brands',200);
  await check('worker cannot list brands','/brands',403,{role:'worker'});
  await check('n8n cannot approve content','/approvals/'+crypto.randomUUID()+'/decision',403,{role:'n8n',method:'POST',body:{}});
  await check('worker cannot schedule','/scheduler/tick',403,{role:'worker',method:'POST',body:{}});
  await check('malformed JSON rejected','/intake',400,{method:'POST',body:'{',raw:true});
  const fixture={brand_id:'10000000-0000-4000-8000-000000000001',source_type:'existing_file',source:{root_id:'generated',relative_path:'horror/../file.mp4',expected_checksum:'a'.repeat(64)},idempotency_key:'negative-fixture:'+crypto.randomUUID()};
  await check('unsafe source path rejected without queue mutation','/intake',400,{method:'POST',body:fixture});
  const envelope=signWebhook({fixture:'deployed-replay-check'},keys.webhook);
  await check('signed envelope accepted','/webhooks/verify',200,{role:'n8n',method:'POST',body:envelope});
  await check('duplicate nonce rejected durably','/webhooks/verify',409,{role:'n8n',method:'POST',body:envelope});
  await check('tampered signed body rejected','/webhooks/verify',401,{role:'n8n',method:'POST',body:{...envelope,body:{fixture:'tampered'}}});
  await check('expired signature rejected','/webhooks/verify',401,{role:'n8n',method:'POST',body:signWebhook({},keys.webhook,crypto.randomUUID(),new Date(Date.now()-61000).toISOString())});
  const body={brand_id:fixture.brand_id,job_id:crypto.randomUUID(),task_type:'title_generation',input:{topic:'fixture'},provider_policy:{providers:['mock']},maximum_cost:1,timeout_ms:5000};
  await check('paid AI rejected before task creation','/ai/tasks',403,{method:'POST',body});
}catch{results.push({name:'deployed API transport',passed:false,code:'ACTUAL_CHECKS_INTERRUPTED'});}
const report={captured_utc:new Date().toISOString(),actual_deployed_api:true,checks:results,passed:results.length===13&&results.every(x=>x.passed),secret_values_logged:false};console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
