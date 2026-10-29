// Prepared local voice smoke test; execute only after approved dependencies install.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runtime = path.join(root, '.runtime', 'openmontage-pilot');
const session = JSON.parse(fs.readFileSync(path.join(runtime, 'session.json'), 'utf8'));
if (Date.now() >= Date.parse(session.deadline_utc)) throw new Error('SETUP_TIME_LIMIT');
const executable = path.join(runtime, 'venv', 'Scripts', 'piper.exe');
if (!fs.existsSync(executable)) throw new Error('PIPER_NOT_INSTALLED');
const output = path.join(runtime, 'smoke', 'piper-narration.wav');
if (fs.existsSync(output)) throw new Error('PIPER_OUTPUT_EXISTS');
const args = ['--model', path.join(runtime, 'voices', 'en_US-ljspeech-medium.onnx'), '--speaker', '0', '--length-scale', '1.05', '--sentence-silence', '0.25', '--output_file', output];
const env = { SystemRoot: 'C:\\Windows', PATH: path.join(runtime, 'venv', 'Scripts') + ';C:\\Windows\\System32', TEMP: path.join(runtime, 'tmp'), TMP: path.join(runtime, 'tmp'), HOME: path.join(runtime, 'home'), USERPROFILE: path.join(runtime, 'home'), APPDATA: path.join(runtime, 'home', 'AppData', 'Roaming'), LOCALAPPDATA: path.join(runtime, 'home', 'AppData', 'Local'), PYTHONUTF8: '1' };
const text = 'At three AM, my phone rang. The caller ID showed my own number.\n';
const started = new Date().toISOString(), began = performance.now();
const r = spawnSync(executable, args, { input: text, env, cwd: path.join(runtime, 'smoke'), shell: false, windowsHide: true, encoding: 'utf8', timeout: Math.min(120000, Date.parse(session.deadline_utc) - Date.now()), maxBuffer: 1048576 });
fs.writeFileSync(path.join(runtime, 'smoke', 'piper.stdout'), r.stdout ?? '', { flag: 'wx' });
fs.writeFileSync(path.join(runtime, 'smoke', 'piper.stderr'), r.stderr ?? '', { flag: 'wx' });
const result = { test: 'real_piper_narration', passed: false, started_utc: started, finished_utc: new Date().toISOString(), elapsed_ms: performance.now() - began, executable, args, text, exit_code: r.status, error_code: r.error?.code ?? null, api_calls: 0, output_path: output };
if (r.status === 0 && fs.existsSync(output)) {
  const wav = fs.readFileSync(output);
  if (wav.toString('ascii', 0, 4) === 'RIFF' && wav.toString('ascii', 8, 12) === 'WAVE') {
    let sampleRate, bits, channels, data;
    for (let at = 12; at + 8 <= wav.length;) {
      const kind = wav.toString('ascii', at, at + 4), size = wav.readUInt32LE(at + 4);
      if (at + 8 + size > wav.length) break;
      if (kind === 'fmt ' && size >= 16) { channels = wav.readUInt16LE(at + 10); sampleRate = wav.readUInt32LE(at + 12); bits = wav.readUInt16LE(at + 22); }
      if (kind === 'data') data = wav.subarray(at + 8, at + 8 + size);
      at += 8 + size + (size % 2);
    }
    if (data && bits === 16 && channels === 1 && sampleRate === 22050) {
      let squares = 0; for (let at = 0; at + 2 <= data.length; at += 2) squares += (data.readInt16LE(at) / 32768) ** 2;
      Object.assign(result, { sample_rate: sampleRate, channels, bits_per_sample: bits, duration_seconds: data.length / (sampleRate * channels * bits / 8), rms_dbfs: 20 * Math.log10(Math.sqrt(squares / (data.length / 2))), bytes: wav.length });
      result.passed = result.duration_seconds > 1 && result.duration_seconds < 30 && result.rms_dbfs > -55;
    }
  }
}
fs.writeFileSync(path.join(runtime, 'smoke', 'piper-result.json'), JSON.stringify(result, null, 2), { flag: 'wx' });
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
