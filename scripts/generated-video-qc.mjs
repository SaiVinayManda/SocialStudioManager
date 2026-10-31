import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {localGrant} from './studio-test-client.mjs';import {runProcess,fileHash} from '../services/production-adapter/media.mjs';
const root=localGrant(),run=JSON.parse(fs.readFileSync(path.join(root,'.runtime/orchestrator/generated-video-session.json'),'utf8'));
const job=path.join(root,'generated-videos/horror/door-5s-'+run.id),target=path.join(job,'final/the_door_that_opened_itself.mp4'),bin=path.join(root,'.runtime/openmontage-pilot/ffmpeg/ffmpeg-9.0.2-essentials_build/bin');
const result=await runProcess(path.join(bin,'ffmpeg.exe'),['-nostdin','-v','info','-threads','2','-i',target,'-vf','blackdetect=d=0.1:pix_th=0.10,freezedetect=n=-50dB:d=0.5','-af','volumedetect','-f','null','-'],{workspace:root,timeoutMs:30000});
const max=Number(result.stderr.match(/max_volume:\s*(-?[\d.]+) dB/)?.[1]),mean=Number(result.stderr.match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1]);
const checks={full_decode:result.exit_code===0,no_black_intervals:!result.stderr.includes('black_start:'),no_frozen_intervals:!result.stderr.includes('freeze_start:'),audio_peak_headroom:max<=-1,audio_non_silent:mean>-45};
const report={at:new Date().toISOString(),scope:'Actual complete video/audio decode; black/freeze detectors and volume measurement. Does not replace human playback review.',output:target,checksum:await fileHash(target),peak_dbfs:max,mean_dbfs:mean,checks,passed:Object.values(checks).every(Boolean)};
fs.writeFileSync(path.join(job,'logs/full-quality.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(job,'logs/full-quality.stderr'),result.stderr);
console.log(JSON.stringify(report));assert(report.passed,'Full media quality checks failed');
