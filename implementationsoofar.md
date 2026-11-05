# SocialStudio — Implementation Status Report
*Generated: 2026-10-29*

---

## Executive Summary

SocialStudio is a self-hosted AI social-media video production and publishing system in early local development. The project has two active milestone threads: **Milestone A** (Secure Hermes-to-Codex Supervisor) and **Milestone B** (OpenMontage Horror Pilot). Milestone A local coding is largely complete — a 77-test suite passes, a pinned authority store is implemented, and core supervisor infrastructure (controller, journal, Telegram parser, bridge, Codex invocation vector, fixture runner) is all coded — but **live deployment is intentionally disabled and Milestone A is explicitly not accepted**. Milestone B setup is **partial**: source is extracted, a venv with all 52 required packages (including `piper-tts 1.8.0` and `onnxruntime`) and 52 staged wheels exists, portable FFmpeg 9.0.2 is verified, a Piper voice narration test has actually passed (4.3 s WAV produced), but no Horror MP4 has been rendered. Milestones C–H are design-only. MoneyPrinterTurbo and Postiz are excluded from active integration; their evaluation evidence is preserved. No credentials, live services, n8n, PostgreSQL, publishing, or authenticated model calls have been used.

---

## Milestone A — Secure Hermes-to-Codex Supervisor

> Overall: 🚧 Local code complete; live deployment DEFERRED and NOT ACCEPTED.

### A-01 — Workspace / Tooling / Baseline Inspection

- [x] **Inspect existing repository and prior evaluation evidence** — `docs/` evaluation documents preserved; initial commit `d691604` retains baseline; Git, Node v22.19.0, Codex CLI 0.165.0 all located and version-checked (`src/supervisor/cli.mjs`, `scripts/check-supervisor.mjs`)
- [x] **Locate Hermes installation** — Native install found; gateway PID 10392 recorded; source HEAD `bf0203a` noted; no integration activated (`docs/PROGRESS.md`)
- [x] **GPU/hardware inventory** — RTX 4060 Laptop, 8,188 MiB VRAM, driver 591.91; 16 GB DDR5 owner-specified (`docs/TEST_RESULTS.md`)
- [x] **Record initial local Git checkpoint** — Commit `d691604` created with evaluation/staging evidence (`docs/PROGRESS.md`)

### A-02 — Local Controller, Queue/Audit, and Fixture Infrastructure

- [x] **Strict supervisor controller with paused-on-start, one-at-a-time dispatch** — `src/supervisor/controller.mjs` (236 lines); start paused; `enabled=false`; `live_enabled` always false in `status()`
- [x] **Append-only JSONL journal with hash-chain validation and single-lock** — `src/supervisor/journal.mjs` (47 lines); sequence/hash validated; exclusive `controller.lock` file; fsync on every write
- [x] **Immutable authority snapshot (tasks/grants/policy/profiles)** — `src/supervisor/authority.mjs`; `freeze(clone(a))` returned; `validateAuthority()` fully validates all fields
- [x] **Telegram command parser with owner/chat enrollment, replay rejection, forbidden field blocking, staleness check** — `src/supervisor/telegram.mjs` (34 lines); exact numeric owner+chat matching; stale/future/forwarded/edited/attachment/bot/group/inline-bot all rejected
- [x] **Signed bridge envelope (HMAC-SHA256, timing-safe, 30 s window)** — `src/supervisor/bridge.mjs` + `verifyIngressEnvelope()` in `contracts.mjs`; no live Hermes connection
- [x] **Fixed fixture process runner with Node permission model, cancellation, output limits** — `src/fixture-runner.mjs`; spawns `fixtures/worker.mjs` with `--experimental-permission`, bounded stdio, `child.kill()` cancel
- [x] **Codex invocation vector construction (disabled)** — `src/supervisor/codex.mjs`; `codexInvocation()` builds reviewed `--ask-for-approval never exec --sandbox workspace-write` argv; `CodexRunner.start()` throws `LIVE_RUNTIME_NOT_ACCEPTED`
- [x] **Bounded Codex JSONL event parser (telemetry only, never authorization)** — `src/supervisor/codex-events.mjs` (42 lines); max 64 KB/line, 1 MB total; `turn.completed/failed/error` tracked; `redact()` applied
- [x] **Secret redaction for logs/output** — `redact()` in `contracts.mjs` strips bot tokens, API keys, Bearer headers, credential field values
- [x] **Artifact path validation (no symlinks, hard links, traversal, junctions, oversized)** — `inspectWorkspace()` in `contracts.mjs`; realpathSync; nlink===1; safeRelative()
- [x] **Durable notification outbox (fixture-safe)** — `controller.mjs flushFixtureNotices()`; `notice.queued`/`notice.sent` journaled; failed delivery does not re-run work
- [x] **CLI (status / demo commands)** — `src/supervisor/cli.mjs`; status prints `live_dispatch_enabled:false`; demo runs real fixture subprocess with fictional authority
- [x] **51/51 tests passed** (first checkpoint) — evidence in `docs/test-evidence/milestone-a-local/` (`docs/TEST_RESULTS.md`)

