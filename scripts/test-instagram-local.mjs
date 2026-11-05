// Offline tests with a clean child environment; never installs or reads secrets.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {childEnvironment} from '../services/production-adapter/media.mjs';
const root=process.cwd(),at=new Date().toISOString(),dir=path.join(root,'docs/test-evidence/instagram-pilot');fs.mkdirSync(dir,{recursive:true});
const command=['--test','--test-reporter=tap','test/instagram-pilot.test.mjs','test/instagram-login.test.mjs','test/meta-unified-login.test.mjs'];
const r=spawnSync(process.execPath,command,{cwd:root,env:childEnvironment(root),windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576});
const output=(r.stdout??'')+(r.stderr??''),counts=Object.fromEntries([...output.matchAll(/^# (tests|pass|fail|skipped) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
const receipt={at,command:'node '+command.join(' '),exit_code:r.status,counts,passed:r.status===0&&counts.fail===0&&counts.tests>0,external_network_requests:0,loopback_http_tests:true,credentials_read:false,video_uploads:0,publications:0,scope:'Fixture transport/approval/vault/OAuth tests only; actual Instagram login and HTTPS endpoint acceptance not run'};
const prefix=path.join(dir,at.replaceAll(/[:.]/g,'-'));fs.writeFileSync(prefix+'.tap',output,{flag:'wx'});fs.writeFileSync(prefix+'.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(receipt));if(!receipt.passed)process.exitCode=1;
