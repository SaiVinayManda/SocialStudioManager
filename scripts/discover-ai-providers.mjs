// Metadata/help only: no login/status commands, saved auth, provider DBs or inference.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
const root=process.cwd(),dir=path.join(root,'.runtime/ai-brain/discovery');fs.mkdirSync(dir,{recursive:true});
const home=path.join(dir,'empty-home');fs.mkdirSync(home,{recursive:true});
const env={SystemRoot:'C:\\Windows',WINDIR:'C:\\Windows',PATH:'C:\\Windows\\System32',HOME:home,USERPROFILE:home,TEMP:home,TMP:home,CODEX_HOME:path.join(home,'codex'),NO_COLOR:'1'};
const paths={codex_launcher:'C:\\Users\\Vinay\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js',agy:'C:\\Users\\Vinay\\AppData\\Local\\agy\\bin\\agy.exe',router_package:'C:\\Users\\Vinay\\AppData\\Roaming\\npm\\node_modules\\9router\\package.json'};
async function help(name,exe,args){return new Promise(resolve=>{
  let out='',err='';const c=spawn(exe,args,{cwd:home,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  const timer=setTimeout(()=>c.kill(),10000);c.stdout.on('data',b=>out=(out+b).slice(0,40000));c.stderr.on('data',b=>err=(err+b).slice(0,40000));
  c.once('error',e=>{clearTimeout(timer);resolve({name,error:e.code});});c.once('close',code=>{clearTimeout(timer);fs.writeFileSync(path.join(dir,name+'.txt'),out+err);resolve({name,exit_code:code,evidence:path.relative(root,path.join(dir,name+'.txt'))});});
});}
const report={timestamp:new Date().toISOString(),credential_access:false,inference_requests:0,commands:[]};
if(fs.existsSync(paths.codex_launcher)){
  report.commands.push(await help('codex-version',process.execPath,[paths.codex_launcher,'--version']));
  report.commands.push(await help('codex-exec-help',process.execPath,[paths.codex_launcher,'exec','--help']));
}
if(fs.existsSync(paths.agy)){report.agy={path:paths.agy,sha256:crypto.createHash('sha256').update(fs.readFileSync(paths.agy)).digest('hex')};report.commands.push(await help('agy-help',paths.agy,['--help']));}
if(fs.existsSync(paths.router_package)){const p=JSON.parse(fs.readFileSync(paths.router_package,'utf8'));report.router={version:p.version,source:'installed public package manifest'};}
report.endpoints=[];
for(const url of ['http://127.0.0.1:20128/health','http://127.0.0.1:20128/v1/models','http://127.0.0.1:8780/health','http://127.0.0.1:5678/healthz/readiness']){
  const entry={url};try{
    const r=await fetch(url,{signal:AbortSignal.timeout(4000),redirect:'error'});entry.http_status=r.status;
    let bytes=0;const chunks=[];for await(const b of r.body){bytes+=b.length;if(bytes>524288){await r.body.cancel().catch(()=>{});throw Error('response_too_large');}chunks.push(b);}
    if(r.ok&&url.endsWith('/v1/models')){const data=JSON.parse(Buffer.concat(chunks));entry.models=data.data?.slice(0,200).map(m=>({id:String(m.id).replace(/[^a-zA-Z0-9._:/@-]/g,'').slice(0,180),owned_by:typeof m.owned_by==='string'?m.owned_by.replace(/[^a-zA-Z0-9._-]/g,'').slice(0,80):null}));entry.models_are_not_authorization_or_quota_evidence=true;}
  }catch(e){entry.error=e.cause?.code??e.message.slice(0,50);}report.endpoints.push(entry);
}
fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