### A-03 — Pinned Disk Authority Store and Deployment Binding

- [x] **Read-only `PinnedAuthorityStore` with canonical-document SHA-256 pin, expiry, revision** — `src/supervisor/authority-store.mjs` (102 lines); no write/grant/network API; `PinnedAuthorityStore.load()` uses `fd` handle for race-safe reads
- [x] **Directory disjointness, real-path aliasing, symlink/junction ancestor checks** — `existingLocalDirectory()` in authority-store; `within()`/`sameDirectory()` checks; realpathSync comparison
- [x] **Deployment binding persisted in journal as first event; binding revalidated on restart** — `controller.mjs` L41-45; `authority.bound` journal event; changed pin rejected (`AUTHORITY_REDEPLOYMENT_REVIEW_REQUIRED`)
- [x] **Authority re-read at ingress/dispatch/final validation; dispatch disabled on missing/altered snapshot** — `refreshAuthority()` called from `handleTelegram`, `enqueue`, `runNext`; `this.enabled=false` on error
- [x] **Persisted grant revocation / one-use grant consumption survive restart** — journal `grant.revoked` event; `this.revoked` set rebuilt from events on open
- [x] **77/77 tests passed** (expanded A-03 suite including store tests) — evidence in `docs/test-evidence/milestone-a-authority/`; raw TAP retained
- [x] **Fixture canary with real Node child, actual exit 0, 30-byte artifact** — `milestone-a-authority/demo.stdout`; job `142e944c-7077-443e-9c4c-dc73de0eba6f`; SHA-256 `fe5e08c8ef37a99a04e5c65d83d7bb15718f0308e418080d528aa31772acd351`
- [ ] **Protected operator bootstrap/ACL deployment** — `C:\ProgramData\SocialStudio` directories NOT created; no OS accounts/SIDs/ACLs deployed (`docs/AUTHORITY_STORE.md`)
- [ ] **Anti-rollback anchor and independent external audit storage** — Not implemented; hash-chain alone insufficient against local admin (`docs/ARCHITECTURE.md`)
- [ ] **A-03 deployment approval request prepared and reviewed** — Pending; `docs/AUTHORITY_STORE.md` documents what is required before requesting

### A-04 — Hermes Bridge Integration

- [x] **Bridge contract/IPC design documented** — `docs/REMOTE_DEVELOPMENT.md` §6; narrow ops `list_approved_tasks`, `get_job_status`, `propose_task`, `request_start`
- [x] **Signed envelope verification implemented** — `verifyIngressEnvelope()` in `contracts.mjs`; HMAC-SHA256; timing-safe compare
- [x] **`pre_gateway_dispatch`/`post_gateway_admission` hook locations identified in Hermes source** — noted in `docs/SECURITY.md` with caveat about fail-open risk
- [ ] **Actual Hermes hook installed/configured** — NOT done; no Hermes plugin deployed
- [ ] **Owner/home-chat enrollment verified against a real update** — NOT done; candidates found in approved metadata inspection but ownership not verified
- [ ] **Single update consumer preserved (no second `getUpdates` poller)** — Gate open; configuration not tested

