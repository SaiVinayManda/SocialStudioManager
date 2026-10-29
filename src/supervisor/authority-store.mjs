import fs from 'node:fs';
import path from 'node:path';
import { validateAuthority } from './authority.mjs';
import { Denied, exact, requireThat, integer, id, digest, freeze, safeRelative } from './contracts.mjs';

const directoryNames = ['authority', 'state', 'workspaces', 'baselines'];
const key = p => process.platform === 'win32' ? p.toLowerCase() : p;
const within = (child, parent) => key(child).startsWith(key(parent) + path.sep);
export const sameDirectory = (a, b) => key(a) === key(b);

// No mkdir, ACL changes, credential reads or environment expansion. ACL enforcement
// and an operator-controlled bootstrap pin are required separately before deployment.
export function existingLocalDirectory(value) {
  requireThat(typeof value === 'string' && path.isAbsolute(value) && value.length <= 240, 'AUTHORITY_DIRECTORY');
  requireThat(!value.split(/[\\/]/).some(p => p === '.' || p === '..' || /[. ]$/.test(p)), 'AUTHORITY_DIRECTORY');
  if (process.platform === 'win32') requireThat(/^[A-Za-z]:\\/.test(value) && !value.slice(3).includes(':'), 'AUTHORITY_DIRECTORY');
  const resolved = path.resolve(value);
  requireThat(path.dirname(resolved) !== resolved, 'AUTHORITY_DIRECTORY');
  let cursor = resolved;
  while (true) {
    const st = fs.lstatSync(cursor);
    requireThat(st.isDirectory() && !st.isSymbolicLink(), 'AUTHORITY_DIRECTORY_LINK');
    const parent = path.dirname(cursor); if (parent === cursor) break; cursor = parent;
  }
  const real = fs.realpathSync(resolved);
  requireThat(sameDirectory(real, resolved), 'AUTHORITY_DIRECTORY_ALIAS');
  return real;
}

function validateDocument(document, file, revision, now) {
  exact(document, ['format_version', 'deployment_id', 'revision', 'expires_at', 'directories', 'approved_projects', 'authority']);
  requireThat(document.format_version === 1, 'AUTHORITY_FORMAT'); id(document.deployment_id);
  integer(document.revision, 1, 100000); requireThat(document.revision === revision, 'AUTHORITY_REVISION');
  requireThat(typeof document.expires_at === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(document.expires_at) && Date.parse(document.expires_at) > now, 'AUTHORITY_EXPIRED');
  exact(document.directories, directoryNames);
  const directories = Object.fromEntries(directoryNames.map(n => [n, existingLocalDirectory(document.directories[n])]));
  requireThat(sameDirectory(path.dirname(file), directories.authority), 'AUTHORITY_FILE_LOCATION');
  for (const [i, a] of directoryNames.entries()) for (const b of directoryNames.slice(i + 1)) {
    requireThat(!sameDirectory(directories[a], directories[b]) && !within(directories[a], directories[b]) && !within(directories[b], directories[a]), 'AUTHORITY_DIRECTORY_OVERLAP');
  }
  const authority = validateAuthority(document.authority);
  requireThat(Array.isArray(document.approved_projects) && document.approved_projects.length === authority.projects.length, 'AUTHORITY_PROJECTS');
  const seen = new Set();
  for (const p of document.approved_projects) {
    exact(p, ['id', 'baseline_sha', 'baseline_directory']); id(p.id);
    requireThat(!seen.has(p.id), 'AUTHORITY_PROJECTS'); seen.add(p.id);
    const project = authority.projects.find(a => a.id === p.id);
    requireThat(project && project.baseline_sha === p.baseline_sha, 'AUTHORITY_PROJECTS');
    const baseline = existingLocalDirectory(p.baseline_directory);
    requireThat(within(baseline, directories.baselines), 'AUTHORITY_BASELINE_SCOPE');
  }
  for (const t of authority.tasks) {
    const project = authority.projects.find(p => p.id === t.project_id);
    const runner = authority.runner_profiles.find(p => p.id === t.runner_profile_id);
    const test = authority.test_profiles.find(p => p.id === t.test_profile_id);
    requireThat(project?.baseline_sha === t.baseline_sha && runner && test && t.allowed_paths.includes(test.path), 'AUTHORITY_TASK_SCOPE');
    safeRelative(test.path);
  }
  for (const g of authority.grants) {
    const task = authority.tasks.find(t => digest(t) === g.task_digest);
    requireThat(task, 'AUTHORITY_GRANT_SCOPE');
    const runner = authority.runner_profiles.find(p => p.id === task.runner_profile_id);
    const test = authority.test_profiles.find(p => p.id === task.test_profile_id);
    requireThat(g.policy_digest === digest(authority.policy) && g.runner_profile_digest === digest(runner) && g.test_profile_digest === digest(test), 'AUTHORITY_GRANT_SCOPE');
    requireThat(Date.parse(g.expires_at) <= Date.parse(document.expires_at), 'AUTHORITY_GRANT_EXPIRY');
  }
  return freeze({ ...document, directories, authority });
}

/** Read-only immutable deployment snapshot. Has no grant-creation or activation API. */
export class PinnedAuthorityStore {
  #file; #digest; #revision; #clock;
  constructor({ file, expectedDigest, expectedRevision, clock = () => Date.now() }) {
    requireThat(typeof file === 'string' && path.isAbsolute(file) && path.basename(file) === 'authority.json', 'AUTHORITY_FILE');
    requireThat(/^[a-f0-9]{64}$/.test(expectedDigest), 'AUTHORITY_PIN'); integer(expectedRevision, 1, 100000);
    this.#file = file; this.#digest = expectedDigest; this.#revision = expectedRevision; this.#clock = clock;
    Object.freeze(this);
  }
  load() {
    let fd;
    try {
      const parent = existingLocalDirectory(path.dirname(this.#file));
      const file = path.join(parent, 'authority.json');
      const before = fs.lstatSync(file);
      requireThat(before.isFile() && !before.isSymbolicLink() && before.nlink === 1, 'AUTHORITY_FILE_LINK');
      fd = fs.openSync(file, 'r'); const st = fs.fstatSync(fd);
      requireThat(st.isFile() && st.nlink === 1 && st.dev === before.dev && st.ino === before.ino, 'AUTHORITY_FILE_RACE');
      requireThat(st.size > 0 && st.size <= 1048576, 'AUTHORITY_FILE_SIZE');
      const bytes = Buffer.alloc(st.size + 1), count = fs.readSync(fd, bytes, 0, bytes.length, 0);
      requireThat(count === st.size && fs.fstatSync(fd).size === st.size, 'AUTHORITY_FILE_RACE');
      let document;
      try { document = JSON.parse(bytes.subarray(0, count).toString('utf8')); } catch { throw new Denied('AUTHORITY_JSON'); }
      requireThat(digest(document) === this.#digest, 'AUTHORITY_PIN_MISMATCH');
      const snapshot = validateDocument(document, file, this.#revision, this.#clock());
      return freeze({ ...snapshot, binding: { deployment_id: snapshot.deployment_id, revision: snapshot.revision, digest: this.#digest } });
    } catch (error) {
      if (error instanceof Denied) throw error;
      throw new Denied('AUTHORITY_STORE_UNAVAILABLE');
    } finally { if (fd !== undefined) fs.closeSync(fd); }
  }
}
