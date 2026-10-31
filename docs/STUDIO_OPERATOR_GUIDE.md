# Current local Studio operations

**E3 dynamic topic production is operational (2026-10-31).** Three new Horror topics completed real n8n/OpenMontage production, QC and nine mock publications; an ordinary Travel CLI submission also rendered and awaits review. [Submit a new topic and configure brands/assets](E3_OPERATOR_GUIDE.md); [actual outputs, execution IDs, metrics and limitations](E3_DYNAMIC_VIDEO.md). Scripts/storyboards are explicitly fixture-tested; real AI is still blocked pending route evidence and a fresh scoped grant. The fixed-template result below is retained as the regression baseline.

**New generated-video acceptance passed, 2026-10-31.** n8n now triggers the fixed offline five-second Horror template through the existing media worker; real Piper/audio mixing/OpenMontage composition/QC, explicit mock approval, scheduler and all three mock destinations succeeded. [Exact output, execution IDs, receipts, reproduction and recovery limits](GENERATED_VIDEO_ACCEPTANCE.md). No new installation, model service or public post. This is one fixed template, not arbitrary-topic automation. Review job `4c4e90e0-bc2a-4cba-9ef4-2303beedb710` using the existing operator commands below. Do not rerun the Python renderer manually or overwrite its final MP4.

**Existing-video MVP passed actual n8n/PostgreSQL acceptance.** Four services healthy, twelve workflows imported/published/executed successfully, one manually started native worker. [Primary proof](test-evidence/milestone-e-deployed/d9301e97-4f96-4492-a135-c3c71ba3a892.json), [20 deployed regressions](test-evidence/milestone-e-deployed/regression-709b64e7-3bb1-42b9-bd72-a8d79fc44a98.json). Public posts and paid API calls: zero. Do not rerun completed installers, secret generation or bootstrap.

## Review and control

n8n: **http://localhost:5678**. Fresh local owner: `owner@social-studio.local`; password is the first **64 characters** of protected `.runtime/orchestrator/secrets/n8n_owner_password`, matching the verified n8n limit. Read/use it only in the owner's local protected workflow; never paste it into chat/logs. Original file/generator unchanged. No external account is connected.

API health: `http://127.0.0.1:8780/health`; other endpoints authenticate. `node scripts/studio-operator.mjs status`, `brands`, `queue [brand-UUID]`, `review <job-UUID>`, `logs <job-UUID>` load the protected control key internally. `cancel <job-UUID>` requests cancellation. `approve/reject <approval-UUID> <SHA256> <version>` records an explicit operator decision; platform mode remains mock. There is no arbitrary route, shell command or token argument.

Primary accepted test job: **b41d29ed-db4b-44a5-899e-1a8769c727cd**. Its reviewer was explicitly mock-test acceptance, not the owner's creative approval or real-post consent. Original video: `generated-videos/horror/pilot-001/final/horror_pilot_001.mp4`. Test jobs carry `production_settings.acceptance_run_id`; current reports include these labelled fixtures.

## Lifecycle

Always use the two-file topology from the existing project root:

```powershell
$env:DOCKER_CONFIG = Join-Path $PWD '.runtime/orchestrator-inspection/docker-empty'
docker compose -p socialstudio -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.local-access.yml ps
docker compose -p socialstudio -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.local-access.yml stop
docker compose -p socialstudio -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.local-access.yml up -d --pull never
```

These commands target only this new project and preserve `socialstudio_postgres_data` / `socialstudio_n8n_data`. Do not use `down -v`, prune, reset databases, replace keys or touch unrelated resources. One-file startup restores the old inaccessible topology. Scripts invoke the same installed Compose executable directly because clean child environments cannot discover its generic CLI plugin; no tool/config/source change was needed.

Native worker metadata is in ignored `.runtime/orchestrator/worker-process.json`; it was manually started with no Windows service/startup registration. Before starting another, verify that recorded process is absent and there are no unknown children. Manual command: `node services/production-adapter/worker.mjs --config .runtime/orchestrator/worker.json`. Cancel active work first; stop only the verified worker/child tree. Sleep/reboot can stop production until manual restart. Do not register startup or change Windows power settings without approval.

## Intake, approval and recovery

Signed production webhooks are `/webhook/social-studio/intake` and `/reports` on loopback n8n. Envelopes contain nonce/timestamp/body/signature; 60-second expiry, five-second future skew and durable nonce rejection. No reusable token in workflow input. Internal header credential is encrypted in n8n; export JSON contains references only.

Existing-file jobs require registered brand UUID, source type, root/reference, expected SHA256 and idempotency key. Roots are project generated-videos or brand inputs. Traversal/links/drives/UNC/alternate streams/wrong-brand paths are rejected. Intake deduplicates SHA+brand; repeated keys with different bodies fail. Worker concurrency is one, heartbeat five seconds, lease twenty, retries at most three. Output must pass actual probe/decode/hash checks. Approval binds checksum/version and never infers a decision from timeout. Source/version changes invalidate it on detection; pre-dispatch verification checks actual bytes.

Identical AI tasks reuse persisted results; metadata application is idempotent. Scheduler rediscovers durable approved jobs after interrupted n8n Wait execution. Deployed tests verified pending-approval n8n restart and PostgreSQL restart without duplicate mock dispatch. This proves business-state recovery, not same-execution-ID continuation or every hard power-loss scenario. Unknown upload outcomes require reconciliation/manual review, never a blind new upload. Live uploader still needs an immutable verified snapshot design.

Local helpers enforce the recorded local-auth expiry; this is not remote-supervisor revocation or automatic key rotation. Renew approval rather than editing expiry yourself. Advanced Milestone A remains deferred and unaccepted.

## Tests and unfinished integrations

`node scripts/test-studio-local.mjs` passed 35/35; proxy fixture suite 2/2. Real `scripts/studio-e2e.mjs --explicit-mock-test-approval` drove all twelve workflows and preserves earlier evidence on redelivery. `scripts/test-studio-deployed.mjs` passed twenty real scenarios; its scoped restart steps enforce the recorded completion deadline. Do not reset that deadline to rerun gated lifecycle tests. Later read-only audit/local tests changed no deployment.

Folder intake code detects stable files for five seconds, hashes and submits signed webhooks; `--once` now also waits for two observations. `infrastructure/folder-intake.example.json` provides the six-brand local template with key-file references only. It is **not continuously running**. Google Drive is not connected. New OpenMontage renders require an independently digest/expiry-approved local project with completed upstream asset/edit gates; `approved_engine_projects` is empty. Existing-file mode is verified; raw topic-to-video/new-render bridge is not acceptance-tested. Existing upstream and long-form FFmpeg work are preserved.

Official upload transports, OAuth, 9Router, public media hosting/egress and exact live-post consent remain separate gates. Backup encryption/restore, retention cleanup and complete power-loss drills are outstanding. No backup dump, restore, deletion or unattended Windows startup ran. Keep dumps/keys out of Git; restoration replacing data requires approval.

The [original setup packet](ORCHESTRATOR_SETUP_APPROVAL.md) and [access packet](ORCHESTRATOR_LOCAL_ACCESS_APPROVAL.md) remain frozen. Their authored PENDING labels are historical; explicit owner receipts supersede them. All topology/bootstrap/first acceptance/deployed regression changes completed inside the approved windows. Initial plugin/password/readiness failures remain in evidence.
