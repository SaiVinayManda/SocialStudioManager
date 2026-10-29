# Social Studio implementation plan

Current owner direction: **OpenMontage primary; Milestone A first**. Local code, tests, documentation and local commits are authorized by the latest implementation request. Installation, credentials, spend, system changes, destructive actions, public endpoints and publishing retain their separate gates.

The repository was inspected before changes. Existing evaluation and wheel-staging evidence was preserved in initial commit `d691604`. Nothing was reinstalled, reset, deleted, published or pushed. The earlier M0-M8/VE backlog was a proposal, not a deployed system; its historical version remains in Git and its detailed remote security design remains in [REMOTE_DEVELOPMENT.md](REMOTE_DEVELOPMENT.md).

## Verified current state

| Component | Evidence | Current conclusion |
| --- | --- | --- |
| Workspace/Git | Initial branch master had no commits and contained evaluation documents only; initial local checkpoint now exists | Prior work preserved; supervisor code added as the first implementation |
| Node/Git | Actual version commands: Node v22.19.0, Git 2.49.0.windows.1 | Existing tools support dependency-free local development |
| Codex CLI | Existing npm package and executable: codex-cli 0.165.0; exec help inspected | CLI version/interface works; saved authentication and model access are user-reported, not exercised |
| Codex config | Whitelisted nonsecret field: windows.sandbox = elevated | Configuration observation only; worker identity/filesystem/network/process limits not accepted |
| Hermes | Existing native install/source/config; source HEAD bf0203a794a07aac3ff764972ab9087baa4e4f4e; recorded gateway PID 10392 exists | Process presence does not prove bot connectivity, owner restriction or secure Codex control |
| Local supervisor | 51/51 tests and a separate fixed-process fixture canary passed | Local core implemented; actual Telegram/Codex integration NOT RUN |
| OpenMontage | Existing unmodified no-checkout clone at 195eab24478dc9363326aec437aefc3701635ddf; prior source audit retained | Candidate selected; runtime, rendering and resource usage unvalidated |
| n8n/PostgreSQL | No executable found on inherited PATH; no listeners on standard ports 5678/5432 in this inspection | Not operationally verified; do not infer absence or install replacements |
| FFmpeg/ffprobe | Not found on inherited PATH | Not validated; locate/review before any approved install |
| Hardware | Prior query: RTX 4060 Laptop GPU, 8,188 MiB, driver 591.91; owner specifies 16 GB DDR5 | No video throughput/RAM/VRAM benchmark exists |

No .env/auth.json credential content was opened. No real model, Telegram or publishing call was made. Selected nonsecret config fields were inspected without copying configuration into the repo.

## Milestones and gates

| Milestone | Scope | Current state / exit evidence |
| --- | --- | --- |
| A — Secure Hermes-to-Codex supervisor | Authenticated typed management, protected task authority, durable queue/audit, isolated noninteractive Codex, cancellation/recovery, actual result notification | **ACTIVE, NOT ACCEPTED.** Local core passes; live acceptance below remains pending |
| B — OpenMontage Horror pilot | Approved isolated setup, original English 60-second vertical pipeline production, moving footage, voice/music/captions/rights, actual MP4 validation/resource evidence | Blocked by A acceptance and exact setup/provider/download grants; no video has rendered |
| C — Production adapter | submit/status/cancel/output/logs/cost/revision; stable brand/job schema, persistence/idempotency/retry/recovery; independent maintainability/licence review | Planned after B evidence; no AGPL code copied into proprietary adapter |
| D — Brands and intake | Horror pilot, five further brands, immutable independent profiles/destinations; local stable-file/dedupe and supported OAuth Drive intake; evaluated clipping | Design only; no accounts or folders activated |
| E — n8n/PostgreSQL | Local deployment choice, versioned secret-free workflows A-L, durable state and least-privilege credentials | Requires its own install/configuration scope; Docker Desktop is not assumed |
| F — Official publishing | Independent YouTube/Instagram Professional/Facebook Page destinations; OAuth, quotas, dedupe/status/reconnect | Separate credential/app/publishing grants; no public post before explicit first-test approval |
| G — Telegram production management | Brand/production/preview/revision/schedule/failure controls through the authenticated bridge | Future typed operations, no arbitrary shell |
| H — Home operation/reliability | Approved startup, recovery/health/disk/GPU/RAM, backups/retention, secret handling, power checklist and end-to-end drills | Service/startup/power/system changes require exact owner approval |

