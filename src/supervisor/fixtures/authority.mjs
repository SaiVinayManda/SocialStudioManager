import { digest } from '../contracts.mjs';

// Fictional identities and grants are for zero-network fixture tests only.
// This is never an approval store, owner enrollment or live execution grant.
export function fixtureAuthority({ mode = 'write-ok', maxDurationMs = 5000, now = Date.now(), expectedText = 'Social Studio local canary OK\n' } = {}) {
  const policy = { version: 1, telegram: { owner_user_id: '100001', private_chat_id: '100001', max_age_seconds: 300 }, max_journal_bytes: 1048576, max_jobs: 50 };
  const runnerProfile = { id: 'fixture-process', mode };
  const testProfile = { id: 'canary-content', path: 'canary.txt', expected_text: expectedText };
  const task = {
    id: 'LOCAL-CANARY', revision: 1, project_id: 'fixture-project', baseline_sha: 'a'.repeat(40),
    objective: 'Run a fixed local Node fixture; no Codex, model or network access.',
    allowed_paths: ['canary.txt'], acceptance_criteria: 'Actual subprocess exit zero and independent exact file-content check.',
    test_profile_id: testProfile.id, runner_profile_id: runnerProfile.id,
    limits: { max_duration_ms: maxDurationMs, max_output_bytes: 4096, max_attempts: 1, max_cost_usd: 0 },
  };
  const grant = {
    id: 'TEST-ONLY-GRANT', task_digest: digest(task), policy_digest: digest(policy),
    runner_profile_digest: digest(runnerProfile), test_profile_digest: digest(testProfile),
    expires_at: new Date(now + 60000).toISOString(), max_starts: 1,
  };
  return { policy, projects: [{ id: task.project_id, baseline_sha: task.baseline_sha }], tasks: [task], grants: [grant], runner_profiles: [runnerProfile], test_profiles: [testProfile] };
}

export function fixtureUpdate(text, updateId = 1, now = Date.now()) {
  return { update_id: updateId, message: { message_id: updateId, date: Math.floor(now / 1000), from: { id: 100001, is_bot: false }, chat: { id: 100001, type: 'private' }, text } };
}
