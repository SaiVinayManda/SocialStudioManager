# Current progress

Active milestone: **A — secure Hermes-to-Codex supervisor**. OpenMontage is selected; MoneyPrinterTurbo and Postiz are excluded from current integration. Product milestones B-H are gated.

Completed in this implementation checkpoint:

- Continued from existing commit `594e857`; no setup or repository audit repeated. Added the read-only pinned authority store, approved-directory/project registry, persisted deployment binding and restart-safe revocation checks. The store cannot create approvals or enable live execution; see [A-03 review](AUTHORITY_STORE.md).
- Passed the expanded **77/77** checks and a fresh independent fixed-process fixture canary. Preserved the earlier 51-test evidence and recorded new source hashes/receipts in [TEST_RESULTS.md](TEST_RESULTS.md).
- Prepared the exact metadata-inspection helper and ran only its no-read `--plan` branch. The bounded credential-access request remains pending; no real credential file has been opened. No deployed Hermes configuration, bot consumer, service, account, ACL or system setting was changed.

Preserved prior checkpoint:

- Preserved the prior evaluation/staging work in initial local commit `d691604` (full history in Git); no repository reset, reinitialization or push.
- Verified existing Node v22.19.0, Git 2.49.0 and Codex CLI 0.165.0 version/help. Codex's installed npm executable was outside the inherited PATH; no reinstall or PATH edit was needed.
- Located the existing native Hermes installation, gateway configuration and PID record. Read installed hook source and selected nonsecret config fields. Hermes source HEAD is `bf0203a794a07aac3ff764972ab9087baa4e4f4e`; that does not assert a clean working tree or validated gateway integration.
- Implemented the local strict controller, durable queue/audit, owner/replay checks, approval digest validation, cancellation/recovery, notification outbox, proposed signed bridge and Codex vector/event parsing. Live runtime remains disabled.
- Passed **51/51 local automated checks** and one separately run process-based fixture canary. The canary's Node child exited 0 and its 30-byte output was independently verified. See [TEST_RESULTS.md](TEST_RESULTS.md).

Still unverified/blocked:

- Actual Telegram ownership/chat enrollment, active Hermes security/tool configuration and deterministic integration deployment.
- Credential-use/data-flow/model-budget grants; saved Codex authentication and Telegram connectivity have not been exercised.
- Accepted live Windows identity/filesystem/network/process-tree/resource isolation, credential broker and protected authority deployment.
- The actual Telegram -> approved Codex task -> independent validation -> Telegram result demonstration. **Milestone A has not passed.**
- OpenMontage runtime, first Horror render, production API, brands/ingestion, n8n/PostgreSQL, official platform OAuth/publishing and continuous-operation services are not operationally validated or newly installed.

No live model calls, Telegram messages, credentials, software/model downloads, service/power/firewall changes or public publishing were performed in this coding checkpoint. No Horror video path is claimed. Complete the exact live prerequisites in [HUMAN_ACTIONS.md](HUMAN_ACTIONS.md), then validate A before proceeding.

First unfinished task remains **A-03 protected operator deployment**. Local store logic is implemented; actual identity/ACL/bootstrap protection, emergency stop and anti-rollback/recovery verification are not. Estimated remaining A work is **42-84 engineering hours**, excluding approval waits. A-04/A-05 need credential metadata/identity review before exact live integration/configuration packets can be finalized.
