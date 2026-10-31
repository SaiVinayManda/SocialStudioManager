// Read-only help/public metadata. No inference, login, model auth/config store,
// router source execution or service/configuration changes.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {runProcess,childEnvironment} from '../services/production-adapter/media.mjs';import {boundedJsonResponse} from '../services/ai-agent-manager/adapters.mjs';
const root=process.cwd(),at=new Date().toISOString(),dir=path.join(root,'docs/test-evidence/milestone-e4',at.replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});
const home=path.join(root,'.runtime/ai-brain/e4-discovery-home');fs.mkdirSync(path.join(home,'codex'),{recursive:true});const env={...childEnvironment(root),HOME:home,USERPROFILE:home,CODEX_HOME:path.join(home,'codex'),NO_COLOR:'1'};
const report={at,inference_calls:0,model_credential_access:false,configuration_changes:false,cli:[],local:[]};
for(const [name,exe,args]of [['codex-version',process.execPath,['C:\\Users\\Vinay\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js','--version']],['codex-exec-help',process.execPath,['C:\\Users\\Vinay\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js','exec','--help']],['agy-help','C:\\Users\\Vinay\\AppData\\Local\\agy\\bin\\agy.exe',['--help']]]){
 const r=await runProcess(exe,args,{workspace:root,env,timeoutMs:10000});fs.writeFileSync(path.join(dir,name+'.txt'),r.stdout+r.stderr);report.cli.push({name,exit_code:r.exit_code,timed_out:r.timed_out,cleanup_failed:r.cleanup_failed,help_sha256:crypto.createHash('sha256').update(r.stdout+r.stderr).digest('hex')});
}
for(const endpoint of ['/v1/models','/api/models/alias','/api/combos','/api/pricing']){
 try{const r=await fetch('http://127.0.0.1:20128'+endpoint,{redirect:'error',signal:AbortSignal.timeout(5000)}),row={endpoint,status:r.status};if(r.ok&&endpoint==='/v1/models')row.models=(await boundedJsonResponse(r)).data.map(m=>({id:m.id,owned_by:m.owned_by}));else await r.body?.cancel();report.local.push(row);}catch{report.local.push({endpoint,status:'unavailable'});}
}
try{
 const url='https://openrouter.ai/api/v1/models',r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});report.public_catalog={url,status:r.status};
 if(r.ok){const data=await boundedJsonResponse(r,{maxBytes:8388608}),free=data.data.filter(m=>m.architecture?.output_modalities?.includes('text')&&m.id.endsWith(':free')&&['prompt','completion'].every(k=>Number(m.pricing?.[k])===0));
 const summarize=m=>({id:m.id,pricing:m.pricing,supported_parameters:m.supported_parameters,context_length:m.context_length,architecture:m.architecture,top_provider:m.top_provider});
 report.public_catalog.structured_candidates=free.filter(m=>m.supported_parameters?.includes('structured_outputs')).slice(0,10).map(summarize);
 report.public_catalog.lightning=free.filter(m=>m.id.includes('nemotron-3.5-lightning')).map(summarize);
 report.public_catalog.free_text_count=free.length;report.public_catalog.sha256=crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
 }else await r.body?.cancel();
}catch(e){report.public_catalog={status:'unavailable',error:e.cause?.code??e.name};}
report.finished_at=new Date().toISOString();fs.writeFileSync(path.join(dir,'discovery.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({evidence:dir,...report}));
