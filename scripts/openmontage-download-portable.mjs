import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runtime = path.join(root, '.runtime', 'openmontage-pilot');
const session = JSON.parse(fs.readFileSync(path.join(runtime, 'session.json'), 'utf8'));
const ledger = path.join(runtime, 'download-ledger.jsonl');
const prior = fs.existsSync(ledger) ? fs.readFileSync(ledger, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
let transferred = prior.reduce((sum, row) => sum + (row.received_bytes ?? 0), 0);
const assert = (x, code) => { if (!x) throw new Error(code); };
const allowed = host => ['www.gyan.dev', 'huggingface.co', 'us.aws.cdn.hf.co'].includes(host) || host.endsWith('.xethub.hf.co') || /^cdn-lfs[^.]*\.hf\.co$/.test(host) || host.endsWith('.huggingface.co');
function storage(directory) { let bytes = 0; for (const e of fs.readdirSync(directory, { withFileTypes: true })) { const full = path.join(directory, e.name); const st = fs.lstatSync(full); assert(!st.isSymbolicLink(), 'STORAGE_LINK'); bytes += e.isDirectory() ? storage(full) : st.size; } return bytes; }
const voicePrefix = 'https://huggingface.co/rhasspy/piper-voices/resolve/bae641dcb5a608cff81ccaf7ff018baaca1a33e1/en/en_US/ljspeech/medium/';
const artifacts = [
  { name: 'ffmpeg-9.0.2-essentials_build.zip', directory: 'downloads', url: 'https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-9.0.2-essentials_build.zip', sha256: '60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba', max_bytes: 240 * 1048576 },
  { name: 'en_US-ljspeech-medium.onnx', directory: 'voices', url: voicePrefix + 'en_US-ljspeech-medium.onnx', sha256: '6f52a751e2349abe7a76735eb09dc1875298c77ea2342ffd2fef79ff81b87f22', size: 63531379, max_bytes: 63531379 },
  { name: 'en_US-ljspeech-medium.onnx.json', directory: 'voices', url: voicePrefix + 'en_US-ljspeech-medium.onnx.json', md5: '0668112b8b3ac5bb4b12c2b1a366776a', size: 4972, max_bytes: 4972 },
  { name: 'MODEL_CARD', directory: 'voices', url: voicePrefix + 'MODEL_CARD', md5: '5ad31d314786587d4f97effb0b716d61', size: 517, max_bytes: 517 },
];
for (const a of artifacts) {
  const destination = path.join(runtime, a.directory, a.name), partial = destination + '.part';
  if (fs.existsSync(destination)) {
    const verified = prior.find(row => row.name === a.name && row.status === 'verified');
    assert(verified && fs.lstatSync(destination).isFile() && !fs.lstatSync(destination).isSymbolicLink() && !fs.existsSync(partial), 'UNEXPECTED_EXISTING_DOWNLOAD');
    assert(createHash('sha256').update(fs.readFileSync(destination)).digest('hex') === verified.observed_sha256, 'EXISTING_DOWNLOAD_CHANGED');
    console.log(JSON.stringify({ name: a.name, status: 'already_verified_no_redownload' })); continue;
  }
  assert(!fs.existsSync(destination) && !fs.existsSync(partial), 'DOWNLOAD_DESTINATION_EXISTS');
  const remaining = Date.parse(session.deadline_utc) - Date.now(); assert(remaining > 0, 'SETUP_TIME_LIMIT');
  let url = new URL(a.url), response;
  const started = new Date().toISOString(); let received = 0, fd;
  try {
    for (let redirects = 0; redirects <= 5; redirects++) {
      assert(url.protocol === 'https:' && allowed(url.hostname) && !url.username && !url.password, 'UNAPPROVED_DOWNLOAD_SOURCE');
      response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(Math.min(180000, remaining)), headers: { 'User-Agent': 'SocialStudio-ApprovedSetup/1.0' } });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const next = response.headers.get('location'); assert(next, 'REDIRECT_WITHOUT_LOCATION');
        await response.body?.cancel(); url = new URL(next, url); continue;
      }
      break;
    }
    assert(response?.status === 200, 'DOWNLOAD_HTTP_' + response?.status);
    const declared = Number(response.headers.get('content-length') ?? a.size);
    assert(Number.isSafeInteger(declared) && declared > 0 && declared <= a.max_bytes, 'DOWNLOAD_DECLARED_SIZE');
    if (a.size) assert(declared === a.size, 'DOWNLOAD_DECLARED_SIZE_MISMATCH');
    // Leave 128 MiB of the original cap for resolver metadata/other setup traffic.
    assert(transferred + declared <= session.max_download_bytes - 128 * 1048576, 'DOWNLOAD_BUDGET');
    assert(storage(runtime) + storage(path.join(root, 'openmontage')) + declared <= session.max_storage_bytes, 'STORAGE_LIMIT');
    fd = fs.openSync(partial, 'wx'); const sha = createHash('sha256'), md5 = createHash('md5');
    for await (const chunk of response.body) {
      received += chunk.length;
      assert(Date.now() < Date.parse(session.deadline_utc), 'SETUP_TIME_LIMIT');
      assert(received <= declared && transferred + received <= session.max_download_bytes - 128 * 1048576, 'TRANSFER_LIMIT');
      fs.writeSync(fd, chunk); sha.update(chunk); md5.update(chunk);
    }
    fs.fsyncSync(fd); fs.closeSync(fd); fd = undefined;
    const hash = sha.digest('hex'), md5Hash = md5.digest('hex');
    assert(received === declared && (!a.size || received === a.size), 'DOWNLOAD_SIZE_MISMATCH');
    assert(!a.sha256 || hash === a.sha256, 'DOWNLOAD_SHA256_MISMATCH');
    assert(!a.md5 || md5Hash === a.md5, 'PINNED_CONFIG_CARD_CONTENT_MISMATCH');
    fs.renameSync(partial, destination); transferred += received;
    const record = { name: a.name, source_url: a.url, final_host: url.hostname, expected_sha256: a.sha256 ?? null, observed_sha256: hash, expected_bytes: a.size ?? declared, received_bytes: received, started_utc: started, finished_utc: new Date().toISOString(), status: 'verified' };
    fs.appendFileSync(ledger, JSON.stringify(record) + '\n'); console.log(JSON.stringify({ name: a.name, bytes: received, sha256: hash, status: 'verified' }));
  } catch (error) {
    if (fd !== undefined) fs.closeSync(fd);
    fs.appendFileSync(ledger, JSON.stringify({ name: a.name, source_url: a.url, received_bytes: received, started_utc: started, finished_utc: new Date().toISOString(), status: 'failed', code: /^[A-Z0-9_]+$/.test(error.message) ? error.message : 'NETWORK_OR_STORAGE_ERROR' }) + '\n');
    console.error('Portable setup stopped: ' + (/^[A-Z0-9_]+$/.test(error.message) ? error.message : 'NETWORK_OR_STORAGE_ERROR')); process.exitCode = 1; break;
  }
}
