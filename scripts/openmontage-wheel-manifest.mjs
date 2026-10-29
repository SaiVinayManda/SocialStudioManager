// Read-only public package metadata, after the approved binary-only resolver.
// No installation, credential lookup, arbitrary index or package-code import.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runtime = path.join(root, '.runtime', 'openmontage-pilot');
const session = JSON.parse(fs.readFileSync(path.join(runtime, 'session.json'), 'utf8'));
const assert = (x, code) => { if (!x) throw new Error(code); };
assert(Date.now() < Date.parse(session.deadline_utc), 'SETUP_TIME_LIMIT');
assert(!fs.existsSync(path.join(runtime, 'wheel-manifest.json')), 'MANIFEST_EXISTS');
const lock = fs.readFileSync(path.join(runtime, 'requirements.lock'), 'utf8');
const pins = [];
for (const block of lock.replace(/\\\r?\n\s*/g, ' ').split(/\r?\n/)) {
  const line = block.trim(); if (!line || line.startsWith('#')) continue;
  const match = /^([A-Za-z0-9_.-]+)==([^\s;]+)\s+(.*)$/.exec(line);
  assert(match && !line.includes(';'), 'UNEXPECTED_LOCK_SYNTAX');
  const hashes = [...match[3].matchAll(/--hash=sha256:([a-f0-9]{64})/g)].map(m => m[1]);
  assert(hashes.length > 0, 'UNHASHED_LOCK_PIN'); pins.push({ name: match[1], version: match[2], hashes });
}
assert(pins.length > 0 && pins.length <= 100 && new Set(pins.map(p => p.name.toLowerCase())).size === pins.length, 'WHEEL_COUNT');
function rank(filename) {
  if (!filename.endsWith('.whl')) return null;
  const fields = filename.slice(0, -4).split('-'); if (fields.length < 5) return null;
  const [python, abi, platform] = fields.slice(-3);
  if (!['win_amd64', 'any'].includes(platform)) return null;
  if (python.split('.').includes('cp311') && ['cp311', 'abi3', 'none'].includes(abi)) return 0;
  if (abi === 'abi3' && python.split('.').some(t => /^cp3\d+$/.test(t) && Number(t.slice(2)) <= 311)) return 1;
  if (abi === 'none' && python.split('.').some(t => ['py3', 'py311'].includes(t))) return 2;
  return null;
}
const artifacts = []; let metadataBytes = 0;
for (const pin of pins) {
  assert(Date.now() < Date.parse(session.deadline_utc), 'SETUP_TIME_LIMIT');
  const url = 'https://pypi.org/pypi/' + encodeURIComponent(pin.name) + '/' + encodeURIComponent(pin.version) + '/json';
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(Math.min(30000, Date.parse(session.deadline_utc) - Date.now())) });
  assert(response.status === 200, 'PYPI_METADATA_HTTP_' + response.status);
  const chunks = []; let bytes = 0;
  for await (const chunk of response.body) { bytes += chunk.length; metadataBytes += chunk.length; assert(bytes <= 2 * 1048576 && metadataBytes <= 32 * 1048576, 'METADATA_LIMIT'); chunks.push(Buffer.from(chunk)); }
  const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  const candidates = data.urls.map(f => ({ ...f, rank: rank(f.filename) })).filter(f => f.rank !== null && !f.yanked && pin.hashes.includes(f.digests?.sha256)).sort((a, b) => a.rank - b.rank || a.filename.localeCompare(b.filename));
  assert(candidates.length > 0, 'NO_APPROVED_WINDOWS_WHEEL_' + pin.name);
  const f = candidates[0], fileUrl = new URL(f.url);
  assert(fileUrl.protocol === 'https:' && fileUrl.hostname === 'files.pythonhosted.org' && !fileUrl.username && !fileUrl.password && Number.isSafeInteger(f.size) && f.size > 0, 'WHEEL_SOURCE_OR_SIZE');
  if (pin.name.toLowerCase().replaceAll('_', '-') === 'piper-tts') assert(pin.version === '1.8.0' && f.digests.sha256 === '5da9bfdb05dfe15da3536859d422e605483ffa6d2b3ec2c5b9593bae6b5aa6a4', 'PIPER_APPROVED_VERSION_HASH');
  artifacts.push({ name: pin.name, version: pin.version, filename: f.filename, url: f.url, sha256: f.digests.sha256, size_bytes: f.size });
}
const ledger = fs.readFileSync(path.join(runtime, 'download-ledger.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const already = ledger.reduce((n, r) => n + (r.received_bytes ?? 0), 0);
const wheels = artifacts.reduce((n, a) => n + a.size_bytes, 0);
// Reserve for resolver and pip metadata; account for our measured metadata too.
assert(already + wheels + metadataBytes + 128 * 1048576 <= session.max_download_bytes, 'SETUP_DOWNLOAD_LIMIT');
const manifest = { state: 'metadata_verified_before_download', generated_utc: new Date().toISOString(), metadata_bytes: metadataBytes, wheel_bytes: wheels, previous_payload_bytes: already, metadata_reserve_bytes: 128 * 1048576, artifacts };
fs.writeFileSync(path.join(runtime, 'wheel-manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ wheels: artifacts.length, wheel_bytes: wheels, metadata_bytes: metadataBytes, total_including_reserve_bytes: already + wheels + metadataBytes + 128 * 1048576 }));
