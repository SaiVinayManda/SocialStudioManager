# Actual verification results

## E2 replacement text-model discovery — 2026-10-31

**No inference test run. Stage 2 verification blocked, not a provider success/failure.** Local `/v1/models` HTTP 200; thirteen IDs, eleven potential text candidates and two excluded Jev decision models. Alias/combo/pricing endpoints each returned 401; no auth retry. Anonymous official upstream catalogs: API.airforce HTTP 200 (785 models), OpenCode HTTP 200 (78 models). All three local Airforce candidates advertise nonzero input/output rates and their `:free` counterparts are absent from that public response. All three local OpenCode text candidates are absent upstream. Three helper syntax checks and nine public-source excerpt/hash reads completed; no router source executed, credentials accessed or configuration changed. [Per-model table and primary evidence](AI_TEXT_MODEL_DISCOVERY.md).

Static source confirms qualified IDs bypass ordinary aliases/combos and pure-text requests bypass multimodal capability fallback; live overrides, account billing and upstream substitution remain unverified. MiMo's executor contains an implicit bootstrap/JWT and retry path, which was not invoked. No revised canary packet, runtime grant, n8n job, PG attempt/output, model charge, render or publishing was initiated. Existing 88-test and earlier mock canary results were not rerun or promoted to real-provider evidence.

## E2 conditional real-canary preflight — 2026-10-31 13:13 UTC

**STOPPED BEFORE INFERENCE; not a real-provider pass or a live provider failure.** All 46 execution digests and both packet/manifest digests matched; absolute expiry unexpired. `GET /v1/models` on existing loopback 9Router returned HTTP 200 and lists exact `oc/jev-1.13-free`. `GET /api/pricing` returned HTTP 401; no authentication retry, secrets/config access or model test. Local route pinning, no-paid-fallback/substitution and extra-charge conditions could not be verified.

Official TypeSafe/OpenCode documentation confirms Jev uses typed decision questions rather than text generation; the earlier packet chose the wrong model type for a horror script. Public upstream free pricing is not proof of this installed route's billing policy. [Primary sources, exact blocker and receipt](AI_BRAIN_CANARY_PREFLIGHT.md), [actual metadata JSON](test-evidence/milestone-e2/canary-preflight-2026-10-31T13-13-21-862Z/preflight.json).

Inference requests **0**; actual model/response duration/token usage/billed cost **not measured**; no new task/attempt/output records or generated output. No n8n job submitted, render, publishing, software install, CLI agent or privileged deployment. A syntax-only helper error was corrected before I/O; subsequent `node --check` and the two-GET metadata preflight passed. Prior 88-test/mock/persistence evidence below was not rerun or represented as real inference. Conditional owner grant recorded; no unconditional activation or priority change.

## E2 AI Brain — 2026-10-31, current implementation evidence

**Real inference: NOT RUN / NOT APPROVED. E2 acceptance remains pending.** Current results are separate from historical supervisor fixture counts and the prior E pipeline baseline.

- Combined secret-free local suite: **88 passed, 0 failed, 0 skipped** (51 AI, 35 existing orchestrator, 2 proxy). [Receipt](test-evidence/milestone-e2/2026-10-31T12-55-33-292Z/unit.json).
- Actual PostgreSQL lifecycle/constraints: **24/24**, rollback fixtures, not mocked SQL. Actual AI API auth/role checks **11/11**, existing API regressions **13/13**. [PG receipt](test-evidence/milestone-e2/2026-10-31T12-45-14-107Z/postgres-ai-checks.json), [AI auth](test-evidence/milestone-e2/2026-10-31T12-45-14-107Z/ai-api-auth-checks.json), [existing auth](test-evidence/milestone-e2/2026-10-31T12-45-14-107Z/existing-api-regression.json).
- Actual signed n8n → PG → manager → schema validation → PG → n8n mock canary: **passed, 1.5796999 s host elapsed**. Run `3a5a058b-4664-4130-8071-7e259cc0ca5d`, task `18cb1a4c-ac62-4d57-9d97-ca83e0989ce3`. One immutable output, two **simulated** attempts (`mock-unavailable`, `mock`), no production or publishing tasks. [Canary](test-evidence/milestone-e2/3a5a058b-4664-4130-8071-7e259cc0ca5d/canary.json), [PG rows](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/postgres.json), [actual workflow-02 successes 3288/3291](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/n8n.json).
- Actual PG restart retained task/checksum/history and n8n readiness returned 200: [receipt](test-evidence/milestone-e2/2026-10-31T12-54-50-138Z/restart-persistence.json).
- Mapped script and scene_plan passed both actual upstream JSON schemas using existing Python/jsonschema; unchanged pilot re-probed **60.000 s, 1080×1920**, SHA-256 `48fb3d02aecb4e83c43654d111194fd44870011c229a8b7387d8a83096858528`. [Artifact receipt](test-evidence/milestone-e2/2026-10-31T12-38-30-404Z/artifact-validation.json). No render.
- Existing completed-job n8n pipeline/dedup/mock-result regression passed: [receipt](test-evidence/milestone-e-deployed/d9301e97-4f96-4492-a135-c3c71ba3a892-2026-10-31T12-36-29-302Z.json). This reuses prior successful platform receipts; it does not claim twelve fresh publishing executions.
- Four existing services running/healthy: [snapshot](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/services.json). Migration versions 1/2 present; 002 checksum `1e123be81d20f82ae5f7dcf77ea7fdcca68c7c091878a4e3e5b93cfb4598a63e`.

Actual discovery: Codex 0.165.0, standalone headless `agy`, 9Router 0.5.112 `/v1/models` HTTP 200. Safe CLI execution, authentication availability/quotas, zero-charge route and real inference are not validated. [Provider evidence](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/provider-discovery.json). No saved provider credentials were read. No RAM/VRAM or model cost numbers invented.

