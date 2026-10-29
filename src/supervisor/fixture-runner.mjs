import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { requireThat, redact } from './contracts.mjs';

const worker = fileURLToPath(new URL('./fixtures/worker.mjs', import.meta.url));
const modes = new Set(['write-ok', 'fail', 'hang', 'bad-output', 'fake-pass', 'oversized-output', 'probe-fs', 'secret-chunks']);

export class FixtureProcessRunner {
  kind = 'fixed-fixture-process';
  constructor() { this.launches = 0; }
  start({ workspace, profile, limits }) {
    requireThat(modes.has(profile.mode), 'FIXTURE_MODE_NOT_REGISTERED'); this.launches++;
    const env = { SystemRoot: process.env.SystemRoot ?? 'C:\\Windows', TEMP: workspace, TMP: workspace, NODE_NO_WARNINGS: '1' };
    const child = spawn(process.execPath, [
      '--experimental-permission', '--allow-fs-read=' + worker, '--allow-fs-write=' + workspace,
      worker, profile.mode, workspace,
    ], { cwd: workspace, shell: false, windowsHide: true, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let outputBytes = 0, outputLimit = false, closed = false, launchError = false;
    const output = [];
    for (const stream of [child.stdout, child.stderr]) stream.on('data', buffer => {
      outputBytes += buffer.length;
      if (outputBytes > limits.max_output_bytes) { outputLimit = true; child.kill(); }
      else output.push(buffer);
    });
    child.on('error', () => { launchError = true; });
    const completion = new Promise(resolve => child.on('close', (code, signal) => {
      closed = true;
      resolve({ exit_code: code ?? -1, signal, output_limit: outputLimit, termination_verified: true, launch_error: launchError, redacted_output: redact(Buffer.concat(output).toString('utf8')), output_bytes: outputBytes });
    }));
    let stopping;
    return {
      pid: child.pid, completion,
      cancel() {
        if (stopping) return stopping;
        stopping = (async () => {
          if (!closed) child.kill();
          let timer;
          try {
            return await Promise.race([
              completion,
              new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Fixture termination unconfirmed')), 5000); }),
            ]);
          } finally { clearTimeout(timer); }
        })();
        return stopping;
      },
    };
  }
}
