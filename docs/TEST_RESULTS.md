# Actual verification results

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
