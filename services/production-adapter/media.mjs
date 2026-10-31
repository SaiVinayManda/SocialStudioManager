import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn} from 'node:child_process';
import {demand,StudioError} from '../studio-runtime/contracts.mjs';
export function mediaPath(workspace,reference,brandSlug,{mustExist=true}={}){
  demand(['generated','brands'].includes(reference?.root_id),'UNREGISTERED_ROOT');
  const parts=reference.relative_path?.split('/');demand(parts?.length>=2&&parts[0]===brandSlug,'BRAND_PATH_MISMATCH');
  demand(parts.every(p=>/^[a-zA-Z0-9][a-zA-Z0-9 ._-]*$/.test(p)&&!p.endsWith('.')&&!p.endsWith(' ')&&!/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(p)),'UNSAFE_PATH');
  if(reference.root_id==='brands')demand(parts[1]==='inputs','INPUT_FOLDER_REQUIRED');
  const base=path.resolve(workspace,reference.root_id==='generated'?'generated-videos':'brands'),target=path.resolve(base,...parts);
  demand(target.startsWith(base+path.sep),'UNSAFE_PATH');let current=base;
  demand(!fs.lstatSync(base).isSymbolicLink(),'LINK_FORBIDDEN');
  for(let i=0;i<parts.length;i++){current=path.join(current,parts[i]);if(!mustExist&&i===parts.length-1&&!fs.existsSync(current))break;demand(!fs.lstatSync(current).isSymbolicLink(),'LINK_FORBIDDEN');}
  if(mustExist){const stat=fs.statSync(target);demand(stat.isFile()&&stat.nlink===1&&stat.size>0&&stat.size<=1073741824,'UNSAFE_MEDIA_FILE');}
  return target;
}
export async function fileHash(file){const hash=crypto.createHash('sha256');for await(const bytes of fs.createReadStream(file,{highWaterMark:65536}))hash.update(bytes);return hash.digest('hex');}
export function childEnvironment(workspace){const runtime=path.join(workspace,'.runtime','orchestrator','worker-home');fs.mkdirSync(runtime,{recursive:true});return {SystemRoot:'C:\\Windows',WINDIR:'C:\\Windows',PATH:'C:\\Windows\\System32',HOME:runtime,USERPROFILE:runtime,TEMP:runtime,TMP:runtime,PYTHONUTF8:'1',OMP_NUM_THREADS:'4'};}
export async function runProcess(executable,args,{workspace,signal,timeoutMs=180000,maxLogs=65536,env}={}){
  return new Promise((resolve,reject)=>{
    const begin=performance.now();let stderr='',stdout='',done=false,timedOut=false,cancelled=false,stopping=false,cleanupFailed=false,cleanup=Promise.resolve();
    const child=spawn(executable,args,{shell:false,windowsHide:true,cwd:workspace,env:env??childEnvironment(workspace),stdio:['ignore','pipe','pipe']});
    const stop=(timeout)=>{
      if(done||stopping)return;stopping=true;timedOut=timeout;cancelled=!timeout;
      if(process.platform==='win32'&&child.pid){
        cleanup=new Promise(finish=>{
          const killer=spawn('C:\\Windows\\System32\\taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,env:childEnvironment(workspace),timeout:5000,killSignal:'SIGKILL',stdio:'ignore'});
          let finished=false;const end=code=>{if(finished)return;finished=true;if(code!==0){cleanupFailed=true;child.kill('SIGKILL');}finish();};
          killer.once('error',()=>end(null));killer.once('close',end);
        });
      }else child.kill('SIGKILL');
    };
    const timer=setTimeout(()=>stop(true),timeoutMs),abort=()=>stop(false);signal?.addEventListener('abort',abort,{once:true});
    child.stdout.on('data',b=>{stdout=(stdout+b.toString('utf8')).slice(-1048576);});child.stderr.on('data',b=>{stderr=(stderr+b.toString('utf8')).slice(-maxLogs);});
    child.on('error',e=>{done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);reject(new StudioError(e.code==='ENOENT'?'TOOL_NOT_FOUND':'PROCESS_START_FAILED'));});
    child.on('close',async(code,terminationSignal)=>{done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);await cleanup;resolve({exit_code:code,signal:terminationSignal,stdout,stderr,elapsed_seconds:(performance.now()-begin)/1000,timed_out:timedOut,cancelled,cleanup_failed:cleanupFailed});});
    if(signal?.aborted)stop(false);
  });
}
export function subtitleCheck(file,duration){
  const stat=fs.statSync(file);demand(stat.size<=524288,'SUBTITLE_TOO_LARGE');const text=fs.readFileSync(file,'utf8');
  const stamps=[...text.matchAll(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/g)];demand(stamps.length>0,'SUBTITLE_INVALID');let previous=0;
  for(const m of stamps){const a=+m[1]*3600 + +m[2]*60 + +m[3] + +m[4]/1000,b=+m[5]*3600 + +m[6]*60 + +m[7] + +m[8]/1000;demand(a>=previous&&b>a&&b<=duration+.15,'SUBTITLE_TIMING_INVALID');previous=b;}
  return {artifact_valid:true,cues:stamps.length,burned_in_verification:'Requires existing digest-bound render evidence or human preview; ffprobe cannot detect rasterized words.'};
}
export async function validateVideo(job,config,signal,{verifyOnly=false}={}){
  const begin=performance.now(),file=mediaPath(config.workspace,job.source_reference,job.brand_slug),before=fs.statSync(file);
  const ffprobe=path.join(config.ffmpeg_bin,'ffprobe.exe'),ffmpeg=path.join(config.ffmpeg_bin,'ffmpeg.exe');
  const probe=await runProcess(ffprobe,['-v','error','-protocol_whitelist','file,pipe','-show_format','-show_streams','-of','json',file],{workspace:config.workspace,signal,timeoutMs:30000});
  demand(!probe.cleanup_failed,'PROCESS_TREE_CLEANUP_UNVERIFIED');demand(!probe.cancelled&&!probe.timed_out&&probe.exit_code===0,probe.cancelled?'CANCELLED':probe.timed_out?'PROCESS_TIMEOUT':'FFPROBE_FAILED');
  const data=JSON.parse(probe.stdout),v=data.streams?.find(s=>s.codec_type==='video'),a=data.streams?.find(s=>s.codec_type==='audio'),duration=Number(data.format?.duration),settings=job.production_settings??{};
  demand(v&&v.codec_name==='h264'&&v.width===(settings.expected_width??1080)&&v.height===(settings.expected_height??1920),'VIDEO_FORMAT_MISMATCH');
  demand(duration>=(settings.min_duration??1)&&duration<=(settings.max_duration??3600),'DURATION_MISMATCH');demand(settings.require_audio===false||a?.codec_name==='aac','AUDIO_REQUIRED');
  let decode={exit_code:0,stderr:'',elapsed_seconds:0};
  if(!verifyOnly){decode=await runProcess(ffmpeg,['-nostdin','-v','error','-threads','2','-protocol_whitelist','file,pipe','-i',file,'-f','null','-'],{workspace:config.workspace,signal,timeoutMs:settings.timeout_ms??180000});demand(!decode.cleanup_failed,'PROCESS_TREE_CLEANUP_UNVERIFIED');demand(!decode.cancelled&&!decode.timed_out&&decode.exit_code===0,decode.cancelled?'CANCELLED':decode.timed_out?'PROCESS_TIMEOUT':'FULL_DECODE_FAILED');}
  const digest=await fileHash(file),after=fs.statSync(file);demand(before.size===after.size&&before.mtimeMs===after.mtimeMs,'MEDIA_CHANGED_DURING_VALIDATION');
  if(job.source_reference.expected_checksum)demand(digest===job.source_reference.expected_checksum,'EXPECTED_CHECKSUM_MISMATCH');
  const subtitles=settings.subtitle_reference?subtitleCheck(mediaPath(config.workspace,settings.subtitle_reference,job.brand_slug),duration):{artifact_valid:false,review_required:true};
  const licence_metadata=settings.licence_reference?{reference:settings.licence_reference,evidence_checksum:await fileHash(mediaPath(config.workspace,settings.licence_reference,job.brand_slug)),legal_verification:'Operator must review the saved licence evidence; a checksum alone does not grant usage rights.'}:{review_required:true};
  if(settings.licence_reference)demand(licence_metadata.evidence_checksum===settings.licence_reference.checksum,'LICENCE_EVIDENCE_CHANGED');
  return {passed:true,checksum:digest,duration,width:v.width,height:v.height,bytes:after.size,ffprobe_exit_code:probe.exit_code,full_decode_exit_code:verifyOnly?null:decode.exit_code,elapsed_seconds:(performance.now()-begin)/1000,output_reference:job.source_reference,audio_present:Boolean(a),codecs:{video:v.codec_name,audio:a?.codec_name??null},subtitles,licence_metadata,engine_project_reference:job.source_reference.engine_project??null,logs:(probe.stderr+'\n'+decode.stderr).slice(-65536)};
}
