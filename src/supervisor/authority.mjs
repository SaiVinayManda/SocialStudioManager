import { exact, id, integer, text, requireThat, validatePolicy, validateTask, freeze, clone } from './contracts.mjs';

export function validateAuthority(a) {
  exact(a, ['policy', 'projects', 'tasks', 'grants', 'runner_profiles', 'test_profiles']);
  validatePolicy(a.policy);
  for (const key of ['projects', 'tasks', 'grants', 'runner_profiles', 'test_profiles']) {
    requireThat(Array.isArray(a[key]) && a[key].length <= 1000, 'INVALID_AUTHORITY');
  }
  a.tasks.forEach(validateTask);
  requireThat(new Set(a.tasks.map(t => t.id + ':' + t.revision)).size === a.tasks.length, 'DUPLICATE_TASK');
  for (const p of a.projects) { exact(p, ['id', 'baseline_sha']); id(p.id); requireThat(/^[a-f0-9]{40,64}$/.test(p.baseline_sha), 'INVALID_BASELINE'); }
  for (const p of a.runner_profiles) { exact(p, ['id', 'mode']); id(p.id); text(p.mode, 50); }
  for (const p of a.test_profiles) { exact(p, ['id', 'path', 'expected_text']); id(p.id); text(p.expected_text, 1000); }
  for (const g of a.grants) {
    exact(g, ['id', 'task_digest', 'policy_digest', 'runner_profile_digest', 'test_profile_digest', 'expires_at', 'max_starts']);
    id(g.id); integer(g.max_starts, 1, 1);
    for (const field of ['task_digest', 'policy_digest', 'runner_profile_digest', 'test_profile_digest']) requireThat(/^[a-f0-9]{64}$/.test(g[field]), 'INVALID_GRANT_DIGEST');
    requireThat(Number.isFinite(Date.parse(g.expires_at)), 'INVALID_EXPIRY');
  }
  for (const key of ['projects', 'grants', 'runner_profiles', 'test_profiles']) requireThat(new Set(a[key].map(x => x.id)).size === a[key].length, 'DUPLICATE_AUTHORITY_ID');
  return freeze(clone(a));
}
