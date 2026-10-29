import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Journal } from './journal.mjs';
import { telegramCommand } from './telegram.mjs';
import { Denied, requireThat, exact, id, integer, text, digest, clone, inspectWorkspace, checkedDirectory } from './contracts.mjs';
import { validateAuthority } from './authority.mjs';
import { PinnedAuthorityStore, existingLocalDirectory, sameDirectory } from './authority-store.mjs';

const edges = {
  queued: ['preparing', 'cancelled', 'needs_approval'],
  preparing: ['running', 'failed', 'interrupted', 'needs_approval'],
  running: ['testing', 'cancel_requested', 'timed_out', 'failed', 'interrupted'],
  testing: ['succeeded', 'failed', 'cancel_requested', 'interrupted'],
  cancel_requested: ['cancelled', 'interrupted'],
};
const activeStates = new Set(['preparing', 'running', 'testing', 'cancel_requested']);

/** Local development controller. Live dispatch intentionally cannot be enabled. */
export class Supervisor {
  constructor({ authority, authorityStore, stateDirectory, workspaceDirectory, runner, clock = () => Date.now() }) {
    requireThat((authority !== undefined) !== (authorityStore !== undefined), 'AUTHORITY_SOURCE_REQUIRED');
    requireThat(authorityStore === undefined || authorityStore instanceof PinnedAuthorityStore, 'AUTHORITY_STORE_TYPE');
    this.authorityStore = authorityStore;
    const snapshot = authorityStore?.load();
    // Reject wrong configured roots before checkedDirectory could create anything.
    if (snapshot) {
      requireThat(sameDirectory(existingLocalDirectory(stateDirectory), snapshot.directories.state) && sameDirectory(existingLocalDirectory(workspaceDirectory), snapshot.directories.workspaces), 'AUTHORITY_RUNTIME_DIRECTORY');
    }
    this.authority = validateAuthority(snapshot?.authority ?? authority); this.runner = runner; this.clock = clock;
    this.workspaces = checkedDirectory(workspaceDirectory);
    const state = checkedDirectory(stateDirectory);
    const compare = p => process.platform === 'win32' ? p.toLowerCase() : p;
    const stateKey = compare(state), workspaceKey = compare(this.workspaces);
    requireThat(stateKey !== workspaceKey && !stateKey.startsWith(workspaceKey + path.sep) && !workspaceKey.startsWith(stateKey + path.sep), 'STATE_WORKSPACE_OVERLAP');
    this.jobs = new Map(); this.revoked = new Set(); this.notices = new Map(); this.requests = new Set();
    this.highestUpdate = -1; this.enabled = false; this.active = null; this.recoveryRequired = false; this.authorityBinding = null;
    this.journal = new Journal(state, this.authority.policy.max_journal_bytes);
    try {
      for (const event of this.journal.events) this.apply(event);
      if (this.authorityBinding) requireThat(snapshot && digest(this.authorityBinding) === digest(snapshot.binding), 'AUTHORITY_REDEPLOYMENT_REVIEW_REQUIRED');
      else if (snapshot) {
        requireThat(this.journal.events.length === 0, 'AUTHORITY_STATE_MIGRATION_REQUIRED');
        this.record('authority.bound', snapshot.binding);
      }
      for (const job of this.jobs.values()) if (activeStates.has(job.state)) this.transition(job.id, 'interrupted', { error: 'RESTART_RECONCILIATION_REQUIRED' });
      this.recoveryRequired = [...this.jobs.values()].some(j => j.state === 'interrupted');
      this.record('controller.started', {});
    } catch (error) { this.journal.close(); throw error; }
  }
  record(type, data) {
    const event = { type, at: new Date(this.clock()).toISOString(), data: clone(data) };
    this.journal.append(event); this.apply(event); return event;
  }
  apply(event) {
    exact(event, ['type', 'at', 'data']); requireThat(Number.isFinite(Date.parse(event.at)), 'INVALID_AUDIT_TIME');
    const d = event.data;
    switch (event.type) {
      case 'controller.started': case 'controller.enabled': case 'controller.paused': exact(d, []); break;
      case 'authority.bound':
        exact(d, ['deployment_id', 'revision', 'digest']); id(d.deployment_id); integer(d.revision, 1, 100000);
        requireThat(this.authorityBinding === null && this.journal.events[0]?.type === 'authority.bound' && /^[a-f0-9]{64}$/.test(d.digest), 'AUTHORITY_BINDING');
        this.authorityBinding = clone(d); break;
      case 'telegram.received':
        exact(d, ['update_id']); integer(d.update_id, 0, Number.MAX_SAFE_INTEGER);
        requireThat(d.update_id > this.highestUpdate, 'AUDIT_REPLAY'); this.highestUpdate = d.update_id; break;
      case 'job.queued':
        exact(d, ['id', 'task_id', 'revision', 'manifest_digest', 'grant_id']);
        id(d.id); id(d.task_id); id(d.grant_id); integer(d.revision, 1, 100000);
        requireThat(!this.jobs.has(d.id) && /^[a-f0-9]{64}$/.test(d.manifest_digest), 'INVALID_QUEUED_JOB');
        this.jobs.set(d.id, { ...d, state: 'queued', created_at: event.at, updated_at: event.at, facts: {} }); break;
      case 'job.transition': {
        exact(d, ['id', 'state', 'facts']);
        const job = this.jobs.get(d.id); requireThat(job && edges[job.state]?.includes(d.state), 'INVALID_TRANSITION');
        requireThat(d.facts && typeof d.facts === 'object' && !Array.isArray(d.facts), 'INVALID_FACTS');
        requireThat(Object.keys(d.facts).every(k => ['pid', 'exit_code', 'duration_ms', 'error', 'checks', 'artifacts'].includes(k)), 'INVALID_FACTS');
        Object.assign(job, { state: d.state, updated_at: event.at, facts: { ...job.facts, ...d.facts } }); break;
      }
      case 'grant.revoked': exact(d, ['id']); id(d.id); this.revoked.add(d.id); break;
      case 'approval.requested': exact(d, ['task_id', 'revision']); id(d.task_id); integer(d.revision, 1, 100000); this.requests.add(d.task_id + ':' + d.revision); break;
      case 'notice.queued':
        exact(d, ['id', 'job_id', 'state']); id(d.id); id(d.job_id); text(d.state, 40); this.notices.set(d.id, d); break;
      case 'notice.sent': exact(d, ['id']); requireThat(this.notices.has(d.id), 'UNKNOWN_NOTICE'); this.notices.delete(d.id); break;
      default: throw new Denied('UNKNOWN_AUDIT_EVENT');
    }
  }
  transition(jobId, state, facts = {}) { this.record('job.transition', { id: jobId, state, facts }); }
  refreshAuthority() {
    if (!this.authorityStore) return;
    try {
      const snapshot = this.authorityStore.load();
      requireThat(digest(snapshot.binding) === digest(this.authorityBinding), 'AUTHORITY_BINDING');
      requireThat(sameDirectory(this.workspaces, snapshot.directories.workspaces) && sameDirectory(this.journal.directory, snapshot.directories.state), 'AUTHORITY_RUNTIME_DIRECTORY');
    } catch (error) { this.enabled = false; throw error; }
  }
  findTask(taskId, revision) {
    const task = this.authority.tasks.find(t => t.id === taskId && t.revision === revision);
    requireThat(task, 'TASK_NOT_REGISTERED'); return task;
  }
  authorization(task, grantId = undefined, forDispatch = false) {
    const project = this.authority.projects.find(p => p.id === task.project_id);
    requireThat(project && project.baseline_sha === task.baseline_sha, 'BASELINE_NOT_ACCEPTED');
    const profile = this.authority.runner_profiles.find(p => p.id === task.runner_profile_id);
    const testProfile = this.authority.test_profiles.find(p => p.id === task.test_profile_id);
    requireThat(profile && testProfile && task.allowed_paths.includes(testProfile.path), 'PROFILE_NOT_REGISTERED');
    const grant = this.authority.grants.find(g => (grantId === undefined || g.id === grantId) && g.task_digest === digest(task));
    requireThat(grant, 'APPROVAL_REQUIRED');
    requireThat(grant.policy_digest === digest(this.authority.policy) && grant.runner_profile_digest === digest(profile) && grant.test_profile_digest === digest(testProfile), 'APPROVAL_DIGEST_MISMATCH');
    requireThat(!this.revoked.has(grant.id) && Date.parse(grant.expires_at) > this.clock(), 'APPROVAL_EXPIRED_OR_REVOKED');
    if (!forDispatch) requireThat([...this.jobs.values()].filter(j => j.grant_id === grant.id).length < grant.max_starts, 'APPROVAL_CONSUMED');
    return { grant, profile, testProfile };
  }
  enqueue(taskId, revision) {
    this.refreshAuthority();
    requireThat(this.jobs.size < this.authority.policy.max_jobs, 'QUEUE_LIMIT');
    const task = this.findTask(taskId, revision), { grant } = this.authorization(task);
    const jobId = randomUUID();
    this.record('job.queued', { id: jobId, task_id: task.id, revision, manifest_digest: digest(task), grant_id: grant.id });
    return this.getJob(jobId);
  }
  async handleTelegram(update) {
    try {
      this.refreshAuthority();
      const command = telegramCommand(update, this.authority.policy.telegram, this.clock());
      requireThat(command.update_id > this.highestUpdate, 'REPLAYED_UPDATE');
      this.record('telegram.received', { update_id: command.update_id });
      switch (command.operation) {
        case '/studio_status': return { accepted: true, status: this.status() };
        case '/studio_queue': return { accepted: true, total: this.jobs.size, jobs: [...this.jobs.values()].slice(-20).map(j => this.getJob(j.id)) };
        case '/studio_run': return { accepted: true, job: this.enqueue(command.task_id, command.revision) };
        case '/studio_pause': this.pause(); return { accepted: true, status: this.status() };
        case '/studio_stop': await this.cancel(command.job_id); return { accepted: true, job: this.getJob(command.job_id) };
        case '/studio_logs': return { accepted: true, events: this.safeEvents(command.job_id) };
        case '/studio_approval':
          this.findTask(command.task_id, command.revision);
          this.record('approval.requested', { task_id: command.task_id, revision: command.revision });
          return { accepted: true, code: 'LOCAL_OWNER_GRANT_REQUIRED' };
        default: throw new Denied('COMMAND_NOT_ALLOWED');
      }
    } catch (error) {
      if (error instanceof Denied || error.code === 'COMMAND_NOT_ALLOWED') return { accepted: false, code: error.code };
      this.enabled = false; throw error;
    }
  }
  enableLocalFixtures() {
    this.refreshAuthority();
    requireThat(this.runner.kind === 'fixed-fixture-process', 'LIVE_RUNTIME_NOT_ACCEPTED');
    requireThat(!this.recoveryRequired && !this.journal.poisoned, 'RECOVERY_REQUIRED');
    this.record('controller.enabled', {}); this.enabled = true;
  }
  pause() { this.enabled = false; this.record('controller.paused', {}); }
  status() { return { paused: !this.enabled, recovery_required: this.recoveryRequired, live_enabled: false, active_job_id: this.active?.jobId ?? null, jobs: this.jobs.size }; }
  getJob(jobId) {
    const j = this.jobs.get(jobId); requireThat(j, 'JOB_NOT_FOUND');
    const task = this.authority.tasks.find(t => t.id === j.task_id && t.revision === j.revision);
    return clone({ id: j.id, task_id: j.task_id, revision: j.revision, manifest_digest: j.manifest_digest, baseline_sha: task?.baseline_sha ?? null, state: j.state, created_at: j.created_at, updated_at: j.updated_at, facts: j.facts });
  }
  safeEvents(jobId) {
    this.getJob(jobId);
    return this.journal.events.filter(e => e.type === 'job.transition' && e.data.id === jobId).slice(-20).map(e => ({ at: e.at, state: e.data.state, error: e.data.facts.error ?? null, exit_code: e.data.facts.exit_code ?? null }));
  }
  async cancel(jobId) {
    const job = this.jobs.get(jobId); requireThat(job, 'JOB_NOT_FOUND');
    if (job.state === 'queued') { this.transition(jobId, 'cancelled'); return; }
    if (!activeStates.has(job.state)) return;
    requireThat(this.active?.jobId === jobId && this.active.handle, 'RECONCILIATION_REQUIRED');
    if (job.state !== 'cancel_requested') this.transition(jobId, 'cancel_requested');
    const stopped = await this.active.handle.cancel();
    requireThat(stopped.termination_verified, 'TERMINATION_UNCONFIRMED');
  }
  async revokeLocal(grantId) {
    requireThat(this.authority.grants.some(g => g.id === grantId), 'GRANT_NOT_FOUND');
    this.record('grant.revoked', { id: grantId }); this.pause();
    const job = this.active && this.jobs.get(this.active.jobId);
    if (job?.grant_id === grantId) await this.cancel(job.id);
  }
  async runNext() {
    if (!this.enabled || this.active || this.recoveryRequired) return null;
    requireThat(this.runner.kind === 'fixed-fixture-process', 'LIVE_RUNTIME_NOT_ACCEPTED');
    const job = [...this.jobs.values()].find(j => j.state === 'queued'); if (!job) return null;
    let auth, task;
    try {
      this.refreshAuthority();
      task = this.findTask(job.task_id, job.revision);
      requireThat(job.manifest_digest === digest(task), 'TASK_DIGEST_CHANGED');
      auth = this.authorization(task, job.grant_id, true);
    } catch (error) { this.transition(job.id, 'needs_approval', { error: error.code ?? 'AUTHORITY_FAILED' }); this.pause(); return this.getJob(job.id); }
    this.transition(job.id, 'preparing');
    this.active = { jobId: job.id, handle: null };
    const began = this.clock(); let timer; let timedOut = false;
    const workspace = path.join(this.workspaces, job.id);
    try {
      fs.mkdirSync(workspace);
      const handle = this.runner.start({ workspace, profile: auth.profile, limits: task.limits });
      this.active.handle = handle;
      this.transition(job.id, 'running', Number.isSafeInteger(handle.pid) ? { pid: handle.pid } : {});
      timer = setTimeout(() => { timedOut = true; handle.cancel().catch(() => { this.recoveryRequired = true; this.enabled = false; }); }, Math.max(1, Math.min(task.limits.max_duration_ms, Date.parse(auth.grant.expires_at) - this.clock())));
      const result = await handle.completion;
      clearTimeout(timer);
      const facts = { exit_code: result.exit_code, duration_ms: Math.max(0, this.clock() - began) };
      if (job.state === 'cancel_requested') {
        requireThat(result.termination_verified, 'TERMINATION_UNCONFIRMED'); this.transition(job.id, 'cancelled', facts);
      } else if (timedOut) {
        requireThat(result.termination_verified, 'TERMINATION_UNCONFIRMED'); this.transition(job.id, 'timed_out', { ...facts, error: 'TIME_LIMIT' }); this.pause();
      } else {
        requireThat(result.exit_code === 0 && !result.output_limit, result.output_limit ? 'OUTPUT_LIMIT' : 'RUNNER_EXIT_FAILED');
        this.refreshAuthority();
        requireThat(!this.revoked.has(job.grant_id) && Date.parse(auth.grant.expires_at) > this.clock(), 'APPROVAL_EXPIRED_OR_REVOKED');
        this.transition(job.id, 'testing', facts);
        const artifacts = inspectWorkspace(workspace, task.allowed_paths, task.limits.max_output_bytes);
        const actual = fs.readFileSync(path.join(workspace, auth.testProfile.path), 'utf8');
        requireThat(actual === auth.testProfile.expected_text, 'INDEPENDENT_CHECK_FAILED');
        this.transition(job.id, 'succeeded', { checks: [{ name: 'reviewed-file-content', passed: true }], artifacts });
      }
    } catch (error) {
      const handle = this.active?.handle;
      if (handle) {
        try { const stopped = await handle.cancel(); requireThat(stopped.termination_verified, 'TERMINATION_UNCONFIRMED'); }
        catch { this.recoveryRequired = true; }
      }
      const state = this.recoveryRequired ? 'interrupted' : 'failed';
      if (edges[job.state]?.includes(state)) this.transition(job.id, state, { error: error instanceof Denied ? error.code : 'RUNNER_OR_STORAGE_ERROR', duration_ms: Math.max(0, this.clock() - began) });
      this.pause();
    } finally { if (timer) clearTimeout(timer); this.active = null; }
    this.record('notice.queued', { id: randomUUID(), job_id: job.id, state: job.state });
    return this.getJob(job.id);
  }
  async flushFixtureNotices(notifier) {
    requireThat(notifier.kind === 'fixture-notifier', 'LIVE_NOTIFIER_NOT_ACCEPTED');
    for (const notice of [...this.notices.values()]) {
      await notifier.send(clone(notice)); this.record('notice.sent', { id: notice.id });
    }
  }
  close() { requireThat(!this.active, 'ACTIVE_JOB'); this.journal.close(); }
}
