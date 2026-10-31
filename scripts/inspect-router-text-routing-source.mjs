// Public installed JavaScript read as text only. Never import/execute router code,
// open its data directory, bootstrap auth or call inference.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const base='C:\\Users\\Vinay\\AppData\\Roaming\\npm\\node_modules\\9router\\app\\.next-cli-build\\server\\chunks',started=new Date().toISOString();
const specs=[
  ['2598.js','id:"api-airforce"',0,1050,'API.airforce provider/transport/model definitions'],
  ['2598.js','id:"agnes"',0,1050,'Agnes trial-credit provider and chat endpoint'],
  ['2598.js','id:"mimo-free"',0,620,'MiMo free auto-model definition'],
  ['2598.js','id:"opencode"',0,1550,'OpenCode Free provider and model transport definitions'],
  ['9604.js','38775:',0,1370,'Explicit provider/model resolution and slash-qualified combo bypass'],
  ['6724.js','40669:',0,1700,'Qualified model parser and unqualified alias handling'],
  ['9489.js','17603:',0,1500,'Configuration-controlled capability fallback/substitution'],
  ['9489.js','Capacity adapter for',900,1500,'Chat handler conditional substitution path'],
  ['5330.js','free-ai/bootstrap',100,2260,'MiMo bootstrap/JWT, implicit authentication and retry path']
];
const excerpts=specs.map(([file,needle,before,length,purpose])=>{
  const bytes=fs.readFileSync(path.join(base,file)),text=bytes.toString('utf8'),offset=text.indexOf(needle);if(offset<0)throw Error('PUBLIC_SOURCE_MARKER_NOT_FOUND');
  const start=Math.max(0,offset-before);return {file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),offset,purpose,excerpt:text.slice(start,start+length)};
});
const report={started_at:started,completed_at:new Date().toISOString(),package_version:'0.5.112',source_kind:'installed public bundle; not live settings',excerpts,credential_access:false,router_code_executed:false,inference_requests:0,live_route_policy_verified:false};
const dir=path.join(process.cwd(),'docs/test-evidence/milestone-e2','text-route-source-'+started.replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'source-audit.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({evidence:dir,public_excerpts:excerpts.length,live_route_policy_verified:false,credential_access:false,inference_requests:0}));
