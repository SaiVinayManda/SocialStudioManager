import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { PinnedAuthorityStore } from '../src/supervisor/authority-store.mjs';
import { Supervisor } from '../src/supervisor/controller.mjs';
import { FixtureProcessRunner } from '../src/supervisor/fixture-runner.mjs';
import { fixtureAuthority, fixtureUpdate } from '../src/supervisor/fixtures/authority.mjs';
import { digest } from '../src/supervisor/contracts.mjs';

// Synthetic authority only. No production approval, key, identity or credential.
function fixture({ mutate = () => {}, clock = () => Date.now() } = {}) {
  const root = path.resolve('.runtime', 'tests', randomUUID());
  const directories = Object.fromEntries(['authority', 'state', 'workspaces', 'baselines'].map(n => [n, path.join(root, n)]));
  for (const directory of Object.values(directories)) fs.mkdirSync(directory, { recursive: true });
  const baseline = path.join(directories.baselines, 'fixture-project'); fs.mkdirSync(baseline);
  const document = {
    format_version: 1, deployment_id: 'TEST-ONLY-DEPLOYMENT', revision: 1,
    expires_at: new Date(clock() + 300000).toISOString(), directories,
    approved_projects: [{ id: 'fixture-project', baseline_sha: 'a'.repeat(40), baseline_directory: baseline }],
    authority: fixtureAuthority({ now: clock() }),
  };
  mutate(document);
  const file = path.join(directories.authority, 'authority.json');
  const write = (value = document) => fs.writeFileSync(file, JSON.stringify(value)); write();
  const storeOptions = { file, expectedDigest: digest(document), expectedRevision: 1, clock };
  const store = new PinnedAuthorityStore(storeOptions);
  return { root, document, file, write, store, storeOptions, options: { authorityStore: store, stateDirectory: directories.state, workspaceDirectory: directories.workspaces, runner: new FixtureProcessRunner(), clock } };
}
function controller(t, options) {
  const s = new Supervisor(options);
  t.after(async () => { if (s.active) { await s.cancel(s.active.jobId); await new Promise(setImmediate); } s.close(); });
  return s;
}

test('read-only pinned authority is immutable and does not create or change files', () => {
  const f = fixture(), before = fs.readFileSync(f.file);
  const snapshot = f.store.load();
  assert.equal(snapshot.binding.digest, digest(f.document));
  assert.equal(Object.isFrozen(snapshot.authority.tasks[0]), true);
  assert.throws(() => { snapshot.authority.grants[0].max_starts = 10; }, TypeError);
  assert.deepEqual(fs.readFileSync(f.file), before);
  assert.deepEqual(fs.readdirSync(f.document.directories.state), []);
  assert.deepEqual(fs.readdirSync(f.document.directories.workspaces), []);
});

test('pinned store queues a real fixture, reopens paused and consumes its one-use grant once', async t => {
  const f = fixture(), first = controller(t, f.options);
  const u = fixtureUpdate('/studio_run LOCAL-CANARY 1', 81);
  const queued = await first.handleTelegram(u); assert.equal(queued.accepted, true);
  first.close(); const second = controller(t, f.options);
  assert.equal(second.status().paused, true);
  assert.equal((await second.handleTelegram(u)).code, 'REPLAYED_UPDATE');
  assert.equal((await second.handleTelegram(fixtureUpdate('/studio_run LOCAL-CANARY 1', 82))).code, 'APPROVAL_CONSUMED');
  second.enableLocalFixtures(); const result = await second.runNext();
  assert.equal(result.state, 'succeeded'); assert.equal(result.facts.checks[0].passed, true);
  assert.equal(f.options.runner.launches, 1); assert.equal(second.status().live_enabled, false);
});

test('revocation persists across restart and prevents an already queued task from starting', async t => {
  const f = fixture(), first = controller(t, f.options);
  const queued = first.enqueue('LOCAL-CANARY', 1);
  await first.revokeLocal('TEST-ONLY-GRANT'); first.close();
  const second = controller(t, f.options); second.enableLocalFixtures();
  const result = await second.runNext();
  assert.equal(result.id, queued.id); assert.equal(result.state, 'needs_approval');
  assert.equal(result.facts.error, 'APPROVAL_EXPIRED_OR_REVOKED'); assert.equal(f.options.runner.launches, 0);
});

test('disk tampering after enqueue pauses dispatch and never starts a worker', async t => {
  const f = fixture(), s = controller(t, f.options); s.enqueue('LOCAL-CANARY', 1); s.enableLocalFixtures();
  const changed = structuredClone(f.document); changed.authority.tasks[0].objective = 'Unapproved change'; f.write(changed);
  const result = await s.runNext();
  assert.equal(result.state, 'needs_approval'); assert.equal(result.facts.error, 'AUTHORITY_PIN_MISMATCH');
  assert.equal(s.status().paused, true); assert.equal(f.options.runner.launches, 0);
  f.write(); assert.equal(await s.runNext(), null); // Restoration does not resume dispatch.
});

test('disk tampering while a real fixture runs prevents accepting otherwise valid output', async t => {
  const f = fixture(), runner = new FixtureProcessRunner();
  const original = runner.start.bind(runner);
  runner.start = args => { const handle = original(args); fs.writeFileSync(f.file, '{}'); return handle; };
  const s = controller(t, { ...f.options, runner }); s.enqueue('LOCAL-CANARY', 1); s.enableLocalFixtures();
  const result = await s.runNext();
  assert.equal(result.state, 'failed'); assert.equal(result.facts.error, 'AUTHORITY_PIN_MISMATCH');
  assert.equal(runner.launches, 1); assert.equal(result.facts.checks, undefined);
});

