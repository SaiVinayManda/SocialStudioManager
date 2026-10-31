import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {childEnvironment} from '../services/production-adapter/media.mjs';
const root=process.cwd(),started=new Date().toISOString(),dir=path.join(root,'docs/test-evidence/milestone-e2',started.replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});
const args=['--test','--test-reporter=tap','tests/ai-brain/runtime.test.mjs','tests/orchestrator/runtime.test.mjs','tests/orchestrator/proxy.test.mjs'];
const r=spawnSync(process.execPath,args,{cwd:root,env:childEnvironment(root),windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:2097152});
const output=(r.stdout??'')+(r.stderr??''),counts=Object.fromEntries([...output.matchAll(/^# (tests|pass|fail|skipped) (\d+)$/gm)].map(m=>[m[1],+m[2]]));
const report={started_at:started,completed_at:new Date().toISOString(),command:'node '+args.join(' '),exit_code:r.status,counts,passed:r.status===0&&counts.fail===0,providers:'simulated fixtures only; no real inference',postgres_executed:false,n8n_executed:false};
fs.writeFileSync(path.join(dir,'unit.tap'),output,{flag:'wx'});fs.writeFileSync(path.join(dir,'unit.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...report,evidence:dir}));if(!report.passed)process.exitCode=1;
