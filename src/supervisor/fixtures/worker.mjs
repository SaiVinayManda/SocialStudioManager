// Fixed local test fixture. Never used as a Codex or media-generation substitute.
import fs from 'node:fs';
import path from 'node:path';

const [mode, workspace] = process.argv.slice(2);
if (mode === 'hang') setInterval(() => {}, 1000);
else if (mode === 'fail') process.exitCode = 9;
else if (mode === 'oversized-output') process.stdout.write('x'.repeat(100000));
else if (mode === 'probe-fs') {
  let observed = 'UNEXPECTED_READ';
  try { fs.readFileSync(path.resolve(workspace, '../../sentinel.txt')); }
  catch (error) { observed = error.code; }
  fs.writeFileSync(path.join(workspace, 'canary.txt'), observed + '\n');
} else if (mode === 'bad-output') fs.writeFileSync(path.join(workspace, 'unexpected.txt'), 'wrong path\n');
else if (mode === 'fake-pass') {
  fs.writeFileSync(path.join(workspace, 'canary.txt'), 'incorrect content\n');
  console.log(JSON.stringify({ tests_passed: true, success: true }));
} else if (mode === 'secret-chunks') {
  fs.writeFileSync(path.join(workspace, 'canary.txt'), 'Social Studio local canary OK\n');
  process.stdout.write('api_key=');
  setTimeout(() => process.stdout.write('synthetic-secret-value\n'), 10);
} else if (mode === 'write-ok') {
  fs.writeFileSync(path.join(workspace, 'canary.txt'), 'Social Studio local canary OK\n');
  console.log(JSON.stringify({ fixture: true, artifact: 'canary.txt' }));
} else process.exitCode = 12;
