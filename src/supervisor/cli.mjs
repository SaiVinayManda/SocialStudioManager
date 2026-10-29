import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Supervisor } from './controller.mjs';
import { FixtureProcessRunner } from './fixture-runner.mjs';
import { fixtureAuthority, fixtureUpdate } from './fixtures/authority.mjs';

const command = process.argv[2];
if (command === 'status') {
  console.log(JSON.stringify({ milestone: 'A', live_dispatch_enabled: false, telegram_integration_verified: false, codex_authentication_used: false, description: 'Local supervisor development; live runtime acceptance pending.' }, null, 2));
} else if (command === 'demo') {
  const root = path.resolve('.runtime', 'demos', randomUUID()); fs.mkdirSync(root, { recursive: true });
  const runner = new FixtureProcessRunner();
  const supervisor = new Supervisor({ authority: fixtureAuthority(), stateDirectory: path.join(root, 'state'), workspaceDirectory: path.join(root, 'jobs'), runner });
  try {
    supervisor.enableLocalFixtures();
    const submitted = await supervisor.handleTelegram(fixtureUpdate('/studio_run LOCAL-CANARY 1'));
    if (!submitted.accepted) throw new Error('Fixture ingress failed');
    const job = await supervisor.runNext(), notifications = [];
    await supervisor.flushFixtureNotices({ kind: 'fixture-notifier', send: async notice => notifications.push(notice) });
    const report = {
      simulation: true, real_telegram_requests: 0, real_codex_requests: 0, real_model_spend_usd: 0,
      process_launches: runner.launches, job, notifications,
      milestone_a_accepted: false, evidence_directory: root,
    };
    fs.writeFileSync(path.join(root, 'result.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
    if (job.state !== 'succeeded') process.exitCode = 1;
  } finally { supervisor.close(); }
} else {
  console.error('Usage: node src/supervisor/cli.mjs status|demo'); process.exitCode = 2;
}