Initial integration failures were fixed and retained: SQL `42P08` type inference; sandbox-only Python launcher access; old verifier's protective `EEXIST`; metadata version parsing with a PATH warning. Full mapping and limits: [AI_BRAIN_TEST_MATRIX.md](AI_BRAIN_TEST_MATRIX.md). Generated deterministic drafts live under `brands/horror/projects/ai-3ff5a006-6bac-49de-a633-8eac218bbea6/`, outside Git. Actual model-generated output location: **none yet**.

## Milestone E actual loopback/workflow acceptance — 2026-10-31

**First existing-file MVP passed against actual running n8n/PostgreSQL.** [Primary end-to-end record](test-evidence/milestone-e-deployed/d9301e97-4f96-4492-a135-c3c71ba3a892.json), [20-scenario deployed regression](test-evidence/milestone-e-deployed/regression-709b64e7-3bb1-42b9-bd72-a8d79fc44a98.json), [window/health/resource snapshot](test-evidence/milestone-e-access-01/final-state.json). These supersede earlier zero-import/blocked snapshots below.

| Actual result | Evidence/limit |
| --- | --- |
| Access approval | Explicit E-LOCAL-ACCESS-01 owner response; all three frozen hashes matched. Window 08:49:39.719–09:19:39.720 UTC; no new download/key/account/public posting |
| Services/network | Four running healthy services; proxy publishes exactly 127.0.0.1:5678/8780. Actual inspect: app/n8n/PostgreSQL only socialstudio_internal, gateway empty. Proxy alone has frontend routing |
| n8n | Twelve actual imported/published workflow IDs; every ID has successful database execution records. This is not a function-only/mock-graph substitute |
| Primary existing-video job | b41d29ed-db4b-44a5-899e-1a8769c727cd. Real signed intake twice → same job; real native FFprobe/full decode/SRT/licence-reference hash → explicit mock-test decision → three scheduler/platform workflows → persisted mock IDs + six local notification entries (accepted, preview, review and three mock outcomes) |
| Runtime | First E2E interval 08:58:56.958–08:59:17.799 = **20.841 s** (outer process 20.9327715 s). Native existing-video validation **4.9772965 s**. Rendering skipped; no new render time or peak RAM/GPU claimed |
| Primary publication | Exactly one attempt/receipt per YouTube, Instagram, Facebook; IDs start mock-. Zero public URLs/posts/API charges |
| Deployed regressions | **20/20 passed**: schema/constraints; brand path isolation; import/state/probe evidence; rejection/expiry/wrong-checksum; actual copied-file modification invalidates approval before dispatch; future scheduling; three distinct mock receipts; duplicate publication; worker lease retry; missing auth; wrong platform; malformed actual n8n webhook; AI fallback/failure/concurrent dedupe; restart during pending approval; PostgreSQL restart + actual signed redelivery |
| Restart semantics | Verified business-state recovery after restarting n8n during pending review: no timeout approval, exact later test decision, DB-driven scheduler recovery, one mock dispatch. Does not claim every original n8n execution resumes with the same ID. A hard power-loss/new-render restart drill remains outstanding |
| Local regression rerun | **35/35 passed**, exit 0; [latest receipt](test-evidence/milestone-e-local/unit-2026-10-31T09-44-39-811Z.json). Includes a real five-second/two-observation one-shot intake regression using a fictional HTTP sink. Proxy **2/2 passed**, 196.9795 ms. Those fixture checks remain distinct from deployed results |
| Resource observation | Single post-test Docker snapshot: n8n 375.4 MiB, API 22.27 MiB, PostgreSQL 36.16 MiB, proxy 21.68 MiB. These are not peak measurements; configured caps unchanged |

Failed attempts were preserved: clean child environment could not locate Compose plugin (exit 125, no container change); direct installed plugin fixed it. Owner setup initially rejected the generated 68-character file format; actual installed n8n schema confirmed maximum 64, no owner had been created, and bootstrap used the file's 64-character prefix without altering any key file. A regression run immediately after API restart failed on transient empty 502 response; adding a readiness wait yielded the complete 20/20 run. Primary first trace included concurrent duplicate mock AI preparation; atomic task deduplication/idempotent metadata and durable approved-job discovery were fixed and tested. Historical execution errors are not erased or described as zero errors.

Negative fixtures explicitly reuse prior digest-validated media/database states; they are not newly produced videos. Actual modified-file test touches only a new copied fixture; restart test remuxes a separate local fixture without re-encoding. Original pilot remains SHA256 48fb3d02aecb4e83c43654d111194fd44870011c229a8b7387d8a83096858528. No deletion/reset or unrelated-container action. New generation/live transports/continuous watcher/backups are still unverified or gated.

