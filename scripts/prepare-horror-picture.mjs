// Cinematic assets stage: source selects, vertical reframing and restrained grade.
// Full assembly is performed later by upstream video_stitch and video_compose.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const root=process.cwd(),job=path.join(root,'generated-videos','horror','pilot-001');
const ffmpeg=path.join(root,'.runtime','openmontage-pilot','ffmpeg','ffmpeg-9.0.2-essentials_build','bin','ffmpeg.exe');
const outDir=path.join(job,'assets','selects');fs.mkdirSync(outDir,{recursive:true});
const raw=JSON.parse(fs.readFileSync(path.join(job,'assets','source-downloads.json'),'utf8'));
if(raw.length!==6)throw Error('Six approved sources required');
for(const a of raw){if(crypto.createHash('sha256').update(fs.readFileSync(a.path)).digest('hex')!==a.sha256)throw Error('Source digest changed');}
const shots=[
 {id:'shot-01',source:'phone',start:1,duration:3.2,crop:'crop=608:1080:360:0',grade:'eq=saturation=0.35:contrast=1.06:brightness=-0.015'},
 {id:'shot-02',source:'rain',start:2,duration:9.4,crop:null,grade:'eq=saturation=0.35:contrast=1.03:gamma=1.06'},
 {id:'shot-03',source:'hall',start:.5,duration:7.4,crop:'crop=406:720:854:0',grade:'eq=saturation=0.25:contrast=1.02:gamma=1.12'},
 {id:'shot-04',source:'night',start:2,duration:3.4,crop:'crop=406:720:600:0',grade:'eq=saturation=0.15:contrast=1.03:gamma=1.08'},
 {id:'shot-05',source:'phone',start:4,duration:11.4,crop:'crop=608:1080:360:0',grade:'eq=saturation=0.25:contrast=1.07:brightness=-0.02'},
 {id:'shot-06',source:'bedroom',start:1,duration:11.4,crop:'crop=406:720:740:0',grade:'eq=saturation=0.25:contrast=1.06:brightness=-0.045:gamma=0.94'},
 {id:'shot-07',source:'curtain',start:.2,duration:10.4,crop:'crop=608:1080:850:0',grade:'eq=saturation=0.2:contrast=1.04:brightness=-0.04:gamma=0.94'},
 {id:'shot-08',source:'phone',start:15,duration:6.2,crop:'crop=608:1080:360:0',grade:'eq=saturation=0.2:contrast=1.08:brightness=-0.025'}
];
const run=[];for(const shot of shots){
 const source=raw.find(a=>a.id===shot.source),target=path.join(outDir,shot.id+'.mp4');
 if(fs.existsSync(target))throw Error('Existing select preserved: '+target);
 const vf=[shot.crop,'scale=1080:1920:flags=lanczos','setsar=1','fps=30',shot.grade,'colorbalance=bs=0.025:rs=-0.012:bm=0.008','format=yuv420p'].filter(Boolean).join(',');
 const args=['-nostdin','-hide_banner','-benchmark','-threads','2','-ss',String(shot.start),'-i',source.path,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',String(shot.duration),'-filter_threads','1','-vf',vf,'-map','0:v:0','-map','1:a:0','-c:v','libx264','-threads','4','-crf','20','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-ar','48000','-ac','2','-movflags','+faststart','-n',target];
 const started=new Date().toISOString(),begin=performance.now();
 const r=spawnSync(ffmpeg,args,{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:3*1024*1024});
 const log=path.join(job,'logs',shot.id+'-prepare.stderr');fs.writeFileSync(log,r.stderr??'',{flag:'wx'});
 const receipt={...shot,source_path:source.path,output_path:target,ffmpeg_args:args,started_utc:started,finished_utc:new Date().toISOString(),elapsed_seconds:(performance.now()-begin)/1000,exit_code:r.status,benchmark_lines:(r.stderr??'').split(/\r?\n/).filter(l=>l.startsWith('bench:')),source_sha256:source.sha256};
 fs.writeFileSync(path.join(job,'logs',shot.id+'-prepare.json'),JSON.stringify(receipt,null,2),{flag:'wx'});
 if(r.status!==0)throw Error('Select preparation failed: '+shot.id+'; see '+log);
 run.push(receipt);console.log(JSON.stringify({shot:shot.id,elapsed_seconds:receipt.elapsed_seconds,output_path:target}));
}
fs.writeFileSync(path.join(job,'assets','selects-manifest.json'),JSON.stringify({shots:run,transition:'crossfade',transition_duration:.4,expected_output_seconds:60,rights_ref:'assets/source-downloads.json',notes:'Original footage preserved; three 720p interior sources reframed/upscaled. Crops exclude the framed artwork and unrelated laptop marks; no actor added, no still-image substitution.'},null,2),{flag:'wx'});
const srt=fs.readFileSync(path.join(job,'subtitles','horror_pilot_001.srt'),'utf8');
const stamp=s=>{const [h,m,last]=s.split(':');return `${+h}:${m}:${(+last.replace(',','.')).toFixed(2).padStart(5,'0')}`;};
let ass='[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,58,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,90,90,280,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';
for(const block of srt.trim().split(/\r?\n\s*\r?\n/)){const lines=block.split(/\r?\n/),[a,b]=lines[1].split(' --> ');ass+=`Dialogue: 0,${stamp(a)},${stamp(b)},Default,,0,0,0,,${lines.slice(2).join('\\N').replace(/[{}]/g,'')}\n`;}
fs.writeFileSync(path.join(job,'subtitles','horror_pilot_001.ass'),ass,{flag:'wx'});
console.log(JSON.stringify({selects:run.length,duration_before_overlaps:run.reduce((n,s)=>n+s.duration,0),duration_after_overlaps:run.reduce((n,s)=>n+s.duration,0)-.4*(run.length-1),ass_ready:true}));
