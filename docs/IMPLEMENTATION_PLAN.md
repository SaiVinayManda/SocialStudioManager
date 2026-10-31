# Social Studio implementation plan

## Current owner direction: Milestone E local orchestration

Latest actual state (2026-10-31): all three E grants received and executed within scope. Four services healthy, loopback access working, native worker running. PostgreSQL migration 001/six-brand/mock seeds applied; twelve workflows actually imported/published/executed successfully. **Stage 1 and Stage 2 existing-video automated MVP acceptance passed**, plus twenty deployed regression scenarios and local 34+2 checks. First real Horror import-to-three-mock-destinations test took 20.841 s; no rerender/public posting. [Proof](test-evidence/milestone-e-deployed/d9301e97-4f96-4492-a135-c3c71ba3a892.json), [regressions](test-evidence/milestone-e-deployed/regression-709b64e7-3bb1-42b9-bd72-a8d79fc44a98.json). A remains deferred. New render, official credentialed transports, backup/retention and continuous ingestion activation remain unfinished; full Milestone E is not accepted merely from this MVP.

The earlier preparation-only checkpoints are preserved in Git/test history. Do not repeat completed setup. Current remaining backlog follows.

| Remaining work after approval | Estimated engineering hours | Acceptance evidence still required |
| --- | --- | --- |
| Approved installation/auth/bootstrap, schema/role checks, resolve actual pinned-version incompatibilities | 2–4 | Image/version/integrity/budget receipts; healthy isolated services; SQL assertions; import and publication metadata |
| Existing-video n8n/PostgreSQL MVP acceptance and 20-case negative/recovery matrix | 4–8 | Real webhook/worker/decision/scheduler/three destination execution records; restart persistence; no public posts |
| Narrow OpenMontage bridge integration test on a separately approved new project | 2–4 | Actual subprocess/checkpoint/cancel/output evidence; never rerender pilot-001 |
| Complete official authenticated upload transports after separate OAuth/network/post grants | 12–24 | Current Meta contracts, scopes, resumable/session reconciliation, sandbox/private tests; exact first live-post approval |
| Backup/restore drill, resource/disk monitoring and retention operator controls | 3–6 | New-volume restore test and bounded cleanup review; no unattended Windows startup |

Estimates exclude owner approvals and platform app-review waits. The 90-minute **setup budget** is an independent hard cap, not permission to run installations for these engineering estimates. Stage 1 local foundation is prepared; stages 2–6 are not accepted merely because code/exports exist.

The owner's 2026-10-30 implementation request authorizes local Milestone E coding/tests/commits and an actual existing-video mock acceptance pipeline. It supersedes the earlier B-only infrastructure exclusion below. Preserve Milestone A unchanged and disabled. First Horror MP4 is real and reprobed; do not rerender it for acceptance. Installation, local secret provisioning, external accounts and publishing retain their distinct gates.

| Stage | Acceptance | State |
| --- | --- | --- |
| E-1 Foundation | Inspect, versioned PostgreSQL schema/seeds, isolated Compose, exact setup/auth packet, baseline checkpoint | Complete; actual migration/seeds/roles tested; three grants executed |
| E-2 Pipeline MVP | Existing-file intake → actual PostgreSQL/n8n → validation → explicit test approval → mock scheduling and all three destinations → persisted notifications | Automated existing-video MVP passed; twelve successful workflow IDs and twenty deployed scenarios |
| E-3 Engine integration | Narrow preapproved OpenMontage project execution; unchanged existing-file route, real subprocess status/cancel/timeouts | Bridge prepared but unexecuted; raw topic generation still needs existing creative/asset approval gates |
| E-4 Official adapters | Separate credential-free official API contracts for YouTube/Instagram/Facebook; mock default, live denied | Disabled request plans prepared; account/live grants separate |
| E-5 AI boundary | Typed AI tasks, deterministic mock/fallback; 9Router interface disabled without its own grant | Local mock/fallback tested; no router install/model credentials |
| E-6 Reliability | Leases/idempotency/recovery/reconciliation, negative cases, true deployed acceptance evidence | MVP recovery/restarts tested; backup/retention/power-loss drills pending; no unattended Windows startup |

Earlier plans below are preserved historical scope and evidence, not current deployment claims.

Current owner direction: **Milestone B local OpenMontage Horror pilot first; advanced Milestone A hardening DEFERRED, NOT ACCEPTED.** The owner's explicit 2026-10-29 priority change authorizes local B inspection, coding, templates, existing tools, tests and commits before A acceptance. Preserve all supervisor code/tests/history and keep remote dispatch disabled. Installation, credentials, models, charges, Windows changes, destructive actions and publishing retain their gates. Stop preparing the A-03 deployment request.

## Active local pilot backlog

Success means one real playable original Horror story about a 3 AM phone call: roughly 60 seconds, 1080x1920 MP4, English narration, moving footage, cleared score/effects, burned subtitles and independent quality/resource evidence. No Docker/WSL/n8n/PostgreSQL/publishing/router work for this pilot.

| Task | Status and acceptance |
| --- | --- |
| B-01 Existing source/host inspection | Clone 195eab24478dc9363326aec437aefc3701635ddf confirmed; cinematic pipeline and tools inspected. Node/npm/Python/GPU inventory verified; no engine import or generation |
| B-02 Minimum setup | **Complete under explicit B-PILOT-SETUP-01 and B-PILOT-CONTINUE-01 grants**: pinned source/venv, 52 hash-verified wheels installed offline, portable FFmpeg/ffprobe 9.0.2 and voice ready. No repeated completed install or optional GPU/model stack |
| B-03 Actual capability preflight | **Passed**: real Piper WAV, real FFmpeg 1080x1920 H.264/AAC encoding/probe/decode/caption-frame check, upstream local registry/provider summary and offline pip check. This is tool validation, not a finished production |
| B-04 Cinematic production | **Rendered** under explicit B-PILOT-MEDIA-01 + B-PILOT-MEDIA-CONTINUE-01. Six item-licensed sources, eight actual motion selects, original script and existing 17 Piper phrases / score / effects / 32 cues. Upstream research through compose checkpointed; no publishing |
| B-05 Render/QA | **Automated and sampled visual checks passed** on real 60.0 s, 1080x1920 H.264/AAC MP4, 21,303,869 bytes. Probe/full decode/audio preservation/captions/no black/freeze checks and actual metrics retained. Successful render stages 246.007 s. Owner listening/acceptance pending |
| B-06 Review/reproducibility | Final + smaller preview saved under pilot-001; [executed recipe](OPENMONTAGE_RENDER_RECIPE.md), receipts/provenance and failures retained. Owner playback review next; no publishing |
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
