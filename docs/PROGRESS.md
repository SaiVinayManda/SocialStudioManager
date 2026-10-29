# Current progress

Active milestone: **B: local OpenMontage Horror pilot**, by the owner's explicit 2026-10-29 priority change. Advanced Milestone A hardening is **DEFERRED, NOT ACCEPTED**. Preserve code/tests/history; remote dispatch stays disabled. MoneyPrinterTurbo/Postiz, n8n and publishing infrastructure remain out of scope.

Latest continuation verification (22:14:08 UTC): B-PILOT-SETUP-01 approval is recorded, but installation is incomplete. Cached hashes and existing MP4 probe/full decode pass. All 16 queried project-venv engine/Piper packages are absent; no Piper executable, lock, narration result or Horror video exists. No new install/download/external call was made. Old supervisor tests are historical and do not validate video production.

Next owner action: [B-PILOT-CONTINUE-01](OPENMONTAGE_CONTINUATION_APPROVAL.md), combining the still-unapproved one-flag resolver correction with a maximum additional 20-minute window after the original 22:17:56 UTC cutoff. Cumulative 750 MiB/3 GiB limits, sources and approved software stay unchanged. Completed components will be reused, not reinstalled. Approved/supplied moving footage is also still required separately. The current "continue" message is not treated as any of those grants.

Current setup execution: the owner approved B-PILOT-SETUP-01. Source materialization, fresh venv and portable FFmpeg/voice verification completed. **Real FFmpeg encoding, ffprobe, full decode and caption-frame checks passed**; the two-second test pattern is not a Horror render. Verified payload 170.04 MiB, measured source/runtime storage 680.43 MiB; zero paid API calls or credential access.

Blocked: the exact approved uv command exits 2 because `--only-binary :all:` conflicts with `--no-build`. [B-PILOT-UV-FIX-01](OPENMONTAGE_SETUP_ERRATA.md) requests only removal of the redundant flag; no altered command was run. Core/Piper dependencies are not installed, so the narration test/registry preflight and production remain unrun. Additional footage/service access needs separate approval. All receipts/files are preserved; no deletion, global settings or publishing. See [actual results](TEST_RESULTS.md).

The preparation snapshot below predates this explicitly approved partial setup; its pending labels are historical.

Latest pilot preparation:

- Reused the pinned no-checkout clone for source inspection. No second clone, upstream change or package installation. Reviewed the operating/context contract, cinematic/documentary manifests, relevant directors, registry, dependencies, FFmpeg compose/stitch and Piper implementation.
- Verified Node 22.19.0, npm 10.9.3, Python 3.11.9, uv 0.9.6 and RTX 4060 Laptop 8,188 MiB. Required Python packages/Piper are missing; FFmpeg/ffprobe/Piper are absent from PATH. Do not infer their absence from every host directory.
- Prepared [setup approval](OPENMONTAGE_INSTALL_APPROVAL.md), [Horror job](../brands/horror/config/pilot.json), brand directories and [creative draft](HORROR_PILOT_PROPOSAL.md). Proposed existing cinematic FFmpeg route preserves moving footage without unnecessary renderer/model installations.
- Completed the owner-approved A-AUTH-METADATA-01 inspection before the priority change: exact scope/digest/expiry checked, exit 0, sanitized metadata only, no network/authentication/configuration operation. [Receipt](research/auth-metadata-A-AUTH-METADATA-01.json). Configured Telegram identity candidates remain unverified.

**No OpenMontage runtime preflight, narration, footage download, music generation, render or media benchmark has run. No MP4 exists or is claimed.** Next gate: B-PILOT-SETUP-01. Build the reusable production entry point only after the first render succeeds.

## Preserved Milestone A checkpoint

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

At that preserved A checkpoint, the first unfinished task was A-03 protected deployment, with an estimated 42-84 hours for remaining A work. Those tasks are now **deferred**. The active next action is the bounded B-PILOT-SETUP-01 approval above; do not spend that A estimate before making the pilot video.
