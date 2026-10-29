// Read-only recheck of existing setup. No dependency resolution or downloads.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base = path.join(root, '.runtime', 'openmontage-pilot');
const bin = path.join(base, 'ffmpeg', 'ffmpeg-9.0.2-essentials_build', 'bin');
const env = { SystemRoot: 'C:\\Windows', PATH: 'C:\\Windows\\System32', TEMP: path.join(base, 'tmp'), TMP: path.join(base, 'tmp'), HOME: path.join(base, 'home'), USERPROFILE: path.join(base, 'home'), APPDATA: path.join(base, 'home', 'AppData', 'Roaming'), LOCALAPPDATA: path.join(base, 'home', 'AppData', 'Local'), PYTHONUTF8: '1' };
const stamp = new Date().toISOString(), commands = [];
function run(executable, args) {
  const r = spawnSync(executable, args, { env, shell: false, windowsHide: true, encoding: 'utf8', timeout: 30000, maxBuffer: 1048576 });
  commands.push({ executable, args, exit_code: r.status, error_code: r.error?.code ?? null });
  if (r.status !== 0 || r.error) throw new Error('READ_ONLY_CHECK_FAILED');
  return r.stdout;
}
const hashes = [
  ['downloads/ffmpeg-9.0.2-essentials_build.zip', '60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba'],
  ['voices/en_US-ljspeech-medium.onnx', '6f52a751e2349abe7a76735eb09dc1875298c77ea2342ffd2fef79ff81b87f22'],
].map(([file, expected]) => {
  const actual = createHash('sha256').update(fs.readFileSync(path.join(base, file))).digest('hex');
  if (actual !== expected) throw new Error('CACHED_ARTIFACT_CHANGED');
  return { file, sha256: actual, matched: true };
});
const version = run(path.join(bin, 'ffmpeg.exe'), ['-version']).split('\n')[0].trim();
const probe = JSON.parse(run(path.join(bin, 'ffprobe.exe'), ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,codec_type,width,height', '-of', 'json', path.join(base, 'smoke', 'encoding-smoke.mp4')]));
run(path.join(bin, 'ffmpeg.exe'), ['-hide_banner', '-v', 'error', '-nostdin', '-i', path.join(base, 'smoke', 'encoding-smoke.mp4'), '-f', 'null', '-']);
const code = "import json,importlib.metadata as m; names=['PyYAML','pydantic','jsonschema','python-dotenv','Pillow','numpy','requests','google-auth','google-genai','openai','fastapi','uvicorn','watchfiles','websockets','piper-tts','onnxruntime']; installed={d.metadata['Name'].lower():d.version for d in m.distributions()}; print(json.dumps({n:installed.get(n.lower()) for n in names}))";
const packages = JSON.parse(run(path.join(base, 'venv', 'Scripts', 'python.exe'), ['-I', '-c', code]));
const result = {
  verified_at_utc: stamp, scope: 'Read-only local continuation check; no install/network/credential access',
  setup_approval: 'B-PILOT-SETUP-01 explicitly approved, partial execution', resolver_correction_approval: 'NOT RECORDED',
  setup_deadline_utc: '2026-10-29T22:17:56Z', ffmpeg_version: version, cached_hashes: hashes, probe,
  full_decode_exit_code: 0, packages, piper_executable_present: fs.existsSync(path.join(base, 'venv', 'Scripts', 'piper.exe')),
  dependency_lock_present: fs.existsSync(path.join(base, 'requirements.lock')), piper_test: 'NOT RUN',
  horror_video_present: fs.existsSync(path.join(root, 'brands', 'horror', 'projects', 'horror-3am-call-001', 'renders', 'final.mp4')), commands,
};
const receipt = path.join(base, 'logs', 'continuation-' + stamp.replaceAll(':', '-') + '.json');
fs.writeFileSync(receipt, JSON.stringify(result, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ ...result, receipt }, null, 2));
