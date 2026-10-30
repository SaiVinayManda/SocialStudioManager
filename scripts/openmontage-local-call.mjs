// Thin local launcher: the agent executes the upstream pipeline one stage at a time.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runtime = path.join(root, '.runtime', 'openmontage-pilot');
const job = path.join(root, 'generated-videos', 'horror', 'pilot-001');
const request = path.resolve(process.argv[2] ?? '');
if (!request.startsWith(job + path.sep) || !request.endsWith('.json')) throw Error('Request must be job-local JSON');
const payload = JSON.parse(fs.readFileSync(request, 'utf8'));
if (!['checkpoint', 'tool', 'resume'].includes(payload.action)) throw Error('Unsupported action');
if(payload.action==='tool'&&payload.params?.output_path){
 const output=path.resolve(payload.params.output_path);
 if(!output.startsWith(job+path.sep)||fs.existsSync(output))throw Error('Output must be a new job-local file');
}
const driver = path.join(job, 'scripts', 'local_call.py');
if (!fs.existsSync(driver)) fs.writeFileSync(driver, `import json, os, socket, sys
from pathlib import Path
root=Path(${JSON.stringify(root)})
if (root/'openmontage'/'.env').exists(): raise RuntimeError('Unexpected environment file')
def denied(*args, **kwargs): raise RuntimeError('Network disabled for local production')
socket.socket.connect=denied
socket.create_connection=denied
socket.getaddrinfo=denied
os.environ['OPENMONTAGE_PROJECTS_DIR']=str(root/'generated-videos'/'horror')
sys.path.insert(0,str(root/'openmontage'))
from lib.checkpoint import write_checkpoint,get_next_stage
p=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
if p['action']=='checkpoint':
 r=write_checkpoint(root/'generated-videos'/'horror','pilot-001',pipeline_type='cinematic',**p['checkpoint'])
 print(json.dumps({'checkpoint':str(r)}))
elif p['action']=='resume': print(json.dumps({'next_stage':get_next_stage(root/'generated-videos'/'horror','pilot-001',pipeline_type='cinematic')}))
else:
 if p['tool'] not in ['piper_tts','video_compose','video_stitch','audio_mixer','subtitle_gen','color_grade']: raise RuntimeError('Unapproved tool')
 from tools.tool_registry import registry
 registry.discover()
 tool=registry.get(p['tool'])
 if tool is None: raise RuntimeError('Tool unavailable')
 r=tool.execute(p['params'])
 print(json.dumps({'success':r.success,'data':r.data,'error':r.error},default=str,ensure_ascii=True))
 if not r.success: sys.exit(2)
`, {flag:'wx'});
const env={SystemRoot:'C:\\Windows',PATH:[path.join(runtime,'venv','Scripts'),path.join(runtime,'ffmpeg','ffmpeg-9.0.2-essentials_build','bin'),'C:\\Windows\\System32'].join(';'),TEMP:path.join(runtime,'tmp'),TMP:path.join(runtime,'tmp'),HOME:path.join(runtime,'home'),USERPROFILE:path.join(runtime,'home'),APPDATA:path.join(runtime,'home','AppData','Roaming'),LOCALAPPDATA:path.join(runtime,'home','AppData','Local'),PYTHONUTF8:'1',PIP_CONFIG_FILE:'NUL',OMP_NUM_THREADS:'4'};
const start=new Date().toISOString();
const result=spawnSync(path.join(runtime,'venv','Scripts','python.exe'),['-I',driver,request],{env,shell:false,windowsHide:true,encoding:'utf8',timeout:900000,maxBuffer:8*1024*1024});
const receipt={started_utc:start,finished_utc:new Date().toISOString(),request,exit_code:result.status,error:result.error?.code??null,stdout:result.stdout??'',stderr:result.stderr??''};
const target=path.join(job,'logs','call-'+Date.now()+'.json');
fs.writeFileSync(target,JSON.stringify(receipt,null,2),{flag:'wx'});
console.log(JSON.stringify({...receipt,receipt_path:target}));
if(result.status!==0||result.error)process.exitCode=1;
