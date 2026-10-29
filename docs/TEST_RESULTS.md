# Actual verification results

Latest local check: **2026-10-29**, existing Node **v22.19.0**, Windows. Source and command receipts are retained in [the evidence summary](test-evidence/milestone-a-local/summary.json) and [receipts](test-evidence/milestone-a-local/receipts.json).

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