### A-05 — Accepted Live Launcher and Codex Runtime

- [x] **CLI parser/vector construction reviewed** — `src/supervisor/codex.mjs`; `codexInvocation()` builds full sanitized argv; `shell:false`; `credentialPolicy:'unprovisioned'`; `enabled:false`
- [ ] **Accepted native least-privilege runtime/process-tree isolation** — NOT provisioned; `windows.sandbox="elevated"` is an observation, not proof
- [ ] **Real descendant termination proof** — NOT tested; fixture uses Node permission model only, not general process-tree kill
- [ ] **Filesystem/network/memory/identity probes** — NOT run; no approved sandbox provisioning
- [ ] **Credential broker design implemented and verified** — NOT implemented; `credentialPolicy:'unprovisioned'`

### A-06 — Live Canary

- [ ] **One exact harmless live Codex task from owner's Telegram** — NOT RUN; all identity/credential/model-budget/runtime gates pending
- [ ] **Actual process result, independent check, artifact/test/diff hashes, usage, result message** — NOT RUN

### A-07 — Deployed Negative and Recovery Tests

- [x] **Local fixture tests cover core negative cases** — 77 tests cover: unknown sender, forwarded/edited/stale/bot messages, replay, injection attempts, one-use grants, expired/revoked grants, stop/timeout, interrupted restart, corrupt journals, hard-link rejection, signed-bridge tampering, bounded Codex event parsing, etc.
- [ ] **Real unauthorized identity, replay/injection, stop/timeout in live environment** — NOT RUN
- [ ] **Crash/orphan, outage/duplicate, boundary tests against deployed system** — NOT RUN

### A-08 — Operator Review and Milestone A Acceptance

- [ ] **Operator instructions and evidence review** — Documented but NOT executed
- [ ] **Explicit Milestone A sign-off** — NOT DONE; `milestone_a_accepted: false` explicit in all evidence

---

## Milestone B — OpenMontage Horror Pilot

> Overall: 🚧 Tools ready and narration proven; motion footage and final render blocked on approval.

### B-01 — Source / Host Inspection

- [x] **OpenMontage clone confirmed at `195eab24`** — Git object-only no-checkout clone in `%TEMP%`; source materialized to `openmontage/`
- [x] **Cinematic pipeline and tools inspected** — `docs/OPENMONTAGE_SETUP.md`; cinematic.yaml stages reviewed; `video_stitch`, `piper_tts`, `subtitle_gen`, `audio_mixer`, `color_grade`, `video_compose` confirmed in source
- [x] **Node/npm/Python/uv/GPU inventory** — Node 22.19.0, npm 10.9.3, Python 3.11.9, uv 0.9.6, RTX 4060 8 GiB, driver 591.91 (`docs/TEST_RESULTS.md`)
- [x] **No engine import or generation run** — Confirmed; registry/preflight NOT executed during inspection

### B-02 — Minimum Setup

- [x] **Pinned source extracted to `openmontage/`** — `git archive | tar -xf`; 2,209 entries, 89 MB blob bytes
- [x] **Fresh project venv created** — `.runtime/openmontage-pilot/venv`; Python 3.11.9 isolated; owner packages untouched
- [x] **All 52 required packages installed in venv** — `piper-tts 1.8.0`, `onnxruntime 1.31.1`, `fastapi 0.162.0`, `google-genai 2.34.0`, `openai 3.41.0`, `pydantic 2.14.2`, `PyYAML 6.0.3`, `numpy 2.4.6`, `jsonschema 4.26.0`, `python-dotenv 1.2.4`, `requests 2.34.2`, and all transitive deps — `piper.exe` confirmed at `venv\Scripts\piper.exe`
- [x] **Portable FFmpeg 9.0.2 downloaded and hash-verified** — `downloads/ffmpeg-9.0.2-essentials_build.zip`; SHA-256 matched; extracted to `.runtime/openmontage-pilot/ffmpeg/`
- [x] **Piper voice model downloaded and hash-verified** — `en_US-ljspeech-medium.onnx` (63.5 MB), SHA-256 matched; config + card also downloaded
- [~] **uv dependency lock** — `requirements.lock` EXISTS; earlier errata claiming it was blocked appears outdated
- [ ] **Remotion/HyperFrames/CUDA/Torch/video-model stack** — Excluded by design; not needed for selected FFmpeg route

