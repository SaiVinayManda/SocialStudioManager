# Social Studio implementation plan

Current owner direction: **Milestone B local OpenMontage Horror pilot first; advanced Milestone A hardening DEFERRED, NOT ACCEPTED.** The owner's explicit 2026-10-29 priority change authorizes local B inspection, coding, templates, existing tools, tests and commits before A acceptance. Preserve all supervisor code/tests/history and keep remote dispatch disabled. Installation, credentials, models, charges, Windows changes, destructive actions and publishing retain their gates. Stop preparing the A-03 deployment request.

## Active local pilot backlog

Success means one real playable original Horror story about a 3 AM phone call: roughly 60 seconds, 1080x1920 MP4, English narration, moving footage, cleared score/effects, burned subtitles and independent quality/resource evidence. No Docker/WSL/n8n/PostgreSQL/publishing/router work for this pilot.

| Task | Status and acceptance |
| --- | --- |
| B-01 Existing source/host inspection | Clone 195eab24478dc9363326aec437aefc3701635ddf confirmed; cinematic pipeline and tools inspected. Node/npm/Python/GPU inventory verified; no engine import or generation |
| B-02 Minimum setup | **Complete under explicit B-PILOT-SETUP-01 and B-PILOT-CONTINUE-01 grants**: pinned source/venv, 52 hash-verified wheels installed offline, portable FFmpeg/ffprobe 9.0.2 and voice ready. No repeated completed install or optional GPU/model stack |
| B-03 Actual capability preflight | **Passed**: real Piper WAV, real FFmpeg 1080x1920 H.264/AAC encoding/probe/decode/caption-frame check, upstream local registry/provider summary and offline pip check. This is tool validation, not a finished production |
| B-04 Cinematic production | Dedicated `generated-videos/horror/pilot-001` created; original script/voice preview/logs saved. Actual pipeline stages remain pending authorised moving footage. [B-PILOT-MEDIA-01](HORROR_PILOT_MEDIA_APPROVAL.md) requests clip acquisition and explicit unchanged full-run preauthorization; no paid APIs/publishing |
| B-05 Render/QA | Actual 57-63s vertical MP4, probe/full decode, audio/caption/black/freeze checks plus manual review, rights manifest, measured timing and sampled RAM/GPU/VRAM. NOT RUN |
| B-06 Review/reproducibility | Actual local output path/preview, versioned commands, retained artifacts/errors and manual review; no publishing |
| B-07 Reusable entry point | After the first successful video only: parameterized brand/topic/script/duration/aspect/voice/style/subtitles/output job creation around the existing pipeline |

The one-session A-AUTH-METADATA-01 inspection completed under explicit owner approval: [sanitized receipt](research/auth-metadata-A-AUTH-METADATA-01.json). It did not verify/use authentication; the priority change does not renew its read grant.

## Preserved previous milestone plan

The A-first sequence and A remaining-hour estimate below are historical/deferred. They no longer block the expressly authorized local B pilot. They do not grant remote activation or other product milestones.

The repository was inspected before changes. Existing evaluation and wheel-staging evidence was preserved in initial commit `d691604`. Nothing was reinstalled, reset, deleted, published or pushed. The earlier M0-M8/VE backlog was a proposal, not a deployed system; its historical version remains in Git and its detailed remote security design remains in [REMOTE_DEVELOPMENT.md](REMOTE_DEVELOPMENT.md).

## Verified current state

| Component | Evidence | Current conclusion |
| --- | --- | --- |
| Workspace/Git | Initial branch master had no commits and contained evaluation documents only; initial local checkpoint now exists | Prior work preserved; supervisor code added as the first implementation |
| Node/Git | Actual version commands: Node v22.19.0, Git 2.49.0.windows.1 | Existing tools support dependency-free local development |
| Codex CLI | Existing npm package and executable: codex-cli 0.165.0; exec help inspected | CLI version/interface works; saved authentication and model access are user-reported, not exercised |
| Codex config | Whitelisted nonsecret field: windows.sandbox = elevated | Configuration observation only; worker identity/filesystem/network/process limits not accepted |
| Hermes | Existing native install/source/config; source HEAD bf0203a794a07aac3ff764972ab9087baa4e4f4e; recorded gateway PID 10392 exists | Process presence does not prove bot connectivity, owner restriction or secure Codex control |
| Local supervisor | Expanded suite 77/77 and a fresh fixed-process fixture canary passed; earlier 51-test evidence preserved | Core plus pinned disk authority implemented locally; protected deployment and actual Telegram/Codex integration NOT RUN |
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
| A-03 | Protected operator authority/store and deployment, canonical paths, finite backlog/grant/revocation handling; review patches before activation | Pinned disk reader, directory registry, persisted deployment binding/revocation and adversarial fixture tests implemented; actual identity/ACL/bootstrap deployment and anti-rollback review pending; see [authority review](AUTHORITY_STORE.md) | 6-12 |
| A-04 | Existing Hermes deterministic admission integration, original metadata/signing, owner/private-chat enrollment, safe notifications; no second poller | Bridge contract/source hook review exists; installed integration not configured/tested | 8-16 |
| A-05 | Accepted native least-privilege runtime/launcher, broker and effective Codex config; real descendant termination and filesystem/network/resource probes | CLI vector/parser exists, live runner intentionally disabled; operator/runtime approvals needed | 12-24 |
| A-06 | One exact harmless live Codex task from owner's Telegram; actual process result, independent check, artifact/test/diff hashes, usage and result message | NOT RUN; identity/credential/model-budget/runtime gates pending | 4-8 |
| A-07 | Real unauthorized identity, replay/injection, stop/timeout, expired/revoked grant, crash/orphan, outage/duplicate and boundary tests | Local fixtures cover core logic; deployed negative tests NOT RUN | 8-16 |
| A-08 | Operator instructions, evidence review, accepted baseline and explicit Milestone A sign-off | Pending; remain paused/disabled until accepted | 2-4 |

Remaining A estimate: **42-84 hours** including review and real runtime/integration hardening. External approval time is excluded. This revision reflects the completed local A-03 store slice; do not report fixture coverage as deployed acceptance.

## Immediate next actions

1. Review this local checkpoint, [TEST_RESULTS.md](TEST_RESULTS.md) and [A-03 authority/deployment design](AUTHORITY_STORE.md). Local implementation does not grant protection or acceptance to its own deployment.
2. Enroll/confirm the numeric Telegram owner and private-chat IDs; a request has been issued, no identity invented.
3. Complete the bounded existing-authentication metadata inspection in [LIVE_SUPERVISOR_REVIEW.md](LIVE_SUPERVISOR_REVIEW.md) only if approved, then prepare exact credential-use/budget and native runtime deployment packets.
4. Review/deploy protected A changes through the authorized operator; do not patch/restart the installed Hermes runtime silently.
5. Implement and run the accepted live launcher/bridge and A-06/A-07 test profiles under their exact grants.
6. Record actual acceptance and only then proceed to [OPENMONTAGE_SETUP.md](OPENMONTAGE_SETUP.md).

Current implementation details: [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), [TELEGRAM_COMMANDS.md](TELEGRAM_COMMANDS.md), [PROGRESS.md](PROGRESS.md), [HUMAN_ACTIONS.md](HUMAN_ACTIONS.md). The repeatable local check is node scripts/check-supervisor.mjs; it installs nothing and retains fresh evidence.