test('expired deployment blocks ingress and refuses re-enabling a queued task', async t => {
  let now = Date.now(); const f = fixture({ clock: () => now, mutate: d => {
    d.expires_at = new Date(now + 10000).toISOString();
    d.authority.grants[0].expires_at = new Date(now + 5000).toISOString();
  } });
  const s = controller(t, f.options); s.enqueue('LOCAL-CANARY', 1); s.enableLocalFixtures();
  now += 11000;
  assert.equal((await s.handleTelegram(fixtureUpdate('/studio_status', 2, now))).code, 'AUTHORITY_EXPIRED');
  assert.equal(s.status().paused, true); assert.equal(f.options.runner.launches, 0);
  assert.throws(() => s.enableLocalFixtures(), /AUTHORITY_EXPIRED/);
});

test('state cannot silently adopt a new pin or fall back to raw in-memory authority', t => {
  const f = fixture(), first = controller(t, f.options); first.close();
  const changed = structuredClone(f.document); changed.revision = 2; f.write(changed);
  const newStore = new PinnedAuthorityStore({ ...f.storeOptions, expectedDigest: digest(changed), expectedRevision: 2 });
  assert.throws(() => new Supervisor({ ...f.options, authorityStore: newStore }), /AUTHORITY_REDEPLOYMENT_REVIEW_REQUIRED/);
  assert.throws(() => new Supervisor({ ...f.options, authorityStore: undefined, authority: f.document.authority }), /AUTHORITY_REDEPLOYMENT_REVIEW_REQUIRED/);
  f.write(); const reopened = controller(t, f.options); assert.equal(reopened.status().paused, true);
});

test('raw fixture state cannot silently migrate into a pinned deployment', t => {
  const f = fixture(), first = controller(t, { ...f.options, authorityStore: undefined, authority: f.document.authority }); first.close();
  assert.throws(() => new Supervisor(f.options), /AUTHORITY_STATE_MIGRATION_REQUIRED/);
});

test('wrong runtime directory is denied without creating its destination', () => {
  const f = fixture(), other = path.join(f.root, 'not-created');
  assert.throws(() => new Supervisor({ ...f.options, workspaceDirectory: other }));
  assert.equal(fs.existsSync(other), false); assert.deepEqual(fs.readdirSync(f.document.directories.state), []);
});

for (const [name, mutate, code] of [
  ['revision mismatch', d => { d.revision = 2; }, 'AUTHORITY_REVISION'],
  ['directory overlap', d => { d.directories.state = d.directories.workspaces; }, 'AUTHORITY_DIRECTORY_OVERLAP'],
  ['baseline outside registry', d => { d.approved_projects[0].baseline_directory = d.directories.authority; }, 'AUTHORITY_BASELINE_SCOPE'],
  ['missing approved project', d => { d.approved_projects = []; }, 'AUTHORITY_PROJECTS'],
  ['baseline mismatch', d => { d.approved_projects[0].baseline_sha = 'b'.repeat(40); }, 'AUTHORITY_PROJECTS'],
  ['unregistered task project', d => { d.authority.tasks[0].project_id = 'unknown'; }, 'AUTHORITY_TASK_SCOPE'],
  ['grant drift', d => { d.authority.grants[0].policy_digest = 'b'.repeat(64); }, 'AUTHORITY_GRANT_SCOPE'],
  ['grant outlives deployment', d => { d.authority.grants[0].expires_at = new Date(Date.now() + 600000).toISOString(); }, 'AUTHORITY_GRANT_EXPIRY'],
  ['unknown schema field', d => { d.shell = 'powershell.exe'; }, 'INVALID_FIELDS'],
]) test(`even a matching pin cannot admit ${name}`, () => {
  const f = fixture({ mutate }); assert.throws(() => f.store.load(), new RegExp(code));
});

test('store rejects missing, malformed, oversized and hard-linked authority files', () => {
  const f = fixture();
  fs.renameSync(f.file, path.join(f.root, 'preserved.json'));
  assert.throws(() => f.store.load(), /AUTHORITY_STORE_UNAVAILABLE/);
  fs.writeFileSync(f.file, '{invalid'); assert.throws(() => f.store.load(), /AUTHORITY_JSON/);
  fs.writeFileSync(f.file, 'x'.repeat(1048577)); assert.throws(() => f.store.load(), /AUTHORITY_FILE_SIZE/);
  f.write(); fs.linkSync(f.file, path.join(f.root, 'hardlink.json'));
  assert.throws(() => f.store.load(), /AUTHORITY_FILE_LINK/);
});

test('junction paths cannot redirect approved state, even with a matching pin', () => {
  const f = fixture(), link = path.join(f.root, 'state-link');
  fs.symlinkSync(f.document.directories.state, link, process.platform === 'win32' ? 'junction' : 'dir');
  const changed = structuredClone(f.document); changed.directories.state = link; f.write(changed);
  const store = new PinnedAuthorityStore({ ...f.storeOptions, expectedDigest: digest(changed) });
  assert.throws(() => store.load(), /AUTHORITY_DIRECTORY_LINK/);
});

test('pin and absolute fixed file location are mandatory', () => {
  const f = fixture();
  assert.throws(() => new PinnedAuthorityStore({ ...f.storeOptions, expectedDigest: '' }), /AUTHORITY_PIN/);
  assert.throws(() => new PinnedAuthorityStore({ ...f.storeOptions, file: 'authority.json' }), /AUTHORITY_FILE/);
  assert.throws(() => new PinnedAuthorityStore({ ...f.storeOptions, file: path.join(f.root, 'other.json') }), /AUTHORITY_FILE/);
  assert.throws(() => new Supervisor({ ...f.options, authority: f.document.authority }), /AUTHORITY_SOURCE_REQUIRED/);
});
