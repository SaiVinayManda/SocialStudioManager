import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runtime = path.join(root, '.runtime', 'openmontage-pilot');
const session = JSON.parse(fs.readFileSync(path.join(runtime, 'session.json'), 'utf8'));
if (Date.now() >= Date.parse(session.deadline_utc)) throw new Error('SETUP_TIME_LIMIT');
const directory = path.join(runtime, 'smoke'); fs.mkdirSync(directory);
const bin = path.join(runtime, 'ffmpeg', 'ffmpeg-9.0.2-essentials_build', 'bin');
const env = { SystemRoot: 'C:\\Windows', PATH: 'C:\\Windows\\System32', TEMP: path.join(runtime, 'tmp'), TMP: path.join(runtime, 'tmp'), HOME: path.join(runtime, 'home'), USERPROFILE: path.join(runtime, 'home') };
const commands = [];
function run(name, executable, args) {
  const start = performance.now(), began = new Date().toISOString();
  const r = spawnSync(path.join(bin, executable), args, { cwd: directory, env, shell: false, windowsHide: true, encoding: 'utf8', timeout: Math.min(60000, Date.parse(session.deadline_utc) - Date.now()), maxBuffer: 4 * 1048576 });
  fs.writeFileSync(path.join(directory, name + '.stdout'), r.stdout ?? '', { flag: 'wx' });
  fs.writeFileSync(path.join(directory, name + '.stderr'), r.stderr ?? '', { flag: 'wx' });
  commands.push({ name, executable: path.join(bin, executable), args, started_utc: began, finished_utc: new Date().toISOString(), duration_ms: performance.now() - start, exit_code: r.status, error_code: r.error?.code ?? null });
  fs.writeFileSync(path.join(directory, 'commands.json'), JSON.stringify(commands, null, 2));
  if (r.status !== 0 || r.error) throw new Error('SMOKE_STEP_FAILED_' + name);
  return r;
}
run('version', 'ffmpeg.exe', ['-version']);
run('probe-version', 'ffprobe.exe', ['-version']);
fs.writeFileSync(path.join(directory, 'captions.srt'), '1\n00:00:00,000 --> 00:00:02,000\nSocial Studio encoding test\n', { flag: 'wx' });
run('encode', 'ffmpeg.exe', ['-hide_banner', '-nostdin', '-n', '-benchmark', '-filter_threads', '1', '-f', 'lavfi', '-i', 'testsrc2=size=1080x1920:rate=30', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '2', '-vf', "subtitles=captions.srt:force_style='Fontname=Arial,Fontsize=16,Outline=2,MarginV=80'", '-c:v', 'libx264', '-preset', 'veryfast', '-threads', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', 'encoding-smoke.mp4']);
const probe = JSON.parse(run('probe', 'ffprobe.exe', ['-v', 'error', '-show_entries', 'format=duration,format_name:stream=codec_name,codec_type,width,height,sample_rate,channels,r_frame_rate', '-of', 'json', 'encoding-smoke.mp4']).stdout);
const video = probe.streams.find(s => s.codec_type === 'video'), audio = probe.streams.find(s => s.codec_type === 'audio');
if (video?.width !== 1080 || video?.height !== 1920 || video.codec_name !== 'h264' || audio?.codec_name !== 'aac' || Math.abs(Number(probe.format.duration) - 2) > 0.1) throw new Error('PROBE_VALIDATION_FAILED');
run('full-decode', 'ffmpeg.exe', ['-hide_banner', '-v', 'error', '-nostdin', '-i', 'encoding-smoke.mp4', '-f', 'null', '-']);
run('preview-frame', 'ffmpeg.exe', ['-hide_banner', '-v', 'error', '-nostdin', '-n', '-ss', '0.7', '-i', 'encoding-smoke.mp4', '-frames:v', '1', '-threads', '1', 'encoding-preview.png']);
const result = { test: 'real_ffmpeg_encoding_and_probe', passed: true, version: '9.0.2', output_path: path.join(directory, 'encoding-smoke.mp4'), bytes: fs.statSync(path.join(directory, 'encoding-smoke.mp4')).size, video, audio, duration_seconds: Number(probe.format.duration), encoding_duration_ms: commands.find(c => c.name === 'encode').duration_ms, full_decode_exit_code: 0, captions: 'SRT burned by libass; preview frame retained', synthetic_test_pattern: true, horror_video: false, api_calls: 0 };
fs.writeFileSync(path.join(directory, 'ffmpeg-result.json'), JSON.stringify(result, null, 2), { flag: 'wx' });
console.log(JSON.stringify(result, null, 2));
