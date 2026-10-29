// Repeatable local checks with no dependency restore, credentials or network calls.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const run = path.join(root, '.runtime', 'checks', randomUUID());
const temp = path.join(run, 'temp'); fs.mkdirSync(temp, { recursive: true });
const env = { SystemRoot: 'C:\\Windows', PATH: 'C:\\Windows\\System32;' + path.dirname(process.execPath), TEMP: temp, TMP: temp };
const checks = [
  ['tests', ['--test', '--test-concurrency=1', 'test/supervisor.test.mjs']],
  ['demo', ['src/supervisor/cli.mjs', 'demo']],
  ['status', ['src/supervisor/cli.mjs', 'status']],
];
const receipts = [];
for (const [name, args] of checks) {
  const started = new Date().toISOString();
  const result = spawnSync(process.execPath, args, { cwd: root, env, shell: false, windowsHide: true, encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
  fs.writeFileSync(path.join(run, name + '.stdout'), result.stdout ?? '');
  fs.writeFileSync(path.join(run, name + '.stderr'), result.stderr ?? '');
  const receipt = { name, executable: process.execPath, args, cwd: root, started_utc: started, finished_utc: new Date().toISOString(), exit_code: result.status, signal: result.signal, error_code: result.error?.code ?? null, environment: 'SystemRoot, fixed PATH and workspace TEMP/TMP only', stdout_file: name + '.stdout', stderr_file: name + '.stderr' };
  receipts.push(receipt);
  fs.writeFileSync(path.join(run, 'receipts.json'), JSON.stringify(receipts, null, 2) + '\n');
  if (result.status !== 0 || result.error) {
    console.error(result.stdout, result.stderr); console.error('Check failed; retained evidence: ' + run); process.exitCode = 1; break;
  }
  if (name === 'tests') console.log(result.stdout.split('\n').slice(-11).join('\n'));
  else if (name === 'demo') {
    const demo = JSON.parse(result.stdout);
    console.log(JSON.stringify({ simulation: demo.simulation, job_id: demo.job.id, state: demo.job.state, exit_code: demo.job.facts.exit_code, duration_ms: demo.job.facts.duration_ms, real_telegram_requests: demo.real_telegram_requests, real_codex_requests: demo.real_codex_requests }));
  }
}
console.log('Check evidence: ' + run);
