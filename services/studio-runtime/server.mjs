import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {database,event} from './db.mjs';
import {demand,exact,uuid,authenticate,StudioError} from './contracts.mjs';
import * as production from '../production-adapter/store.mjs';
import * as publishing from '../publishing-adapter/store.mjs';
import * as operations from './operations.mjs';
import {providerHealth} from '../ai-agent-manager/providers.mjs';
const send=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));};
async function body(req){let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;demand(bytes<=262144,'REQUEST_TOO_LARGE',413);chunks.push(chunk);}if(!bytes)return {};try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new StudioError('INVALID_JSON');}}
function restrictedPath(root,reference,slug){
  demand(reference.root_id==='generated'||reference.root_id==='brands','UNREGISTERED_ROOT');const parts=reference.relative_path?.split('/');
  demand(parts?.[0]===slug&&parts.every(s=>s&&s!=='.'&&s!=='..'&&!/[\\:%\0]/.test(s)),'UNSAFE_OUTPUT_PATH',403);
  const base=path.resolve(root,reference.root_id),target=path.resolve(base,...parts);demand(target.startsWith(base+path.sep),'UNSAFE_OUTPUT_PATH',403);
  let current=base;demand(!fs.lstatSync(current).isSymbolicLink(),'LINK_FORBIDDEN',403);for(const part of parts){current=path.join(current,part);demand(!fs.lstatSync(current).isSymbolicLink(),'LINK_FORBIDDEN',403);}
  const stat=fs.statSync(target);demand(stat.isFile()&&stat.nlink===1&&stat.size<=1073741824,'UNSAFE_OUTPUT_FILE',403);return target;
}
export function createServer({db,secrets,webhookKey,mediaRoot='/studio/media'}){
  const server=http.createServer({maxHeaderSize:8192},async(req,res)=>{
    try{
      const url=new URL(req.url,'http://localhost');const route=url.pathname;
      if(req.method==='GET'&&route==='/health'){const r=await db.query('SELECT version FROM studio.schema_migrations WHERE version=1');demand(r.rowCount===1,'SCHEMA_NOT_READY',503);return send(res,200,{status:'ok',database:'ready',mode:'mock'});}
      const role=authenticate(req.headers.authorization,secrets),allow=(...roles)=>demand(roles.includes(role),'FORBIDDEN',403);
      let m;const data=['POST','PUT','PATCH'].includes(req.method)?await body(req):null;
      if(req.method==='GET'&&route==='/brands'){allow('control','n8n');return send(res,200,{brands:(await db.query('SELECT id,name,slug,default_language FROM studio.brands ORDER BY slug')).rows});}
      if(req.method==='POST'&&route==='/webhooks/verify'){allow('n8n');return send(res,200,await operations.webhook(db,data,webhookKey));}
      if(req.method==='POST'&&route==='/intake'){allow('control','n8n');return send(res,201,await production.intake(db,data));}
      if(req.method==='POST'&&route==='/jobs'){
        allow('control','n8n');demand(data&&typeof data==='object'&&!Array.isArray(data),'OBJECT_REQUIRED');let id;
        if(Object.hasOwn(data,'job_id')){exact(data,['job_id'],['job_id']);id=data.job_id;}
        else id=(await production.intake(db,data)).job_id;
        return send(res,202,await production.start(db,id));
      }
      if(req.method==='GET'&&route==='/jobs'){allow('control','n8n');const brand=url.searchParams.get('brand_id');if(brand)demand(uuid(brand),'INVALID_BRAND');return send(res,200,{jobs:(await db.query('SELECT id,brand_id,status,created_at,updated_at FROM studio.content_jobs'+(brand?' WHERE brand_id=$1':'')+' ORDER BY created_at DESC LIMIT 100',brand?[brand]:[])).rows});}
      if((m=route.match(/^\/jobs\/([a-f0-9-]+)$/))&&req.method==='GET'){allow('control','n8n');const j=await production.job(db,m[1]);return send(res,200,{...j,job_id:j.id});}
      if((m=route.match(/^\/jobs\/([a-f0-9-]+)\/cancel$/))&&req.method==='POST'){allow('control','n8n');return send(res,200,await production.cancel(db,m[1]));}
      if((m=route.match(/^\/jobs\/([a-f0-9-]+)\/logs$/))&&req.method==='GET'){allow('control','n8n');await production.job(db,m[1]);return send(res,200,{events:(await db.query('SELECT id,event_type,event_payload,created_at FROM studio.job_events WHERE job_id=$1 ORDER BY id DESC LIMIT 100',[m[1]])).rows,worker_logs:(await db.query('SELECT id,status,bounded_logs FROM studio.production_tasks WHERE job_id=$1 ORDER BY created_at DESC LIMIT 10',[m[1]])).rows});}
      if((m=route.match(/^\/jobs\/([a-f0-9-]+)\/output$/))&&req.method==='GET'){
        allow('control','n8n');const j=await production.job(db,m[1]),asset=(await db.query("SELECT * FROM studio.media_assets WHERE job_id=$1 AND media_type='video' AND validation_status='passed'",[j.id])).rows[0];demand(asset,'OUTPUT_NOT_READY',409);
        if(url.searchParams.get('download')!=='1')return send(res,200,{job_id:j.id,asset,preview_reference:asset.file_reference});
        const file=restrictedPath(mediaRoot,asset.file_reference,j.brand_slug),fd=fs.openSync(file,'r');let digest=crypto.createHash('sha256');const buffer=Buffer.alloc(65536);let count;while((count=fs.readSync(fd,buffer,0,buffer.length,null))>0)digest.update(buffer.subarray(0,count));if(digest.digest('hex')!==asset.checksum){fs.closeSync(fd);throw new StudioError('OUTPUT_CHANGED',409);}
        res.writeHead(200,{'content-type':'video/mp4','content-length':fs.fstatSync(fd).size,'content-disposition':'attachment; filename="social-studio-video.mp4"','cache-control':'private, no-store','x-content-type-options':'nosniff'});fs.createReadStream(file,{fd,start:0,autoClose:true}).pipe(res);return;
      }
      if((m=route.match(/^\/jobs\/([a-f0-9-]+)\/quality$/))&&req.method==='POST'){allow('n8n');return send(res,200,await production.quality(db,m[1]));}
      if((m=route.match(/^\/jobs\/([a-f0-9-]+)\/approvals$/))&&req.method==='POST'){allow('n8n','control');return send(res,201,await production.requestApproval(db,m[1]));}
      if((m=route.match(/^\/approvals\/([a-f0-9-]+)$/))&&req.method==='GET'){allow('control','n8n');return send(res,200,await production.approval(db,m[1]));}
      if((m=route.match(/^\/approvals\/([a-f0-9-]+)\/decision$/))&&req.method==='POST'){allow('control');return send(res,200,await production.decide(db,m[1],data));}
      if(req.method==='GET'&&route==='/approvals'){allow('control');const jobId=url.searchParams.get('job_id');demand(uuid(jobId),'INVALID_JOB_ID');return send(res,200,{approvals:(await db.query('SELECT * FROM studio.approvals WHERE job_id=$1 ORDER BY created_at DESC',[jobId])).rows});}
      if(req.method==='POST'&&route==='/worker/claim'){allow('worker');return send(res,200,await production.claim(db));}
      if((m=route.match(/^\/worker\/tasks\/([a-f0-9-]+)\/heartbeat$/))&&req.method==='POST'){allow('worker');return send(res,200,await production.heartbeat(db,m[1],data));}
      if((m=route.match(/^\/worker\/tasks\/([a-f0-9-]+)\/complete$/))&&req.method==='POST'){allow('worker');return send(res,200,await production.complete(db,m[1],data));}
      if(req.method==='POST'&&route==='/scheduler/tick'){allow('n8n');exact(data,['job_id']);if(data.job_id)await publishing.schedule(db,data.job_id);return send(res,200,await publishing.claimDue(db));}
      if(req.method==='GET'&&route==='/publishing'){allow('control','n8n');const jobId=url.searchParams.get('job_id');demand(uuid(jobId),'INVALID_JOB_ID');return send(res,200,{publishing_jobs:(await db.query('SELECT p.*,a.platform FROM studio.publishing_jobs p JOIN studio.social_accounts a ON a.id=p.social_account_id WHERE content_job_id=$1 ORDER BY a.platform',[jobId])).rows});}
      if((m=route.match(/^\/publishing\/([a-f0-9-]+)$/))&&req.method==='GET'){allow('n8n','control');return send(res,200,await publishing.publishingJob(db,m[1]));}
      if((m=route.match(/^\/publishing\/([a-f0-9-]+)\/publish\/(youtube|instagram|facebook)$/))&&req.method==='POST'){allow('n8n');return send(res,200,await publishing.publish(db,m[1],m[2]));}
      if((m=route.match(/^\/publishing\/([a-f0-9-]+)\/reconcile$/))&&req.method==='POST'){allow('control','n8n');return send(res,200,await publishing.reconcile(db,m[1]));}
      if(req.method==='POST'&&route==='/ai/tasks'){allow('n8n','control');return send(res,201,await operations.aiTask(db,data));}
      if((m=route.match(/^\/ai\/tasks\/([a-f0-9-]+)$/))&&req.method==='GET'){allow('control','n8n');demand(uuid(m[1]),'INVALID_AI_ID');const r=await db.query('SELECT * FROM studio.ai_tasks WHERE id=$1',[m[1]]);demand(r.rowCount,'AI_TASK_NOT_FOUND',404);return send(res,200,r.rows[0]);}
      if(req.method==='GET'&&route==='/ai/providers/health'){allow('control','n8n');return send(res,200,providerHealth());}
      if((m=route.match(/^\/jobs\/([a-f0-9-]+)\/ai-result$/))&&req.method==='POST'){allow('n8n');return send(res,200,await operations.saveAi(db,m[1],data));}
      if(req.method==='POST'&&route==='/notifications'){allow('n8n');return send(res,201,await operations.notify(db,data));}
      if(req.method==='GET'&&route==='/notifications'){allow('control');return send(res,200,{notifications:(await db.query('SELECT * FROM studio.notifications ORDER BY delivered_at DESC LIMIT 100')).rows});}
      if(req.method==='POST'&&route==='/recovery'){allow('n8n','control');return send(res,200,await operations.recover(db));}
      if(req.method==='GET'&&route==='/reports'){allow('control','n8n');return send(res,200,await operations.reporting(db,url.searchParams.get('brand_id')));}
      throw new StudioError('NOT_FOUND',404);
    }catch(error){
      const map={'23505':['CONFLICT',409],'23503':['BRAND_OR_JOB_MISMATCH',409],'23514':['CONSTRAINT_VIOLATION',400]};const known=map[error.code];const code=error instanceof StudioError?error.code:known?.[0]??'SERVICE_UNAVAILABLE',status=error instanceof StudioError?error.status:known?.[1]??503;
      if(!res.headersSent)send(res,status,{error:{code}});else res.destroy();
    }
  });server.requestTimeout=30000;server.headersTimeout=10000;return server;
}
export async function main(){
  demand((process.env.PUBLISH_MODE??'mock')==='mock','LIVE_PUBLISHING_NOT_APPROVED');
  const read=name=>{const value=fs.readFileSync(process.env[name],'utf8').trim();demand(value.length>=32,'MISSING_LOCAL_SECRET');return value;};
  const secrets={control:read('CONTROL_TOKEN_FILE'),n8n:read('N8N_TOKEN_FILE'),worker:read('WORKER_TOKEN_FILE')},webhookKey=read('WEBHOOK_KEY_FILE'),db=await database();
  await db.query('SELECT version FROM studio.schema_migrations WHERE version=1');
  const server=createServer({db,secrets,webhookKey});server.listen(Number(process.env.PORT??8780),process.env.BIND_HOST??'127.0.0.1',()=>console.log(JSON.stringify({service:'studio-api',ready:true,mode:'mock'})));
  const stop=()=>server.close(()=>db.end().finally(()=>process.exit(0)));process.on('SIGINT',stop);process.on('SIGTERM',stop);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error(JSON.stringify({service:'studio-api',ready:false,error:'STARTUP_FAILED_NO_SECRET_VALUES_LOGGED'}));process.exitCode=1;});
