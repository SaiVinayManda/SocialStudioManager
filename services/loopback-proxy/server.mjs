// Proposed E-LOCAL-ACCESS-01 only; not deployed by the original three-service grant.
// Fixed destinations, no credential mounts, arbitrary forwarding, or request logging.
import http from 'node:http';import {fileURLToPath} from 'node:url';import path from 'node:path';
const hop=new Set(['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade']);
export function createProxy(target,port){
  const server=http.createServer({maxHeaderSize:8192},(req,res)=>{
    if(!req.url?.startsWith('/')||req.url.startsWith('//')||!['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].includes(req.method)){res.writeHead(400);res.end();return;}
    if(req.url==='/_proxy_health'){res.writeHead(200,{'content-type':'application/json'});res.end('{"status":"ok"}');return;}
    const suppliedConnection=String(req.headers.connection??'').toLowerCase().split(',').map(x=>x.trim());
    const headers=Object.fromEntries(Object.entries(req.headers).filter(([k])=>!hop.has(k)&&!suppliedConnection.includes(k)&&!k.startsWith('x-forwarded-')));
    headers.host='127.0.0.1:'+port;headers['x-forwarded-host']=headers.host;headers['x-forwarded-proto']='http';headers['x-forwarded-for']=req.socket.remoteAddress??'unknown';
    const upstream=http.request({hostname:target.hostname,port:target.port,path:req.url,method:req.method,headers,timeout:60000},response=>{
      const resultHeaders=Object.fromEntries(Object.entries(response.headers).filter(([k])=>!hop.has(k)));
      res.writeHead(response.statusCode??502,resultHeaders);response.pipe(res);response.on('error',()=>res.destroy());
    });
    let bytes=0;req.on('data',chunk=>{bytes+=chunk.length;if(bytes>262144){upstream.destroy();if(!res.headersSent)res.writeHead(413);res.end();req.resume();}});
    upstream.on('timeout',()=>upstream.destroy());upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end();});req.on('aborted',()=>upstream.destroy());res.on('close',()=>{if(!res.writableFinished)upstream.destroy();});req.pipe(upstream);
  });
  server.requestTimeout=60000;server.headersTimeout=10000;server.on('connect',(_req,socket)=>socket.destroy());server.on('upgrade',(_req,socket)=>socket.destroy());return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const servers=[[5678,{hostname:'n8n',port:5678}],[8780,{hostname:'studio-api',port:8780}]].map(([port,target])=>createProxy(target,port).listen(port,'0.0.0.0'));
  console.log(JSON.stringify({service:'loopback-proxy',ports:[5678,8780],fixed_targets:true,credentials_mounted:false}));
  const stop=()=>servers.forEach(s=>s.close());process.on('SIGTERM',stop);process.on('SIGINT',stop);
}