Final read-only operator client status passed. Artifact safety scan read only the nine approved fresh keys (including the owner's derived prefix), found **zero plaintext values** in changed code/evidence, and reconfirmed frozen packets/proxy/override and original-video hashes. [Scan](test-evidence/milestone-e-access-01/artifact-safety.json). Continuous folder intake was not started; its one-shot initial-scan omission was fixed locally and covered by the added test. No further deployment configuration changed after the approved completion window.

## Milestone E actual approved deployment — 2026-10-31

Original E-INFRA-SETUP-01 and E-LOCAL-AUTH-01 were explicitly granted; three frozen digests matched and receipt preceded expiry. [Evidence directory](test-evidence/milestone-e-deploy-01). No existing credentials were read. New keys/volumes/node_modules/runtime stay ignored; no secret values were printed. Existing supervisor code and completed pilot remain unchanged.

| Actual command/check | Actual outcome |
| --- | --- |
| `node scripts/install-studio-approved.mjs` wrapping the packet's exact pulls/npm ci | Exit 0; n8n pull 79.760 s, PostgreSQL pull 12.421 s, npm ci 0.518 s. All fourteen installed versions match approved lock. Image manifests/content digests retained; Docker performs layer digest checks and npm uses lock integrity. No detached-signature verification claimed |
| `node scripts/create-studio-local-secrets.mjs --approved=E-LOCAL-AUTH-01` | Exit 0; nine new files, no values logged. ACL metadata: inheritance disabled, two explicit owner/SYSTEM ACEs, zero inherited ACEs. Default sandbox could not enumerate protected key directory; outside inspection used ACL metadata only |
| Approved `docker compose ... up -d --pull never` | Exit 0; only new `socialstudio` project resources created. PostgreSQL/application internally healthy; actual n8n `--version` 2.45.7 and internal readiness HTTP 200 |
| `tests/orchestrator/constraints.sql` via actual new PostgreSQL `psql` | Exit 0; four assertions passed: cross-brand FK rejection, invalid status rejection, application cannot forge migration history, media hash change invalidates approval. Own fixture transaction rolled back; no user data deleted |
| Actual migration/seeds/roles | Version 1 checksum `4766440a63d2e3850aa0a30aeac40bebda88218e7fd3ff1ba3b53a9c4a7f8d3c` matches local SQL; six brands/18 mock destinations. Both runtime roles non-superuser/non-createdb/non-createrole; application cannot connect to n8n database |
| `node /studio/services/studio-runtime/in-container-checks.mjs` in actual API container | **13/13 passed** against actual API/PostgreSQL using only new keys: health, authentication/roles, malformed input/path, paid-AI refusal, durable nonce replay rejection, tampering and expiry. [Receipt](test-evidence/milestone-e-deploy-01/deployed-auth-checks.json). These are not n8n workflow executions |
| Host port/readiness | **FAILED**: requested HostConfig mappings exist; effective NetworkSettings.Ports are empty; Windows GETs cannot connect. Internal-only network provides no default-gateway network for Docker port publication. Services remain isolated; no unapproved workaround applied |
| Proposed fixed proxy fixture + combined Compose `config --quiet` | Two local HTTP tests passed, Compose syntax passed; no proxy/network deployment or actual host-access pass yet |
| Full existing-video n8n/PostgreSQL workflow test | **NOT RUN**. No local owner/workflow bootstrap, no native worker, zero workflows imported/executed. Requires separately approved [E-LOCAL-ACCESS-01](ORCHESTRATOR_LOCAL_ACCESS_APPROVAL.md) |

Complete image compressed payload upper bound 395,978,162 bytes; small npm closure is below the remaining download budget. PG volume 81,160 KiB, n8n volume 16 KiB observed. Whole-host free space decreased 742,957,056 bytes, with concurrent-application caveat; no 6 GiB storage increase detected. Setup began 06:13:43.085 UTC; original limit 07:43:43.085. No further original-grant setup expansion after that deadline; the access proposal separately requests a bounded extra window. Zero paid API calls/public posts. No peak RAM/GPU measurement or complete pipeline acceptance claimed.

Initial port-preflight command ended nonzero because its final listener query found none; manifests succeeded. A later sandbox CIM listener query was denied and repeated outside with permission, confirming no listeners. These are recorded diagnostics, not installation or security-test passes. Historical local tests below remain separate.

## Milestone E local implementation — 2026-10-31

Actual checks use existing approved tools only. **Latest run: 34/34 passed, 0 failed/skipped, exit 0** at 2026-10-31 01:14:24–01:14:25 UTC. [Receipt](test-evidence/milestone-e-local/unit-2026-10-31T01-14-24-353Z.json), [TAP](test-evidence/milestone-e-local/unit-2026-10-31T01-14-24-353Z.tap). The initial local suite passed 29/29 after fixing process cleanup. Fixtures use public fictional keys, ephemeral loopback HTTP servers and isolated new runtime files, not service credentials or PostgreSQL substitutes claimed as deployment.

- Real adapter FFprobe + full FFmpeg decode: **passed**, 4.7819414 s; original pilot unchanged, 60 s, 1080x1920, H.264/AAC, 21,303,869 bytes, SHA256 `48fb3d02aecb4e83c43654d111194fd44870011c229a8b7387d8a83096858528`; 32 SRT cues passed structural/timing checks. [Receipt](test-evidence/milestone-e-local/pilot-validation.json). No new render or peak RAM/GPU measurement claimed.
- HTTP role/auth/malformed JSON/health fixtures, path and schema rejection, signed-envelope content/expiry checks, stable-folder scanner, deterministic three-platform receipts, unknown-outcome handling, mock AI fallback/failure and fixed local child exit/cancellation/timeout tests: actually executed.
- Twelve generated workflow exports passed static graph/reference/no-shell/no-embedded-credential assertions. **Import/runtime compatibility unverified.** Node syntax checks passed. Historical supervisor 77 tests were preserved, not rerun or counted here.
- Initial process-tree tests stalled because synchronous Windows taskkill was blocked by the sandbox. Only identified test PIDs/descendants were terminated with scoped tool escalation. Async bounded cleanup now returns explicit cleanup failure; the worker stops on uncertainty. A complete outside-sandbox local rerun passed. The interrupted run is not a passing suite.
- A subsequent Compose config check accidentally omitted `DOCKER_CONFIG`; Docker attempted its default owner config and the sandbox denied access. No values were returned; no escalation/retry against that file was made. The command was corrected to the new empty project config. This denied attempt is recorded rather than reported as credential-free success.

| Requested deployed acceptance | Current evidence |
| --- | --- |
| Migrations/constraints, brand foreign keys and database roles | SQL fixture prepared in `tests/orchestrator/constraints.sql`; **NOT RUN** |
| Durable intake deduplication/existing import/state transitions | Contracts/worker code and native file decode tested; actual PostgreSQL behavior **NOT RUN** |
| Approval creation/rejection/hash-change invalidation/expiry | Control roles tested locally; real SQL/API state **NOT RUN** |
| Scheduling + YouTube/Instagram/Facebook mock workflow dispatch + duplicate prevention | Three provider functions tested; actual n8n/PostgreSQL dispatch **NOT RUN** |
| Retry, unavailable services, interrupted workflow/database restart persistence | Recovery code prepared; deployed outage/restart cases **NOT RUN** |
| Missing credentials/invalid destinations/malformed webhooks/AI failure and fallback | Local negative/fixture tests executed; real nonce receipt/replay uniqueness **NOT RUN** |
| Real 12-workflow end-to-end existing Horror MP4 test | `scripts/studio-e2e.mjs` requires real n8n webhook executions, database receipts and explicit mock test decision; **NOT RUN**, both E grants pending |

No Social Studio service is running, no migration applied and no workflow imported/executed in this task. No publishing or external account integration. [Exact installation/auth scope](ORCHESTRATOR_SETUP_APPROVAL.md).

## Milestone E foundation — 2026-10-30

Actual checks: tracked baseline `4fdefbb`, preserved untracked owner note; native FFprobe reconfirmed the existing Horror MP4; Docker server/Compose metadata and cached image versions inspected with a fresh empty Docker config (no saved auth access). Default sandbox denied Docker pipe access; the same read-only inspection succeeded through tool escalation. A Go-template quoting attempt failed before metadata lookup and was replaced with a labels-only query. No containers/images/host settings changed.

`docker compose -p socialstudio -f infrastructure/docker-compose.yml config --quiet` passed. Public npm metadata resolved exactly 14 pinned packages (431,898 unpacked bytes), lock SHA256 `a1ce597ee3ea17042f9ba0fe46cdbd7b7087d6a5b7218fa838c0b98335ea331a`; **no package payload or dependency install**. Node syntax checks and `git diff --check` pass. Initial public metadata fetch was denied by the network sandbox; identical metadata-only retry succeeded outside it without credentials.

Database migrations/constraints, service health, workflow import/execution, PostgreSQL persistence and end-to-end acceptance are **NOT RUN**. Neither application unit mocks nor the historical supervisor tests will count as the required deployed n8n/PostgreSQL acceptance. [Approval packet](ORCHESTRATOR_SETUP_APPROVAL.md).

## Finished Horror pilot — 2026-10-30

**Actual MP4 exists and passed automated validation and sampled visual review.** [Render report](test-evidence/openmontage-pilot-render-01/render_report.json), [independent validation](test-evidence/openmontage-pilot-render-01/validation.json), [upstream final review](test-evidence/openmontage-pilot-render-01/final_review.json). Owner listening/playback approval is pending; nothing published.

| Actual result | Evidence |
| --- | --- |
| Final output | `generated-videos/horror/pilot-001/final/horror_pilot_001.mp4`; 21,303,869 bytes; SHA256 `48fb3d02aecb4e83c43654d111194fd44870011c229a8b7387d8a83096858528` |
| Format | FFprobe: MP4, 60.000 s, 1080x1920 (9:16), 30/1 fps, H.264 yuv420p and AAC audio |
| Decode/motion | Entire final video decoded successfully. No reports from blackdetect (`d=0.10:pix_th=0.02:pic_th=0.99`) or freezedetect (`n=-50dB:d=2`) |
| Narration/music/effects | Existing completed mix reused. Decoded output correlates 0.996691 with it; loudness -16.56 LUFS, true peak -0.83 dBTP, no clipping. This proves mix preservation; it does not replace listening |
| Burned captions | 32 cues styled as ASS. Eight actual final-video samples inspected: expected text visible/readable, safe margins, no clipping. Phrase timing measured; intra-phrase timing interpolated. No forced alignment or ASR test claimed |
| Production engine | Actual upstream cinematic assets/edit/compose checkpoints, video_stitch crossfades and video_compose FFmpeg render/self-review passed. Proposal/runtime preserved; actual motion ratio 1.0. No publishing checkpoint |
| Render duration | Successful stitch 51.080 s; successful final composition/self-review 194.927 s; sum **246.007 s (4 min 6 s)**. Source-select preprocessing separately 97.241 s. Debugging, prior narration and approval waits are excluded from this render figure |
| RAM | Largest benchmark-reported single FFmpeg process maxrss 1,752,780 KiB = 1,794,846,720 bytes (~1.67 GiB). Not a sum of all application/process RAM |
| GPU | 45 whole-GPU observations during composition: peak used 1,382 MiB, utilization 25%. Includes desktop/other applications; not attributable job VRAM. Renderer used CPU libx264. Minimal-environment GPU sampler was unavailable, so an independent read-only hardware sampler supplied these observations |
| Acquisition | Exact approved three smaller clips: 11,459,413 bytes; completed at 18:34:57 UTC inside 18:34:53.775-18:54:53.775 window. Six-clip cumulative payload 203,225,651 bytes, below 200 MiB. Item-specific licences/provenance saved; original score/effects reused |
| Costs/scope | USD 0 production API charges; no credentials, installations/models, system changes or public publishing |

Failures and fixes are retained in pilot logs and the [recipe](OPENMONTAGE_RENDER_RECIPE.md): a slow screen-blend filter timed out at 120 s; fast regional blur to new derived files succeeded. One checkpoint attempt preceded completion of its asset preparation and stopped with ENOENT before changing pipeline state; it was retried only after preparation finished. Initial final composition returned `'str' object has no attribute 'items'` because upstream subtitle schema and renderer disagree; omission of the optional style string retained the explicit approved style dictionary and succeeded. No upstream source was changed. Instrumentation caused an unnecessary concat re-encode in this first run; its global codec-copy handling was corrected afterward, without rerendering the delivered video. Actual captured commands/timings remain the evidence.

Limits: some sources are 720p upscaled, stock coverage is suggestive, and phone-screen diffusion is visible. Naturalness and detailed caption synchronization await owner listening. Old supervisor results below remain historical and separate from this actual video evidence.

## Earlier partial OpenMontage pilot assets — 2026-10-30

**Partial production only: no final Horror MP4 and no final-video validation pass.** [Actual evidence/receipts](test-evidence/openmontage-pilot-assets-01/summary.json). The 77 historical supervisor tests were not rerun and do not validate this video.

| Actual check | Result |
| --- | --- |
| Approval | Owner explicitly approved B-PILOT-MEDIA-01 before expiry; packet SHA256 `1ceb499f4c43cf1c6710cc9c02809bece32541d8844afba9ee8536ab31dd938c`. Full-run creative policy recorded in upstream decision_log; publishing prohibited |
| Upstream pipeline | Research (20 actual domain-restricted search queries), proposal, unchanged script and scene-plan artifacts passed upstream checkpoint validation. Assets in_progress; edit/compose not run |
| Stock | Phone 67,569,595 bytes, rain 87,619,514, curtain 36,577,129. Item-specific Mixkit Free licence pages saved; independent SHA256, FFprobe and full decode passed. Phone/curtain 1920x1080, rain 1080x1920 |
| Source detectors | No reports from `freezedetect=n=-50dB:d=2` and `blackdetect=d=0.3:pix_th=0.02:pic_th=0.98`. Sampled frames inspected. Source checks only |
| Narration | 17 actual registry-dispatched piper_tts calls succeeded; installed Piper 1.8.0 / local en_US-ljspeech-medium, length_scale 1.22, sentence_silence 0.15. Summed call wall time 110.821 s; phrase audio 44.266 s; narration timeline 60 s including pauses, speech ends 58.8 s |
| Subtitles | Actual subtitle_gen produced 32 SRT cues; ordered/nonoverlapping/in 60 s. Measured phrase bounds with interpolated intra-phrase timing, not forced alignment. Burn-in and playback sync not checked yet |
| Original audio | Local mathematical drone/pulses, ring, knocks, breath texture and creak. No external recordings/models/services; recipe/seed/hash retained |
| Audio preview | Actual audio_mixer full_mix succeeded with speech/music/SFX, ducking, normalization and 60 s target. Probe/full decode passed; measured input loudness -16.50 LUFS, true peak -1.49 dBTP, LRA 3.60 LU. AAC review copy encoded. This is audio, not a rendered movie |
| Guards | Further 1080p clip rejected before file write by payload cap; smaller-variant command refused at expired session deadline. Continuation is pending separate owner approval |
| Missing continuation grant | Actual command refused before network with ENOENT for the absent owner-grant receipt. Existing manifest hash unchanged; no continuation session created. [Guard receipt](test-evidence/openmontage-pilot-assets-01/continuation-guard.json) |
| Budgets | Source/runtime/pilot storage observed 1,368,932,381 bytes; setup plus video payload accounting including metadata reserve 589,683,295 bytes. Below 3 GiB and 750 MiB respectively. These are retained-file/budget figures, not exact TLS wire traffic. [Budget receipt](test-evidence/openmontage-pilot-assets-01/budget.json) |

Failures: Store Python is blocked by the default filesystem sandbox; the same installed interpreter ran through authorized tool escalation without system changes. The first Mixkit endpoint returned an HTML download modal; it was preserved, then its published allowed-host video URL used. One inline PowerShell edit failed parsing before file operations; a file-based patch corrected it. No failed check is reported as passed.

Still pending: three interior sources, listening/naturalness, playback caption synchronization, final render and its burn-in/audio/black/freeze/rights checks. Production render time and RAM/GPU/VRAM fields are null. No repeated installs, credentials, charges or publishing. Next action: [bounded acquisition time extension](HORROR_PILOT_MEDIA_CONTINUATION.md).

Earlier setup checks below are historical tool evidence, not current production acceptance.

## Tools ready and output workspace created: 2026-10-29

**The approved local installation and tool tests are now complete. The Horror MP4 is not rendered.** The owner explicitly approved B-PILOT-CONTINUE-01; execution used the additional window 22:22:00-22:42:00 UTC and finished installation/preflight within it. No completed source/binary/model installation was repeated.

| Actual current OpenMontage check | Result |
| --- | --- |
| Binary-only resolution | Exact approved corrected command succeeded at 22:27:39.911 UTC. uv's Store-registry discovery first failed with access denial; selecting the already approved venv via process-local `VIRTUAL_ENV`/PATH solved it without changing CLI arguments, interpreter version or Windows permissions. Failed receipts retained |
| Wheel admission/staging | 52 Windows-compatible wheels; 83,637,130 payload bytes. Public PyPI metadata verified before staging, then every downloaded file independently matched frozen SHA-256/size. No source build or optional GPU/model stack |
| Offline installation | Exit 0, finished **22:39:20.253 UTC**, existing project venv only. Piper **1.8.0**, CPU ONNX Runtime **1.31.1**. Owner/global Python packages unmodified |
| Installed dependency consistency | Fresh isolated metadata check finds all 16 queried core/Piper packages; offline `pip check` exits 0: "No broken requirements found." [Verification receipt](test-evidence/openmontage-tools-ready-01/verification.json) |
| **Real Piper narration** | **PASS**, exit 0. 4.336689s WAV, 22,050 Hz mono PCM16, 191,292 bytes, RMS -17.4000 dBFS. Generation elapsed **7156.7759 ms**, finished 22:39:34.911 UTC. Original local voice; no network/API. Audible level/structure verified; naturalness/intelligibility still needs listening review |
| **Real FFmpeg encoding** | Earlier actual two-second 1080x1920 H.264/AAC + burned-caption test remains valid; fresh probe and full decode exit 0. Its **2961.5802 ms** encoding / **296,008 KiB FFmpeg-reported maxrss** are smoke-test measurements, not Horror production figures |
| Upstream registry | Actual `registry.discover()` and `provider_menu_summary()` pass, completed **22:40:41.492 UTC**. Selected Piper, video_compose, video_stitch, audio_mixer and subtitle_gen report available. Local profile: FFmpeg true; optional Remotion/HyperFrames excluded. Python network calls denied; no provider/credential/service use |
| Registry reporting failure | First preflight computed results but failed printing Unicode through Windows cp1252. ASCII-safe JSON retry passed; source/generation path unchanged, original failure retained |
| Dedicated output | Created `generated-videos/horror/pilot-001/{final,previews,subtitles,scripts,assets,logs}`. Original script, actual voice sample preview and tool receipts saved. Final MP4, video preview and production subtitles are not yet generated. No existing video overwritten |
| Upstream project initialization | Actual `lib.checkpoint.init_project("pilot-001", ..., pipeline_type="cinematic")` exited 0 at 23:04:45 UTC and created the canonical job marker/folders in the requested output tree. No stage or render marked complete; networking denied |

Measured setup file payload plus explicit manifest metadata: **263,699,329 bytes (251.48 MiB)**. Budget accounting including the 128 MiB metadata reserve: **397,917,057 bytes (379.48 MiB)**, below 750 MiB. Source/runtime/pilot storage observed, including the retained pip HTTP cache: **1,141,277,160 bytes (1088.41 MiB)**, below 3 GiB. Preserve the distinction between measured payload, reserved network allowance and exact network traffic.

During Git review, pip's 90,031,488-byte HTTP cache was found at project-root `pip/cache` rather than the intended runtime cache. Its creation was within the recorded approved wheel-download interval. After verifying absolute source/destination containment, no links and an absent destination, moved all 208 files unchanged into `.runtime/openmontage-pilot/cache/pip-http`; no deletion/overwrite occurred. [Relocation receipt](test-evidence/openmontage-tools-ready-01/pip-cache-relocation.json). Storage accounting above includes it. The unrelated untracked `implementationsoofar.md` was preserved and not staged.

Output workspace: `C:\Projects\Manas_Flow\SocialStudio\generated-videos\horror\pilot-001`. Voice preview: `previews\piper_voice_sample.wav`; original narration text: `scripts\horror_pilot_001.txt`. These are real local files; they are not a finished video. Intended final path: `final\horror_pilot_001.mp4` (**does not exist**).

Next blocker: no approved moving-footage inputs exist. [B-PILOT-MEDIA-01](HORROR_PILOT_MEDIA_APPROVAL.md) requests a bounded licensed clip acquisition plus optional explicit full-run creative preauthorization. No additional footage/music/provider service was accessed. **Production render time, production RAM/GPU/VRAM peak and final quality checks remain NOT RUN**, with null values rather than invented measurements. Historical supervisor tests below are not video-engine validation.

## Latest continuation check: 2026-10-29T22:14:08Z

**Setup approval exists, installation is incomplete.** Checked owner approval/history and current files; the latest generic continuation did not approve B-PILOT-UV-FIX-01. No changed resolver command, installation, download, credential access or external service call ran.

Actual command `node scripts/verify-openmontage-local.mjs` rehashed the cached FFmpeg archive and voice model (both match), confirmed FFmpeg 9.0.2, reprobed and fully decoded the existing two-second 1080x1920 H.264/AAC MP4 (all exits 0), and queried project-venv package metadata with isolated Python. All 16 queried engine/Piper distributions were absent; no dependency lock, Piper executable/narration result or final Horror MP4 exists. This is a **new read-only verification**, not a new encoding/render or narration pass. [Actual receipt](test-evidence/openmontage-continuation-20261029/receipt.json).

An initial inline command failed shell quoting before checks ran. The file-based sandbox launch then failed; the identical read-only retry through tool escalation completed successfully with a cleared environment. No permissions/settings were changed. The completed supervisor's 77 local tests below remain **historical supervisor evidence**, not OpenMontage production tests.

Blocker: [B-PILOT-CONTINUE-01](OPENMONTAGE_CONTINUATION_APPROVAL.md) requests the one-flag correction and a bounded additional 20-minute setup window, preserving all cumulative download/storage/software constraints. The original setup window ends 22:17:56 UTC. No further setup execution is inferred from "continue". Real narration, OpenMontage registry preflight, 60-second production/quality/resource checks remain **NOT RUN**. No final production time or GPU/VRAM peak is claimed. Additional motion footage remains a separate permission/input prerequisite.

## Approved setup execution: 2026-10-29

Owner explicitly approved B-PILOT-SETUP-01. The frozen packet SHA-256 `eff54d5d35aa8515df023e5a7a84eac4564136117107fbc20056d73ce4209dbe` and requirement-input SHA-256 matched. Fresh destinations were absent. Setup window: **21:17:56-22:17:56 UTC**, maximum 750 MiB downloads / 3 GiB new storage / zero paid API calls. No credential, global PATH, Windows setting, service or publishing operation occurred. Advanced A work remains deferred.

| Actually executed | Outcome |
| --- | --- |
| Local archive/extraction | Existing pinned source materialized into `openmontage`; no clone/fetch/submodules/LFS or upstream modification |
| Python 3.11.9 venv creation | Exit 0, fresh `.runtime/openmontage-pilot/venv`; owner/global packages untouched. No OpenMontage/Piper dependencies installed yet |
| Exact approved uv compile command | **Exit 2 before dependency resolution**: uv 0.9.6 rejects `--only-binary :all:` together with `--no-build`. Original logs retained. Requested removing only the redundant `--no-build` in [B-PILOT-UV-FIX-01](OPENMONTAGE_SETUP_ERRATA.md); corrected command NOT RUN, pending owner approval |
| Portable FFmpeg archive | 114,768,076 bytes, approved SHA-256 matched during transfer and independent disk hash pass; entries inspected before project-local extraction; FFmpeg/ffprobe version output confirms **9.0.2** |
| Piper voice/config/card | All downloaded from the pinned revision. Model 63,531,379 bytes, approved SHA-256 matched in transfer and independent disk pass; config 4,972 bytes and card 517 bytes match pinned-content checks, their observed SHA-256 retained |
| Voice redirect check | Initial narrow host guard stopped before model bytes. Metadata-only check identified `us.aws.cdn.hf.co`, within the already approved Hugging Face public-CDN clause. Same URL/revision/hash resumed; FFmpeg was hash-checked/skipped, not re-downloaded |
| Real FFmpeg encoding | **PASS**: 2.000s MP4, 1080x1920, 30fps, H.264 yuv420p + AAC mono 48kHz, 1,219,656 bytes; tone audio and burned SRT caption. Encode subprocess elapsed **2961.5802ms**, FFmpeg benchmark rtime 2.870s; reported maxrss **296,008 KiB** (FFmpeg process only) |
| Independent ffprobe/full decode/frame | Both exit 0; resolution/codecs/audio/duration checks passed. Extracted 0.7s PNG inspected: burned caption visible. This is a synthetic moving test pattern, **not the Horror video** |
| Piper narration test | **NOT RUN / BLOCKED**: voice files ready, Piper package/dependencies not installed because exact compile command failed. Prepared test helper is syntax-checked only; no narration WAV claimed |
| Helper syntax | All six setup/download/metadata/smoke helper files passed `node --check`; not a substitute for unrun runtime tests |

Actual smoke output: `C:\Projects\Manas_Flow\SocialStudio\.runtime\openmontage-pilot\smoke\encoding-smoke.mp4`. Preview: open that local file; frame at `smoke/encoding-preview.png`. Full receipts, probe JSON, encoder logs and hashes are retained under `.runtime/openmontage-pilot`; report copies are in [setup evidence](test-evidence/openmontage-setup-01/summary.json).

Verified downloaded file payload totals **178,304,944 bytes (170.04 MiB)**. This is file payload, not a claim of exact TLS/header traffic. Resolver failed before network resolution; the only additional inspection was the small approved voice redirect. Current measured source/runtime storage: **713,485,763 bytes (680.43 MiB)**, below 3 GiB. Both figures are timestamped observations, not a future allowance expansion.

**Setup is partial, not complete.** No actual registry preflight, naturalness/listening acceptance, Horror production render or production RAM/GPU benchmark has passed. Additional footage/music or external-service access requires separate approval under the owner's latest instruction. No public publishing.

## Current local pilot inspection: 2026-10-29

Advanced Milestone A hardening is deferred by the owner; its 77-test evidence below is preserved and does not imply A acceptance. No supervisor code changed in the pilot preparation.

| Actual inspection | Result / limitation |
| --- | --- |
| Existing Git source | Clone HEAD 195eab24478dc9363326aec437aefc3701635ddf; only `.git` present, no working checkout. Objects read with per-command `safe.directory`, no persistent Git configuration change |
| Node/npm/uv | node --version: v22.19.0; npm.cmd --version: 10.9.3; uv --version: 0.9.6 |
| Python package metadata | Existing Store Python 3.11.9, isolated standard-library importlib.metadata query; no engine or installed third-party package imported. pip 26.2.1, NumPy 1.26.0, Pillow 9.5.0, requests 2.32.5 found. PyYAML/pydantic/jsonschema/dotenv/Google/OpenAI/Backlot/WebSockets/Piper/ONNX runtime missing in inspected locations; Pillow below upstream minimum |
| Existing GPU inventory | nvidia-smi: RTX 4060 Laptop, 8,188 MiB, driver 591.91. No production load/peak usage measured |
| FFmpeg/Piper discovery | No ffmpeg/ffprobe/piper on inherited PATH; no claim of exhaustive host absence |
| Existing Chrome/Edge | Standard installed executable paths present; not launched, no browser profile/credential access |
| Pilot proposal/preparation checks | JSON target/zero-spend/no-publish/proposal status validated; installation-input SHA-256 matched; six generated paths ignored and job config retained; 21 Markdown files / 123 local links checked; git diff --check exit 0 |
| Preservation regression | Unchanged supervisor suite rerun with existing check harness: 77 passed, zero failed/skipped, 3436.9182 ms. Separate Node fixture canary exit 0, 71 ms. This is not OpenMontage execution; raw receipts/TAP retained in `.runtime/checks/419c9af8-7ef2-4eb7-8dee-7e2a900bf60f` |
| Approved authentication metadata command | Exact helper SHA-256 matched, clock 2026-10-29 20:31:58 UTC before 2026-10-31 expiry, exit 0, wall 0.9887893s. No secret values retained, network/auth/config changes; [sanitized receipt](research/auth-metadata-A-AUTH-METADATA-01.json) |

Initial clone Git reads hit an ownership guard; using a one-command exception for the explicitly selected owner clone allowed read-only object inspection. The Python installed-app directory was denied inside the sandbox; the explicit read-only executable-discovery/standard-library metadata retries succeeded through tool escalation. No permission, execution policy, ownership, PATH or installation was changed.

OpenMontage imports/registry preflight/voice/stock/music/render/MP4 QA/resource benchmark: **NOT RUN**, pending setup approval. The creative/config files are proposals, not canonical completed stage artifacts. No installation or render success is claimed.

Preparation evidence: [summary](test-evidence/openmontage-preparation/summary.json), [preservation regression receipts](test-evidence/openmontage-preparation/supervisor-regression-receipts.json) and [actual regression TAP](test-evidence/openmontage-preparation/supervisor-regression.stdout). The pinned Git tree contains 2,209 entries, 89,488,419 blob bytes and zero symlinks/submodules; only object metadata was read, no working tree was extracted.

Initial Git staging exposed the older global `outputs/` rule hiding the new empty brand-output placeholder. Added a narrow parent-directory exception, then verified all six synthetic generated-media paths remain ignored and all five intended config/placeholders are unignored. No force-add or generated media inclusion was used.

## Preserved Milestone A baseline evidence

Latest local check: **2026-10-29**, existing Node **v22.19.0**, Windows. **77/77 tests passed**, zero failures/skips; suite duration **3065.2682 ms**. Source and command receipts are retained in [the A-03 evidence summary](test-evidence/milestone-a-authority/summary.json), [receipts](test-evidence/milestone-a-authority/receipts.json) and [raw TAP](test-evidence/milestone-a-authority/tests.stdout). The previous 51-test evidence below is preserved.

## A-03 local continuation

Actual command: `node scripts/check-supervisor.mjs`. All four child commands exited 0: the 77-test suite, fixed-process demo, disabled live status and metadata `--plan`. Child environments contain only SystemRoot, fixed PATH and workspace TEMP/TMP. No package manager, install, credential-read branch or network/model call ran.

The expanded suite includes the existing 51 checks plus 21 pinned-store checks and five synthetic metadata-parser checks. Store tests run a real fixed Node child through disk-backed authority, reopen queue/state paused, preserve one-use grants/replays/revocations, reject changed deployment pins/raw fallback/migrations, deny modified/expired documents and unsafe roots/baselines/projects/grants, and reject missing/malformed/oversized/hard-linked files and junctions. Tampering during execution prevents accepting otherwise valid fixture output. Metadata tests use fictional strings; no real credential file was loaded.

The separately executed demo was still a **simulation**, with actual Node subprocess exit 0, duration **61 ms**, and independently verified 30-byte `canary.txt`, SHA-256 `fe5e08c8ef37a99a04e5c65d83d7bb15718f0308e418080d528aa31772acd351`. Job ID: `142e944c-7077-443e-9c4c-dc73de0eba6f`. [Demo output](test-evidence/milestone-a-authority/demo.stdout), [status](test-evidence/milestone-a-authority/status.stdout) and [metadata plan](test-evidence/milestone-a-authority/metadata-plan.stdout) are retained. Actual Telegram/Codex requests: **0**. Model spend: **USD 0**. Protected operator deployment and Milestone A acceptance: **false**.

The local code does not establish actual operator/worker ACLs or a protected anti-rollback anchor. It does not test live Hermes ingress, unrestricted descendant termination or credential/broker compatibility. A-03 deployment and A-04 through A-08 remain open. See [AUTHORITY_STORE.md](AUTHORITY_STORE.md).

## Preserved first core checkpoint

| Check actually run | Outcome | Scope |
| --- | --- | --- |
| Initial node --test --test-concurrency=1 test/supervisor.test.mjs | Exit 0, 44 passed, 0 failed/skipped | First local controller implementation; raw evidence retained in ignored .runtime/test-results |
| Final core suite after boundary review | Exit 0, 51 passed, 0 failed/skipped | Includes empty-directory/hard-link validation, stream-boundary redaction, signed bridge and bounded Codex event parsing |
| Repeatable node scripts/check-supervisor.mjs | Exit 0; 51 passed, 0 failed/skipped; TAP duration 2290.5188 ms | Runs tests, demo and status with minimal child environments; no restore or network/model call |
| Separate fixture canary via CLI demo | Exit 0; actual fixed Node subprocess exit 0; independent artifact check passed; sanitized result delivered to fixture sink | **Simulation**, not actual Telegram/Codex. Latest worker duration 60 ms; 30-byte canary.txt SHA-256 fe5e08c8ef37a99a04e5c65d83d7bb15718f0308e418080d528aa31772acd351 |
| CLI status | Exit 0 | live_dispatch_enabled=false, telegram_integration_verified=false, codex_authentication_used=false |
| Installed Codex version/help | codex-cli 0.165.0; supported exec flags verified | No login/auth-status/inference request |
| Standard service listener inventory | No 5432/5678 listener observed | Does not prove PostgreSQL/n8n absent or configured on those ports |
| Hermes PID record | Recorded PID 10392 was running | Does not verify process ownership/transport health or Telegram authorization |

Evidence: [tests TAP](test-evidence/milestone-a-local/tests.stdout), [demo JSON](test-evidence/milestone-a-local/demo.stdout), [status JSON](test-evidence/milestone-a-local/status.stdout). The evidence summary hashes the implementation/test files and explicitly records milestone_a_accepted=false and zero real Telegram/Codex calls.

The demo baseline of repeated `a` characters is a synthetic fixture value, not a Git commit. Real accepted-baseline/patch/commit tracking must be exercised in the live canary; the repository's actual implementation checkpoints are separate Git history.

The 51 checks cover real fixed fixture subprocess success/failure/output limits, independent checks rejecting a forged worker success claim, private-owner authentication logic, unsupported/forwarded/edited/stale messages, replay persistence, one-use/changed/expired/revoked grants, single dispatch, stop/timeout, interrupted restart, corrupt/truncated journals, locks/capacity, notification failure, path/link rejection, immutable authority, signed-envelope tampering and Codex JSONL bounds. They do not prove a protected live approval store, unrestricted descendant termination, deployed network/RAM/GPU boundaries or model credential isolation.

## Not run — acceptance gates remain open

- Actual Telegram -> harmless approved Codex task -> independent validation -> Telegram result.
- Real Codex authentication/model/budget/broker, effective live sandbox and escape probes.
- Deployed Hermes allowlists/tool restrictions, ingress security, replay, restart and outage behavior.
- Actual Windows process-tree cancellation/orphan reconciliation for arbitrary tools.
- OpenMontage installation/runtime, Horror video render, rights/output checks, RAM/GPU/VRAM benchmark.
- n8n/PostgreSQL integration, Drive OAuth, official platform uploads, service startup, backups/restore and continuous operation.

**Milestone A is not accepted. No finished Horror video or production success is claimed.** Tests and documentation are not approvals to install, connect accounts, use credentials, incur charges or deploy protected changes.
