import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {demand,signWebhook} from '../studio-runtime/contracts.mjs';
import {mediaPath,fileHash} from './media.mjs';
export class StableScanner {
  constructor({workspace,brands,stableMs=5000}){demand(Number.isInteger(stableMs)&&stableMs>=5000&&stableMs<=60000,'INVALID_STABILITY_WINDOW');this.workspace=workspace;this.brands=brands;this.stableMs=stableMs;this.observed=new Map();this.delivered=new Set();}
  async scan(now=Date.now()){
    const ready=[];
    for(const brand of this.brands){
      const dir=path.join(this.workspace,'brands',brand.slug,'inputs');if(!fs.existsSync(dir)||fs.lstatSync(dir).isSymbolicLink())continue;
      for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
        if(!entry.isFile()||!entry.name.toLowerCase().endsWith('.mp4'))continue;
        const source={root_id:'brands',relative_path:`${brand.slug}/inputs/${entry.name}`};let file,stat;try{file=mediaPath(this.workspace,source,brand.slug);stat=fs.statSync(file);}catch{continue;}
        const signature=stat.size+':'+stat.mtimeMs,old=this.observed.get(file);
        if(!old||old.signature!==signature){this.observed.set(file,{signature,since:now});continue;}
        if(now-old.since<this.stableMs)continue;
        const digest=await fileHash(file),after=fs.statSync(file);if(stat.size!==after.size||stat.mtimeMs!==after.mtimeMs)continue;
        const key=brand.id+':'+digest;if(this.delivered.has(key))continue;
        ready.push({key,job:{brand_id:brand.id,source_type:'existing_file',source:{...source,expected_checksum:digest},idempotency_key:'folder:'+digest,production_settings:{require_audio:true,platforms:['youtube','instagram','facebook']}}});
      }
    }
    return ready;
  }
  acknowledge(key){this.delivered.add(key);}
}
export async function runIntake(config,{once=false,signal}={}){
  const url=new URL(config.webhook_url);demand(url.protocol==='http:'&&url.hostname==='127.0.0.1'&&url.port==='5678'&&url.pathname==='/webhook/social-studio/intake','LOCAL_INTAKE_WEBHOOK_REQUIRED');
  const key=fs.readFileSync(config.webhook_key_file,'utf8').trim();demand(key.length>=32,'LOCAL_WEBHOOK_SECRET_REQUIRED');
  const scanner=new StableScanner(config);
  // A one-shot run still needs two observations; an initial scan alone never
  // yields a stable file and used to exit without submitting anything.
  if(once){await scanner.scan();await new Promise(r=>setTimeout(r,scanner.stableMs+1));}
  do{for(const item of await scanner.scan()){try{const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(signWebhook(item.job,key)),signal:AbortSignal.timeout(12000)});if(r.ok){const result=await r.json();demand(result.job_id,'MISSING_DURABLE_ACK');scanner.acknowledge(item.key);console.log(JSON.stringify({job_id:result.job_id,source:'local-folder'}));}}catch{console.error(JSON.stringify({error:'INTAKE_RETRY_PENDING'}));}}
    if(once)return;await new Promise(r=>setTimeout(r,2000));
  }while(!signal?.aborted);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const i=process.argv.indexOf('--config');demand(i>=0,'CONFIG_REQUIRED');const config=JSON.parse(fs.readFileSync(process.argv[i+1],'utf8')),stop=new AbortController();process.on('SIGINT',()=>stop.abort());runIntake(config,{once:process.argv.includes('--once'),signal:stop.signal}).catch(()=>{console.error('FOLDER_INTAKE_STOPPED');process.exitCode=1;});}