### B-03 — Actual Capability Preflight

- [x] **Real FFmpeg 1080×1920 H.264/AAC encode passed** — `smoke/encoding-smoke.mp4`; 2 s synthetic test pattern; 1,219,656 bytes; encode duration 2,961 ms; caption burned via libass
- [x] **ffprobe validation passed** — Resolution/codecs/audio/duration all checked; exit 0
- [x] **Full FFmpeg decode passed** — Exit 0
- [x] **Caption-frame extraction passed** — PNG at 0.7 s shows burned subtitle
- [x] **Piper narration smoke test PASSED** — Exit 0; 4.34 s WAV; sample rate 22050 Hz; RMS -17.4 dBFS; 191,292 bytes — `generated-videos/horror/pilot-001/previews/piper_voice_sample.wav`
- [ ] **OpenMontage registry/provider preflight** — NOT RUN; `registry.discover()` / `provider_menu_summary()` not executed
- [ ] **Piper registry summary in OpenMontage context** — NOT RUN

### B-04 — Cinematic Production

- [x] **Horror pilot job configuration prepared** — `brands/horror/config/pilot.json`; topic, voice, visual style, music plan
- [x] **Creative draft / narration script prepared** — `docs/HORROR_PILOT_PROPOSAL.md`; "The Second Caller"; 16-line story; scene/timing coverage table
- [x] **Narration script saved to production path** — `generated-videos/horror/pilot-001/scripts/horror_pilot_001.txt`
- [x] **Brand workspace directories created** — `brands/horror/{assets,config,inputs,outputs,projects}`; `generated-videos/horror/pilot-001/{assets,final,logs,previews,scripts,subtitles}`
- [x] **Production status record** — `generated-videos/horror/pilot-001/logs/production-status.json`; `status: "tools_ready_awaiting_media_permission"`; `rendered: false`
- [x] **Music plan documented** — Original locally synthesized dark ambient score + phone/knock sound design; no external recording
- [ ] **Research director checkpoint** — NOT RUN (no pipeline execution)
- [ ] **Proposal checkpoint** — NOT RUN
- [ ] **Script stage approval** — NOT RUN (script is a draft)
- [ ] **Scene plan stage** — NOT RUN
- [ ] **Assets stage — motion footage acquisition** — NOT RUN; pending `B-PILOT-MEDIA-01` approval (`docs/HORROR_PILOT_MEDIA_APPROVAL.md`)
- [ ] **Edit stage** — NOT RUN
- [ ] **Compose/render stage** — NOT RUN

### B-05 — Render / QA

- [ ] **Final 57–63 s vertical MP4 rendered** — NOT DONE; `generated-videos/horror/pilot-001/final/horror_pilot_001.mp4` does NOT exist
- [ ] **Independent ffprobe/full decode of final video** — NOT DONE
- [ ] **Audio/caption/black/freeze/truncation checks** — NOT DONE
- [ ] **Manual visual/listening review** — NOT DONE
- [ ] **Rights manifest** — NOT DONE (no footage acquired)
- [ ] **Measured production time, sampled RAM/GPU/VRAM** — NOT DONE

### B-06 — Review / Reproducibility

