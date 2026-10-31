import fs from 'node:fs';import crypto from 'node:crypto';
const key=role=>fs.readFileSync('/run/secrets/'+role+'_token','utf8').trim();
const keys={control:key('control'),n8n:key('n8n'),worker:key('worker')},results=[];
async function check(name,route,expected,{role='control',method='GET',body}={}){
  const r=await fetch('http://127.0.0.1:8780'+route,{method,headers:{...(role?{authorization:'Bearer '+keys[role]}:{}),'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(5000)});await r.arrayBuffer();results.push({name,status:r.status,expected,passed:r.status===expected});
}
const id=crypto.randomUUID();
await check('AI provider status requires authentication','/ai/providers/status',401,{role:null});
await check('operator can inspect provider capabilities','/ai/providers/status',200);
await check('n8n can inspect provider health','/ai/providers/health',200,{role:'n8n'});
await check('worker cannot browse AI task history','/ai/tasks/'+id+'/history',403,{role:'worker'});
await check('unknown task history returns 404','/ai/tasks/'+id+'/history',404);
await check('n8n cannot claim native AI work','/ai/worker/claim',403,{role:'n8n',method:'POST',body:{}});
await check('operator API cannot impersonate native AI worker','/ai/worker/claim',403,{method:'POST',body:{}});
await check('worker claim rejects caller-supplied execution flags','/ai/worker/claim',400,{role:'worker',method:'POST',body:{command:'invalid'}});
await check('unknown cancellation returns 404','/ai/tasks/'+id+'/cancel',404,{method:'POST',body:{}});
await check('worker cannot cancel operator tasks','/ai/tasks/'+id+'/cancel',403,{role:'worker',method:'POST',body:{}});
await check('stale worker heartbeat cannot modify a task','/ai/worker/tasks/'+id+'/heartbeat',409,{role:'worker',method:'POST',body:{lease_token:crypto.randomUUID()}});
console.log(JSON.stringify({passed:results.every(c=>c.passed),checks:results.length,results,actual_deployed_api:true,model_requests:0}));if(results.some(c=>!c.passed))process.exitCode=1;
