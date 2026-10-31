import path from 'node:path';import {compose,control,sql,save,root} from './e3-common.mjs';
const models=await fetch('http://127.0.0.1:20128/v1/models',{redirect:'error',signal:AbortSignal.timeout(5000)}).then(async r=>({status:r.status,ids:r.ok?(await r.json()).data.map(x=>x.id):[]})).catch(()=>({status:'unavailable',ids:[]}));
const providers=await control('/ai/providers/status');
const services=compose(['ps','--format','json']).split(/\r?\n/).filter(Boolean).map(x=>{const s=JSON.parse(x);return {service:s.Service,state:s.State,health:s.Health};});
const workflows=JSON.parse(sql('n8n_internal',`SELECT json_agg(x) FROM (SELECT id,active FROM n8n.workflow_entity WHERE id LIKE 'socialstudio%' ORDER BY id) x`));
const record={at:new Date().toISOString(),providers,models,services,workflows,inference_calls:0,credentials_read:'Existing local service authentication only, via approved helpers; no model credentials',authorization:'No current live-model grant established. Rendering fixture tests may continue under current owner instruction.'};
const file=path.join(root,'docs/test-evidence/milestone-e3/discovery.json');save(file,record);console.log(JSON.stringify(record));
