// Running --plan does not read credential files. The inspect branch requires a
// separate explicit owner approval; its flag is not evidence of such approval.
import fs from 'node:fs';
import path from 'node:path';
import { jsonAuthMetadata, envAuthMetadata } from '../src/supervisor/auth-metadata.mjs';
import { existingLocalDirectory } from '../src/supervisor/authority-store.mjs';

const expiry = '2026-10-31T00:00:00Z';
const targets = [
  ['codex', 'C:\\Users\\Vinay\\.codex\\auth.json', jsonAuthMetadata],
  ['hermes', 'C:\\Users\\Vinay\\AppData\\Local\\hermes\\auth.json', jsonAuthMetadata],
  ['hermes_environment', 'C:\\Users\\Vinay\\AppData\\Local\\hermes\\.env', envAuthMetadata],
];
const args = process.argv.slice(2);
const plan = { approval_id: 'A-AUTH-METADATA-01', approval_state: 'PENDING_OWNER_APPROVAL', targets: targets.map(([label, file]) => ({ label, file })), max_file_bytes: 1048576, max_session_minutes: 15, expiry_utc: expiry, network_requests: 0, cost_usd: 0, effects: 'Read only; no token values, authentication use, JWT decoding, config changes or external requests.' };
if (args.length === 0 || (args.length === 1 && args[0] === '--plan')) {
  console.log(JSON.stringify(plan, null, 2));
} else if (args.length === 1 && args[0] === '--inspect-approved=A-AUTH-METADATA-01') {
  if (Date.now() >= Date.parse(expiry)) { console.error('APPROVAL_PACKET_EXPIRED'); process.exitCode = 1; }
  else {
    const started = Date.now(), results = [];
    for (const [label, file, parse] of targets) {
      let fd;
      try {
        if (Date.now() - started > 900000) throw new Error('BOUND');
        existingLocalDirectory(path.dirname(file));
        const before = fs.lstatSync(file);
        if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size > 1048576) throw new Error('BOUND');
        fd = fs.openSync(file, 'r'); const st = fs.fstatSync(fd);
        if (st.ino !== before.ino || st.dev !== before.dev || st.size > 1048576 || st.nlink !== 1) throw new Error('BOUND');
        const bytes = Buffer.alloc(st.size + 1), count = fs.readSync(fd, bytes, 0, bytes.length, 0);
        if (count !== st.size || fs.fstatSync(fd).size !== st.size) throw new Error('BOUND');
        results.push({ label, presence: 'present', metadata: parse(bytes.subarray(0, count).toString('utf8')) });
        bytes.fill(0);
      } catch (error) {
        results.push({ label, presence: error.code === 'ENOENT' ? 'absent' : 'read_denied_or_unsafe' });
      } finally { if (fd !== undefined) fs.closeSync(fd); }
    }
    console.log(JSON.stringify({ approval_id: plan.approval_id, results, network_requests: 0, authentication_used: false, telegram_identity_verified: false }, null, 2));
  }
} else { console.error('INVALID_ARGUMENTS'); process.exitCode = 1; }