- [ ] **Actual local output path/preview** — NOT DONE
- [ ] **Versioned command log** — NOT DONE (no production commands run)
- [ ] **Retained artifacts/errors from production** — NOT DONE

### B-07 — Reusable Entry Point

- [ ] **Parameterized brand/topic/script/duration/aspect/voice/style/subtitles/output job creation** — NOT DONE; deferred until after first successful render

---

## Milestones C–H — Future Scope

All are **design-only** or **not started**. No code has been written for any of these.

### Milestone C — Production Adapter
- [ ] **`submit/status/cancel/output/logs/cost/revision` API** — Design in `docs/VIDEO_ENGINE_ARCHITECTURE.md`; NOT IMPLEMENTED
- [ ] **Stable brand/job schema, persistence/idempotency/retry/recovery** — NOT IMPLEMENTED
- [ ] **AGPL licence review for adapter boundary** — Noted in docs as required; NOT DONE

### Milestone D — Brands and Intake
- [x] **Horror brand directory and config stub** — `brands/horror/` structure exists; job config and proposal present
- [ ] **Five further brand profiles** — Design-only (`storytelling`, `motivation`, `travel`, `business-insights`, `company`)
- [ ] **Immutable independent brand/destination profiles** — NOT IMPLEMENTED
- [ ] **Local stable-file/dedupe watcher** — NOT IMPLEMENTED
- [ ] **OAuth Google Drive intake** — NOT IMPLEMENTED
- [ ] **Clipping/highlight selection** — NOT IMPLEMENTED

### Milestone E — n8n / PostgreSQL
- [ ] **Local n8n deployment** — NOT started; no listener on port 5678
- [ ] **PostgreSQL deployment** — NOT started; no listener on port 5432
- [ ] **Versioned secret-free workflows A–L** — NOT IMPLEMENTED
- [ ] **Durable state schema** — Design only

### Milestone F — Official Publishing
- [ ] **YouTube API integration** — NOT IMPLEMENTED; no OAuth app
- [ ] **Instagram Professional API** — NOT IMPLEMENTED
- [ ] **Facebook Page API** — NOT IMPLEMENTED
- [ ] **OAuth flows, quotas, dedupe/status/reconnect** — NOT IMPLEMENTED

### Milestone G — Telegram Production Management
- [ ] **Brand/production/preview/revision/schedule/failure Telegram commands** — NOT IMPLEMENTED; noted as "Future Milestone G" in `docs/TELEGRAM_COMMANDS.md`

### Milestone H — Home Operation / Reliability
- [ ] **Approved startup (scheduled task/service)** — NOT IMPLEMENTED; requires STARTUP-01 approval
- [ ] **Recovery/health/disk/GPU/RAM monitoring** — NOT IMPLEMENTED
- [ ] **Backups/retention/secret handling** — NOT IMPLEMENTED
- [ ] **End-to-end operational drills** — NOT DONE

---

## MoneyPrinterTurbo Evaluation (Historical / Preserved)

- [x] **Anonymous read-only source clone** — HEAD `fd5127e8`; no checkout/execution; preserved in `%TEMP%`
- [x] **Public-source reconnaissance (licence, deps, API, CLI, publishing)** — `docs/MONEYPRINTERTURBO_EVALUATION.md`; MIT licence; FastAPI/MoviePy/edge-tts stack noted
- [x] **116 wheels downloaded and hash-verified (VA-STAGE-MPT-01)** — 224,210,240 bytes; all SHA-256 checks passed; stored in `pip/cache/`; NOT extracted/installed
- [ ] **Isolated evaluation runtime/run** — NOT DONE; pending M4 and MPT-SOURCE/INSTALL/RUN grants
- [ ] **Quality scores, resource measurements** — NOT DONE
- [ ] **Reusable adapter implementation** — NOT DONE; design documented in evaluation doc §4

---

## Pending / Blocked Items

### Immediate — Milestone B