A passing local fixture cannot unlock B. Do not install or integrate MoneyPrinterTurbo or Postiz; preserve historical evidence/cache. All scheduling and publishing belongs to n8n.

## Milestone A backlog

Estimates below are remaining engineering effort, not grants, measured runtime or promises.

| ID | Work and acceptance criteria | Status | Remaining hours |
| --- | --- | --- | --- |
| A-01 | Inspect history/tooling/evaluations; preserve initial baseline | Done; facts above and Git checkpoint | 0 |
| A-02 | Local strict controller/queue/audit, digest approvals, replay/commands, one-at-a-time lifecycle, fixture cancellation/recovery and independent checks | Implemented; 51/51 local checks and fixture canary; protected deployment unaccepted | Review 2-4 |
| A-03 | Protected operator authority/store and deployment, canonical paths, finite backlog/grant/revocation handling; review patches before activation | Local in-memory authority validation exists; actual protected operator deployment pending | 8-16 |
| A-04 | Existing Hermes deterministic admission integration, original metadata/signing, owner/private-chat enrollment, safe notifications; no second poller | Bridge contract/source hook review exists; installed integration not configured/tested | 8-16 |
| A-05 | Accepted native least-privilege runtime/launcher, broker and effective Codex config; real descendant termination and filesystem/network/resource probes | CLI vector/parser exists, live runner intentionally disabled; operator/runtime approvals needed | 12-24 |
| A-06 | One exact harmless live Codex task from owner's Telegram; actual process result, independent check, artifact/test/diff hashes, usage and result message | NOT RUN; identity/credential/model-budget/runtime gates pending | 4-8 |
| A-07 | Real unauthorized identity, replay/injection, stop/timeout, expired/revoked grant, crash/orphan, outage/duplicate and boundary tests | Local fixtures cover core logic; deployed negative tests NOT RUN | 8-16 |
| A-08 | Operator instructions, evidence review, accepted baseline and explicit Milestone A sign-off | Pending; remain paused/disabled until accepted | 2-4 |

Remaining A estimate: **44-88 hours** including review and real runtime/integration hardening. External approval time is excluded. Reduce/refine using actual deployed evidence; do not report fixture coverage as those live hours completed.

## Immediate next actions

1. Review this local checkpoint and [TEST_RESULTS.md](TEST_RESULTS.md).
2. Enroll/confirm the numeric Telegram owner and private-chat IDs; a request has been issued, no identity invented.
3. Complete the bounded existing-authentication metadata inspection in [LIVE_SUPERVISOR_REVIEW.md](LIVE_SUPERVISOR_REVIEW.md) only if approved, then prepare exact credential-use/budget and native runtime deployment packets.
4. Review/deploy protected A changes through the authorized operator; do not patch/restart the installed Hermes runtime silently.
5. Implement and run the accepted live launcher/bridge and A-06/A-07 test profiles under their exact grants.
6. Record actual acceptance and only then proceed to [OPENMONTAGE_SETUP.md](OPENMONTAGE_SETUP.md).

Current implementation details: [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), [TELEGRAM_COMMANDS.md](TELEGRAM_COMMANDS.md), [PROGRESS.md](PROGRESS.md), [HUMAN_ACTIONS.md](HUMAN_ACTIONS.md). The repeatable local check is node scripts/check-supervisor.mjs; it installs nothing and retains fresh evidence.
