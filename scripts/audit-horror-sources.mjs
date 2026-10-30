import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const root=process.cwd(),job=path.join(root,'generated-videos','horror','pilot-001'),bin=path.join(root,'.runtime','openmontage-pilot','ffmpeg','ffmpeg-9.0.2-essentials_build','bin');
const sources=JSON.parse(fs.readFileSync(path.join(job,'assets','source-downloads.json'),'utf8'));
const result=[];
for(const source of sources){
 const data=fs.readFileSync(source.path);const verified=crypto.createHash('sha256').update(data).digest('hex')===source.sha256&&data.length===source.bytes;
 const p=spawnSync(path.join(bin,'ffprobe.exe'),['-v','error','-show_format','-show_streams','-of','json',source.path],{encoding:'utf8',windowsHide:true,timeout:30000});
 const probe=p.status===0?JSON.parse(p.stdout):null;
 const begin=performance.now();
 const d=spawnSync(path.join(bin,'ffmpeg.exe'),['-nostdin','-hide_banner','-i',source.path,'-an','-vf','freezedetect=n=-50dB:d=2,blackdetect=d=0.3:pix_th=0.02:pic_th=0.98','-f','null','-'],{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:3*1024*1024});
 const logfile=path.join(job,'logs','source-decode-'+source.id+'.stderr');if(!fs.existsSync(logfile))fs.writeFileSync(logfile,d.stderr??'',{flag:'wx'});
 result.push({id:source.id,sha256_verified:verified,bytes:data.length,probe_exit_code:p.status,probe,full_decode_exit_code:d.status,decode_seconds:(performance.now()-begin)/1000,freeze_reports:(d.stderr??'').split(/\r?\n/).filter(x=>x.includes('freeze_')),black_reports:(d.stderr??'').split(/\r?\n/).filter(x=>x.includes('black_start')),note:'Source check only; not a finished-video acceptance.'});
 if(!verified||p.status!==0||d.status!==0)throw Error('Source audit failed: '+source.id);
}
const target=path.join(job,'logs','source-audit-'+Date.now()+'.json');fs.writeFileSync(target,JSON.stringify(result,null,2),{flag:'wx'});
console.log(JSON.stringify({report:target,sources:result.map(x=>({id:x.id,sha256_verified:x.sha256_verified,full_decode_exit_code:x.full_decode_exit_code,duration:x.probe.format.duration,video:x.probe.streams.filter(s=>s.codec_type==='video').map(s=>({width:s.width,height:s.height})),freeze_reports:x.freeze_reports,black_reports:x.black_reports}))}));