| Item | Blocker |
|---|---|
| OpenMontage registry/provider preflight (remaining B-03) | Should now be unblocked — venv + `piper.exe` confirmed; owner should verify and run |
| Motion footage acquisition for Horror pilot | **B-PILOT-MEDIA-01** approval pending (`docs/HORROR_PILOT_MEDIA_APPROVAL.md`); max 8 clips, 200 MiB, public-domain/CC0/CC-BY-4.0 only |
| Full-run creative preauthorization for cinematic pipeline stages | Also part of B-PILOT-MEDIA-01 |
| Final Horror MP4 render (B-05) | Blocked until footage approved and acquired |

### Deferred — Milestone A Live Gates

| Item | Required Action |
|---|---|
| Owner Telegram user ID + private chat ID enrollment | Human action: provide numeric IDs (`docs/HUMAN_ACTIONS.md` TG-02) |
| Hermes hook review/deployment | Human action: inspect Hermes allowlists/tools/hooks; deploy reviewed integration (A-04) |
| Native least-privilege runtime + process-tree isolation | Human action: HOST-01 + ADMIN-01; verify WSL2 or Windows sandbox (A-05) |
| Credential broker implementation | Human action: AUTH-01; dedicated Codex credential identity (A-05) |
| Live Codex canary (A-06) | Human action: RUN-01; identity + model + budget grant |
| Deployed negative and recovery tests (A-07) | Depends on A-04 / A-05 / A-06 |
| A-03 protected deployment | Human action: exact ACL/account/SID/PowerShell commands reviewed and executed |
| Explicit Milestone A sign-off (A-08) | Human action: ACCEPT-01 |

### Not Started — Future Milestones

| Item | Gate |
|---|---|
| Production video adapter (C) | After B first render |
| Five additional brands (D) | After B acceptance |
| n8n/PostgreSQL infrastructure (E) | N8N-01 + INSTALL-01 |
| Official YouTube/Meta/Facebook OAuth publishing (F) | PUBLISH-01 + AUTH-01 per account |
| Telegram production management commands (G) | After A + C |
| Service startup/reliability/backups (H) | STARTUP-01 + operator review |

---

## Key Evidence Files

| File | What it proves |
|---|---|
| `docs/test-evidence/milestone-a-authority/` | 77/77 local tests; demo result JSON; raw TAP |
| `docs/test-evidence/openmontage-setup-01/` | B-PILOT-SETUP-01 execution receipts |
| `generated-videos/horror/pilot-001/logs/ffmpeg-result.json` | Real FFmpeg 1080×1920 H.264/AAC encoding PASSED |
| `generated-videos/horror/pilot-001/logs/piper-result.json` | Real Piper narration 4.34 s WAV PASSED |
| `generated-videos/horror/pilot-001/logs/production-status.json` | Status: `tools_ready_awaiting_media_permission`; `rendered: false` |
| `.runtime/openmontage-pilot/venv/Lib/site-packages/` | piper-tts 1.8.0, onnxruntime 1.31.1 + 50 other packages installed |
| `.runtime/openmontage-pilot/venv/Scripts/piper.exe` | Piper executable confirmed present |
| `.runtime/openmontage-pilot/requirements.lock` | Dependency lock file present |
| `docs/research/auth-metadata-A-AUTH-METADATA-01.json` | Sanitized credential metadata receipt (no secrets) |

---

## Legend

- `[x]` ✅ **Implemented** — Code exists, test passed, or artifact verified
- `[~]` 🚧 **Partial / In Progress** — Partially done; specific gap noted inline
- `[ ]` ❌ **Pending / Missing** — Not yet started, not run, or explicitly deferred

---

> **Note on Milestone B venv status:** Direct filesystem inspection confirms `piper-tts 1.8.0`, `onnxruntime 1.31.1`, and all 52 required OpenMontage dependencies **are installed** in the project venv, and `piper.exe` **exists**. Earlier PROGRESS.md entries written before the continuation approval were outdated. The actual current blocker for the Horror video render is **motion footage acquisition** (`B-PILOT-MEDIA-01`), not dependency installation.

