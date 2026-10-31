// Read-only, unauthenticated metadata. Never tests a model or loads saved auth.
import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),started=new Date().toISOString(),report={started_at:started,inference_requests:0,credential_access:false,configuration_changes:false,probes:[]};
for(const endpoint of process.argv.includes('--catalog-only')?['/v1/models']:['/v1/models','/api/models/alias','/api/combos','/api/pricing']){
  const entry={endpoint,method:'GET'};try{
    const r=await fetch('http://127.0.0.1:20128'+endpoint,{signal:AbortSignal.timeout(5000),redirect:'error'});entry.http_status=r.status;
    if(!r.ok){await r.body?.cancel();report.probes.push(entry);continue;}
    const chunks=[];let bytes=0;for await(const b of r.body){bytes+=b.length;if(bytes>1048576)throw Error('METADATA_TOO_LARGE');chunks.push(b);}
    const value=JSON.parse(Buffer.concat(chunks));
    if(endpoint==='/v1/models')entry.models=value.data?.map(model=>({id:typeof model.id==='string'&&/^[a-zA-Z0-9._:/@-]{1,180}$/.test(model.id)?model.id:'[invalid id]',owned_by:typeof model.owned_by==='string'&&/^[a-zA-Z0-9._-]{1,80}$/.test(model.owned_by)?model.owned_by:null,available_metadata_keys:Object.keys(model).filter(key=>!/(?:token|key|secret|password|cookie|auth)/i.test(key)).slice(0,30),capabilities:model.capabilities&&typeof model.capabilities==='object'?Object.fromEntries(Object.entries(model.capabilities).filter(([k,v])=>['chat','text','text_generation','embedding','rerank','classification','systemone','tools','vision','reasoning','streaming','structured_output','json_mode'].includes(k)&&typeof v==='boolean')):null,context_length:Number.isInteger(model.context_length)?model.context_length:null}));
    // Stop short of recording arbitrary private metadata; source-reviewed routes
    // expose routing/pricing, but no authenticated responses are requested here.
    else entry.response_shape={array:Array.isArray(value),keys:value&&typeof value==='object'?Object.keys(value).filter(key=>!/(?:token|key|secret|password|cookie|auth)/i.test(key)).slice(0,20):[]};
  }catch(error){entry.error=error.cause?.code??'METADATA_PROBE_FAILED';}
  report.probes.push(entry);
}
report.completed_at=new Date().toISOString();const dir=path.join(root,'docs/test-evidence/milestone-e2','text-model-discovery-'+started.replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'metadata.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...report,evidence:dir},null,2));
