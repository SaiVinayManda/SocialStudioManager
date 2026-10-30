// Independent validation of the actual upstream MP4; never manufactures a pass.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const root=process.cwd(),job=path.join(root,'generated-videos','horror','pilot-001'),bin=path.join(root,'.runtime','openmontage-pilot','ffmpeg','ffmpeg-9.0.2-essentials_build','bin');
const video=path.join(job,'final','horror_pilot_001.mp4');
if(!fs.existsSync(video))throw Error('No actual final MP4');
const logs=path.join(job,'logs');
function run(name,args,encoding='utf8'){
 const exe=path.join(bin,name==='probe'?'ffprobe.exe':'ffmpeg.exe');const begin=performance.now();
 const r=spawnSync(exe,args,{encoding,windowsHide:true,timeout:180000,maxBuffer:20*1024*1024});
 const receipt={command:[exe,...args],exit_code:r.status,error:r.error?.code??null,elapsed_seconds:(performance.now()-begin)/1000};
 if(r.status!==0||r.error)throw Error(name+' failed: '+(r.stderr??r.error));
 return {...receipt,stdout:r.stdout,stderr:r.stderr};
}
const p=run('probe',['-v','error','-show_format','-show_streams','-of','json',video]);
const probe=JSON.parse(p.stdout),v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
if(v?.width!==1080||v?.height!==1920||v?.codec_name!=='h264'||v?.pix_fmt!=='yuv420p'||!a||a.codec_name!=='aac'||+probe.format.duration<57||+probe.format.duration>63)throw Error('Final format requirements failed');
const decoded=run('decode',['-nostdin','-hide_banner','-threads','2','-i',video,'-vf','blackdetect=d=0.10:pix_th=0.02:pic_th=0.99,freezedetect=n=-50dB:d=2','-filter_threads','1','-an','-f','null','-']);
fs.writeFileSync(path.join(logs,'final-full-decode.stderr'),decoded.stderr,{flag:'wx'});
const black=decoded.stderr.split(/\r?\n/).filter(l=>l.includes('black_start:'));
const freeze=decoded.stderr.split(/\r?\n/).filter(l=>l.includes('freeze_start:'));
const loud=run('loudness',['-nostdin','-hide_banner','-threads','2','-i',video,'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json','-f','null','-']);
fs.writeFileSync(path.join(logs,'final-loudness.stderr'),loud.stderr,{flag:'wx'});
const loudness=JSON.parse(loud.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0]??'null');
if(!loudness||+loudness.input_i < -35||+loudness.input_tp >= 0)throw Error('Audio loudness/clipping check failed');
function pcm(file){const r=run('audio-decode',['-nostdin','-v','error','-threads','2','-i',file,'-map','0:a:0','-ar','48000','-ac','1','-f','s16le','-'],null);return r.stdout;}
const expected=pcm(path.join(job,'previews','horror_pilot_audio_preview.wav')),actual=pcm(video),n=Math.min(expected.length,actual.length)/2;
let xy=0,xx=0,yy=0,err=0;for(let i=0;i<n;i++){const x=expected.readInt16LE(i*2)/32768,y=actual.readInt16LE(i*2)/32768;xy+=x*y;xx+=x*x;yy+=y*y;err+=(x-y)**2;}
const correlation=xy/Math.sqrt(xx*yy),rmsError=Math.sqrt(err/n);
if(correlation<.95)throw Error('Rendered audio does not match existing approved preview');
const srt=fs.readFileSync(path.join(job,'subtitles','horror_pilot_001.srt'),'utf8');const blocks=srt.trim().split(/\r?\n\s*\r?\n/);
const ts=s=>{const [h,m,last]=s.split(':');return +h*3600 + +m*60 + +last.replace(',','.');};
const samples=[0,4,9,14,19,24,28,31].map(i=>{const parts=blocks[i].split(/\r?\n/),[b,e]=parts[1].split(' --> ').map(ts);return {cue:i+1,at:(b+e)/2,text:parts.slice(2).join(' ')};});
for(let i=0;i<samples.length;i++){const sample=samples[i],target=path.join(job,'previews','final-review-'+String(i+1).padStart(2,'0')+'.png');run('frame',['-nostdin','-v','error','-threads','2','-ss',String(sample.at),'-i',video,'-frames:v','1','-vf','scale=540:960','-n',target]);sample.path=target;}
const preview=path.join(job,'previews','horror_pilot_001_preview.mp4');
run('preview',['-nostdin','-v','error','-threads','2','-i',video,'-vf','scale=540:960','-filter_threads','1','-c:v','libx264','-threads','4','-preset','veryfast','-crf','26','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-n',preview]);
const sources=JSON.parse(fs.readFileSync(path.join(job,'assets','source-downloads.json'),'utf8'));
let attribution='# Horror pilot 001 — media provenance\n\nOriginal fiction: The Second Caller. No publishing performed.\n\n';
for(const s of sources)attribution+=`- ${s.id}: ${s.source_url}\n  - Provider: Mixkit; individual creator not listed on saved item page.\n  - Licence: ${s.license_url} (item-specific Free designation saved in assets/provenance/${s.id}.html).\n  - SHA256: ${s.sha256}; ${s.bytes} bytes. Original preserved; source trim/crop/grade in reviewed-selects-manifest.json.\n`;
attribution+='\nNarration: installed Piper 1.8.0, approved en_US-ljspeech-medium model; existing model card retained in the runtime. Score/effects: original local mathematical synthesis; source recipe, seed and hash in audio-provenance.json. Subtitles: original script with measured phrase bounds and interpolated subphrase timing. Arial is rasterized using the installed Windows font; no font file is distributed. Three 720p interior sources were upscaled.\n';
fs.writeFileSync(path.join(job,'assets','ATTRIBUTION.md'),attribution,{flag:'wx'});
const result={captured_at_utc:new Date().toISOString(),output_path:video,exists:true,bytes:fs.statSync(video).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex'),probe,valid_mp4:true,full_video_decode_passed:true,resolution_passed:true,duration_passed:true,audio_present:true,audio_loudness:loudness,existing_audio_preserved:{correlation,rms_error:rmsError,decoded_samples_compared:n,passed:correlation>=.95},black_reports:black,freeze_reports:freeze,no_black_or_freeze_reports:black.length===0&&freeze.length===0,subtitle_cues:blocks.length,caption_visual_samples:samples,caption_visual_review:'pending actual sampled-frame inspection',preview_path:preview,paid_api_charges_usd:0,publishing:false,source_rights_manifest:'assets/ATTRIBUTION.md',manual_listening_review:'Owner review pending; no ASR/forced-alignment model installed.',automated_validation_passed:black.length===0&&freeze.length===0};
fs.writeFileSync(path.join(logs,'final-validation.json'),JSON.stringify(result,null,2),{flag:'wx'});
console.log(JSON.stringify({output_path:video,bytes:result.bytes,duration_seconds:+probe.format.duration,resolution:`${v.width}x${v.height}`,fps:v.r_frame_rate,audio_codec:a.codec_name,audio_correlation:correlation,loudness_lufs:loudness.input_i,true_peak:loudness.input_tp,black_reports:black,freeze_reports:freeze,automated_validation_passed:result.automated_validation_passed,visual_review_samples:samples.map(x=>({path:x.path,text:x.text})),preview_path:preview}));
if(!result.automated_validation_passed)process.exitCode=2;
