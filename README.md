# Social Studio

Self-hosted multi-brand production, with OpenMontage primary. Current priority: **one local Horror video**. Existing setup is verified. Under the owner's B-PILOT-MEDIA-01 approval, upstream planning checkpoints passed, three licensed clips were decoded, all 17 Piper phrases rendered, 32 SRT cues generated, and a real 60-second audio preview mixed. The acquisition window expired before the remaining interior clips transferred; [the bounded time extension](docs/HORROR_PILOT_MEDIA_CONTINUATION.md) is pending. [Actual evidence](docs/test-evidence/openmontage-pilot-assets-01/summary.json). Advanced A hardening is deferred; its code/77-test history is preserved. No Horror MP4 has rendered or published.

Use the existing Node runtime; there are no new npm dependencies or installation steps:

```powershell
node scripts/check-supervisor.mjs
node --test --test-concurrency=1 test/supervisor.test.mjs test/authority-store.test.mjs test/auth-metadata.test.mjs
node src/supervisor/cli.mjs status
node src/supervisor/cli.mjs demo
```

The first command runs the suite, fixture demo, status and metadata-inspection plan with a cleared child environment and retains fresh command/exit/output receipts under `.runtime/checks/`. The plan does not read credential files. It performs no install or package-manager operation.

The demo uses fictional Telegram updates, a real fixed Node fixture subprocess, independent artifact checks and an in-memory notification sink. It writes retained evidence under ignored `.runtime/`, invokes no model, sends no Telegram message and never loads saved credentials. Its output explicitly says `simulation: true` and `milestone_a_accepted: false`.

The controller implements strict commands, owner/private-chat checks, replay rejection, immutable task/grant digests, a persistent hash-chained queue/audit, one job at a time, pause/cancel/timeout, failure handling, restart reconciliation and a durable notification outbox. Its boundaries and limitations are explicit in [SECURITY.md](docs/SECURITY.md).

The local [pinned authority store](docs/AUTHORITY_STORE.md) adds a directory registry and persistent deployment binding. Real operator/worker identity and ACL protection remain undeployed; live dispatch is disabled.

Read [the plan](docs/IMPLEMENTATION_PLAN.md), [actual checks](docs/TEST_RESULTS.md), [current progress](docs/PROGRESS.md), [Telegram commands](docs/TELEGRAM_COMMANDS.md) and [human actions](docs/HUMAN_ACTIONS.md). The earlier evaluations and verified MoneyPrinterTurbo cache remain historical evidence; neither MoneyPrinterTurbo nor Postiz is integrated.
