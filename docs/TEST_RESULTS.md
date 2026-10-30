# Actual verification results

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
