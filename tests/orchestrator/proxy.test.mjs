import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';
import {createProxy} from '../../services/loopback-proxy/server.mjs';
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',r));const close=s=>new Promise(r=>s.close(r));
test('proposed proxy forwards only to its fixed target and strips spoofed forwarding headers',async()=>{
  let captured;const backend=http.createServer((req,res)=>{captured={url:req.url,headers:req.headers};res.writeHead(200,{'content-type':'application/json'});res.end('{"fixture":true}');});await listen(backend);
  const proxy=createProxy({hostname:'127.0.0.1',port:backend.address().port},8780);await listen(proxy);
  try{const r=await fetch('http://127.0.0.1:'+proxy.address().port+'/jobs?fixture=1',{headers:{authorization:'Bearer public-fixture-not-a-credential','x-forwarded-host':'attacker.invalid'}});assert.equal(r.status,200);assert.deepEqual(await r.json(),{fixture:true});assert.equal(captured.url,'/jobs?fixture=1');assert.equal(captured.headers.host,'127.0.0.1:8780');assert.equal(captured.headers['x-forwarded-host'],'127.0.0.1:8780');assert.equal(captured.headers.authorization,'Bearer public-fixture-not-a-credential');}
  finally{await close(proxy);await close(backend);}
});
test('proposed proxy rejects absolute-URL forwarding and returns a bounded unavailable response',async()=>{
  const proxy=createProxy({hostname:'127.0.0.1',port:1},5678);await listen(proxy);
  try{const status=await new Promise((resolve,reject)=>{const r=http.request({hostname:'127.0.0.1',port:proxy.address().port,path:'http://example.invalid/',method:'GET'},res=>{res.resume();resolve(res.statusCode);});r.on('error',reject);r.end();});assert.equal(status,400);
    const r=await fetch('http://127.0.0.1:'+proxy.address().port+'/upstream-unavailable');assert.equal(r.status,502);
    const health=await fetch('http://127.0.0.1:'+proxy.address().port+'/_proxy_health');assert.equal(health.status,200);
  }finally{await close(proxy);}
});
