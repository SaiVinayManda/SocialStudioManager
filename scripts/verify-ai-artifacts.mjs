import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {fileHash,runProcess,childEnvironment} from '../services/production-adapter/media.mjs';
import {demand} from '../services/studio-runtime/contracts.mjs';
const root=process.cwd(),jobId=process.argv[2];demand(/^[a-f0-9-]{36}$/.test(jobId??''),'JOB_UUID_REQUIRED');
const dir=path.join(root,'docs/test-evidence/milestone-e2',new Date().toISOString().replaceAll(/[:.]/g,'-'));fs.mkdirSync(dir,{recursive:true});
const project=path.join(root,'brands/horror/projects','ai-'+jobId),python=path.join(root,'.runtime/openmontage-pilot/venv/Scripts/python.exe');
const p=spawnSync(python,['-I','scripts/check-ai-openmontage.py',project],{cwd:root,env:childEnvironment(root),windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536});
let mapping;try{mapping=JSON.parse(p.stdout);}catch{mapping={passed:false,error:'EXISTING_PYTHON_EXECUTION_FAILED'};}
const video=path.join(root,'generated-videos/horror/pilot-001/final/horror_pilot_001.mp4'),ffprobe=path.join(root,'.runtime/openmontage-pilot/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffprobe.exe');
const probe=await runProcess(ffprobe,['-v','error','-show_format','-show_streams','-of','json',video],{workspace:root,timeoutMs:10000});
const data=probe.exit_code===0?JSON.parse(probe.stdout):{},v=data.streams?.find(s=>s.codec_type==='video'),digest=await fileHash(video);
const videoPassed=probe.exit_code===0&&v?.width===1080&&v.height===1920&&Number(data.format.duration)===60&&digest==='48fb3d02aecb4e83c43654d111194fd44870011c229a8b7387d8a83096858528';
const report={captured_at:new Date().toISOString(),passed:p.status===0&&mapping.passed&&videoPassed,upstream_schema_validation:mapping,existing_pilot:{ffprobe_exit_code:probe.exit_code,width:v?.width,height:v?.height,duration_seconds:Number(data.format?.duration),sha256:digest,unchanged:videoPassed},rendered:false};
fs.writeFileSync(path.join(dir,'artifact-validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...report,evidence:dir}));if(!report.passed)process.exitCode=1;
