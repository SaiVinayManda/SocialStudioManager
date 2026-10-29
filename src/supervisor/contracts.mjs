import { createHash, timingSafeEqual, createHmac } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

export class Denied extends Error {
  constructor(code) { super(code); this.name = 'Denied'; this.code = code; }
}
export function requireThat(condition, code) { if (!condition) throw new Denied(code); }
export function exact(value, keys, code = 'INVALID_FIELDS') {
  requireThat(value !== null && typeof value === 'object' && !Array.isArray(value), code);
  requireThat(Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k)), code);
}
export function text(value, max = 1000) {
  requireThat(typeof value === 'string' && value.length > 0 && value.length <= max && !value.includes('\0'), 'INVALID_TEXT');
  return value;
}
export function id(value) { requireThat(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value), 'INVALID_ID'); return value; }
export function integer(value, min, max) { requireThat(Number.isSafeInteger(value) && value >= min && value <= max, 'INVALID_INTEGER'); return value; }
export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    requireThat(!keys.some(k => ['__proto__', 'constructor', 'prototype'].includes(k)), 'UNSAFE_KEY');
    return '{' + keys.map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  }
  requireThat(value !== undefined && (typeof value !== 'number' || Number.isFinite(value)), 'INVALID_JSON');
  return JSON.stringify(value);
}
export const digest = value => createHash('sha256').update(canonical(value)).digest('hex');
export const clone = value => JSON.parse(canonical(value));
export function freeze(value) {
  if (value && typeof value === 'object') { for (const v of Object.values(value)) freeze(v); Object.freeze(value); }
  return value;
}
export function safeRelative(value) {
  text(value, 180);
  requireThat(!value.includes('\\') && !value.includes(':') && !path.posix.isAbsolute(value), 'UNSAFE_PATH');
  const parts = value.split('/');
  requireThat(parts.every(p => /^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(p) && !p.endsWith('.') && !p.endsWith(' ')), 'UNSAFE_PATH');
  requireThat(!parts.some(p => /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(p)), 'UNSAFE_PATH');
  requireThat(!parts.some(p => ['.git', '.codex', '.agents', 'node_modules'].includes(p.toLowerCase())), 'PROTECTED_PATH');
  return value;
}
export function validateTask(t) {
  exact(t, ['id', 'revision', 'project_id', 'baseline_sha', 'objective', 'allowed_paths', 'acceptance_criteria', 'test_profile_id', 'runner_profile_id', 'limits']);
  id(t.id); integer(t.revision, 1, 100000); id(t.project_id);
  requireThat(/^[a-f0-9]{40,64}$/.test(t.baseline_sha), 'INVALID_BASELINE');
  text(t.objective, 4000); text(t.acceptance_criteria, 4000);
  requireThat(Array.isArray(t.allowed_paths) && t.allowed_paths.length > 0 && t.allowed_paths.length <= 20, 'INVALID_PATHS');
  t.allowed_paths.forEach(safeRelative);
  requireThat(new Set(t.allowed_paths.map(p => p.toLowerCase())).size === t.allowed_paths.length, 'DUPLICATE_PATH');
  id(t.test_profile_id); id(t.runner_profile_id);
  exact(t.limits, ['max_duration_ms', 'max_output_bytes', 'max_attempts', 'max_cost_usd']);
  integer(t.limits.max_duration_ms, 100, 1200000); integer(t.limits.max_output_bytes, 128, 1048576);
  integer(t.limits.max_attempts, 1, 1);
  requireThat(t.limits.max_cost_usd === 0, 'PAID_RUN_DISABLED');
  return t;
}
export function validatePolicy(p) {
  exact(p, ['version', 'telegram', 'max_journal_bytes', 'max_jobs']);
  requireThat(p.version === 1, 'POLICY_VERSION');
  exact(p.telegram, ['owner_user_id', 'private_chat_id', 'max_age_seconds']);
  for (const k of ['owner_user_id', 'private_chat_id']) requireThat(p.telegram[k] === null || /^[1-9][0-9]{0,15}$/.test(p.telegram[k]), 'INVALID_ENROLLMENT');
  integer(p.telegram.max_age_seconds, 1, 300); integer(p.max_journal_bytes, 4096, 16777216); integer(p.max_jobs, 1, 1000);
  return p;
}
export function redact(value) {
  return String(value).replace(/\b\d{6,}:[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_BOT_TOKEN]')
    .replace(/\b(?:sk-|ghp_|github_pat_)[A-Za-z0-9_-]{8,}/g, '[REDACTED_KEY]')
    .replace(/\b(Bearer\s+)\S+/gi, '$1[REDACTED]')
    .replace(/((?:api[_-]?key|access[_-]?token|refresh[_-]?token|password|secret)\s*[=:]\s*)[^\s,;]+/gi, '$1[REDACTED]');
}

export function checkedDirectory(directory) {
  const absolute = path.resolve(directory);
  if (process.platform === 'win32') requireThat(/^[A-Za-z]:\\/.test(absolute) && !absolute.slice(3).includes(':'), 'UNSAFE_DIRECTORY');
  let cursor = absolute;
  while (true) {
    if (fs.existsSync(cursor)) {
      const st = fs.lstatSync(cursor);
      requireThat(st.isDirectory() && !st.isSymbolicLink(), 'DIRECTORY_LINK_OR_TYPE');
    }
    const parent = path.dirname(cursor); if (parent === cursor) break; cursor = parent;
  }
  fs.mkdirSync(absolute, { recursive: true });
  return fs.realpathSync(absolute);
}

// Final export checks are defense in depth, not an operating-system sandbox.
export function inspectWorkspace(root, allowedPaths, maxBytes) {
  const resolved = fs.realpathSync(root), found = [];
  let bytes = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name), st = fs.lstatSync(full);
      requireThat(!st.isSymbolicLink(), 'ARTIFACT_LINK');
      const real = fs.realpathSync(full);
      requireThat(real.startsWith(resolved + path.sep), 'ARTIFACT_ESCAPE');
      if (st.isDirectory()) {
        const rel = path.relative(resolved, full).split(path.sep).join('/');
        safeRelative(rel);
        requireThat(allowedPaths.some(p => p.startsWith(rel + '/')), 'UNAPPROVED_OUTPUT');
        walk(full);
      }
      else {
        requireThat(st.isFile() && st.nlink === 1, 'ARTIFACT_TYPE');
        const rel = path.relative(resolved, full).split(path.sep).join('/');
        safeRelative(rel); requireThat(allowedPaths.includes(rel), 'UNAPPROVED_OUTPUT');
        bytes += st.size; requireThat(bytes <= maxBytes, 'ARTIFACT_SIZE');
        found.push({ path: rel, bytes: st.size, sha256: createHash('sha256').update(fs.readFileSync(full)).digest('hex') });
      }
    }
  }
  walk(resolved);
  requireThat(found.length > 0, 'ARTIFACT_MISSING');
  return found.sort((a, b) => a.path.localeCompare(b.path));
}

// For a future deterministic Hermes ingress, not a model-visible tool.
export function verifyIngressEnvelope(envelope, key, nowMs) {
  exact(envelope, ['body', 'issued_at_ms', 'nonce', 'signature']);
  text(envelope.body, 16384); text(envelope.nonce, 100);
  requireThat(Buffer.isBuffer(key) && key.length >= 32, 'BRIDGE_KEY');
  integer(envelope.issued_at_ms, 0, Number.MAX_SAFE_INTEGER);
  requireThat(Math.abs(nowMs - envelope.issued_at_ms) <= 30000, 'STALE_ENVELOPE');
  requireThat(typeof envelope.signature === 'string' && /^[a-f0-9]{64}$/.test(envelope.signature), 'BAD_SIGNATURE');
  const expected = createHmac('sha256', key).update(canonical({ body: envelope.body, issued_at_ms: envelope.issued_at_ms, nonce: envelope.nonce })).digest();
  requireThat(timingSafeEqual(expected, Buffer.from(envelope.signature, 'hex')), 'BAD_SIGNATURE');
  return JSON.parse(envelope.body);
}
