// Conditional E2 canary preflight only. No inference, account stores, secrets,
// CLI agents, route changes, installation or production job submission.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=process.cwd(),started=new Date().toISOString();
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const scope=JSON.parse(fs.readFileSync(path.join(root,'docs/AI_BRAIN_CANARY_SCOPE.json'),'utf8'));
const mismatches=scope.files.filter(file=>digest(file.path)!==file.sha256).map(file=>file.path);
const report={started_at:started,approval_id:'E2-REAL-CANARY-01',authorization:'conditional owner approval; zero-charge verification required before inference',scope:{files:scope.files.length,digest_mismatches:mismatches,packet_sha256:digest('docs/AI_BRAIN_CANARY_APPROVAL.md'),manifest_sha256:digest('docs/AI_BRAIN_CANARY_SCOPE.json'),absolute_expiry_utc:'2026-11-01T18:00:00Z',within_absolute_expiry:Date.now()<Date.parse('2026-11-01T18:00:00Z')},model:'oc/jev-1.13-free',probes:[],inference_requests:0,provider_credentials_accessed:false,provider_configuration_changed:false};
const endpoints=['http://127.0.0.1:20128/v1/models','http://127.0.0.1:20128/api/pricing'];
if(!mismatches.length&&report.scope.within_absolute_expiry)for(const url of endpoints){
  const entry={url,method:'GET'};try{
    const response=await fetch(url,{signal:AbortSignal.timeout(5000),redirect:'error'});entry.status=response.status;
    if(!response.ok){await response.body?.cancel();report.probes.push(entry);continue;}
    let bytes=0;const chunks=[];for await(const chunk of response.body){bytes+=chunk.length;if(bytes>1048576)throw Error('METADATA_RESPONSE_TOO_LARGE');chunks.push(chunk);}
    const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if(url.endsWith('/v1/models')){
      entry.listed_model_count=Array.isArray(body.data)?body.data.length:null;
      const match=body.data?.find(model=>model.id===report.model);
      entry.exact_model_listed=Boolean(match);
      if(match)entry.exact_model={id:match.id,object:match.object,owned_by:typeof match.owned_by==='string'&&/^[a-zA-Z0-9._-]{1,80}$/.test(match.owned_by)?match.owned_by:null};
      entry.inference_readiness_verified=false;
    }else{
      const rows=[];
      for(const [provider,models]of Object.entries(body??{})){
        if(!models||typeof models!=='object')continue;
        for(const [model,prices]of Object.entries(models)){
          if(!['jev-1.13-free','oc/jev-1.13-free'].includes(model)||!prices||typeof prices!=='object')continue;
          rows.push({provider:/^[a-zA-Z0-9._/-]{1,100}$/.test(provider)?provider:'[unrecognized]',model,prices:Object.fromEntries(Object.entries(prices).filter(([key,value])=>['input','output','cached','reasoning','cache_creation'].includes(key)&&Number.isFinite(value)))});
        }
      }
      entry.matching_local_price_rows=rows;
      entry.authoritative_upstream_billing_evidence=false;
    }
  }catch(error){entry.error=error.cause?.code??(['TimeoutError','AbortError','SyntaxError'].includes(error.name)?error.name:'METADATA_PROBE_FAILED');}
  report.probes.push(entry);
}
report.completed_at=new Date().toISOString();report.inference_allowed=false;
report.blockers=['No verified evidence that this exact live route cannot use billable upstream fallback/substitution. Local model listing and accounting prices do not prove billing policy.','Official TypeSafe/OpenCode documentation identifies Jev as a System One decision model, not a text generator for the requested horror content.'];
const dir=path.join(root,'docs/test-evidence/milestone-e2','canary-preflight-'+started.replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'preflight.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({...report,evidence:dir},null,2));
