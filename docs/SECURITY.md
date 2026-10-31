# Supervisor security and acceptance boundary

## Current E3 local production boundary

The owner-authorised topic pipeline runs fixed, digest-pinned local code with finite storyboard/component/voice/style vocabularies, derived same-brand paths, verified local asset/licence hashes, no shell/URL/FFmpeg-filter parameters from model output, clean subprocess environment and bounded single-job execution. Selected local video decoding limits FFmpeg protocols to file/pipe; unverified assets become explicit original procedural fallback. A persistent job budget, duration/timeout and expiry cap local rendering. This is trusted local media code, not proof of an OS sandbox or permission to run agent-generated code.

The proposed E3 real-AI worker is HTTP-only and disabled: its manifest is BLOCKED_ROUTE_EVIDENCE. Actual blocked-start testing stops before internal-key access/inference. Model/route entitlement and no-paid-substitution enforcement remain unverified; a boolean/zero-cost reservation cannot establish a financial guarantee. Source/route hashes, owner grant, three exact topics/job bindings, max three requests and zero permitted cost are required before activation. Codex/agy executors remain absent; their priority is preserved without unrestricted unattended execution. No old Jev grant was reused. [Blocked packet](E3_AI_APPROVAL.md).

Existing checksum/version approvals and brand-scoped mock destinations are unchanged. Ordinary topic jobs receive no automatic mock-test approval. Real publishing, model credentials/auth changes, installations, public exposure, Windows services and advanced supervisor activation remain separately gated. [Actual test/recovery limits](E3_DYNAMIC_VIDEO.md).

## Current E2 AI boundary

E2 extends the existing authenticated local API, with strict v2 input/output contracts, one active AI attempt, leases/deadlines, budget reservations and immutable brand-bound outputs. Common credential-shaped editorial input/output is rejected before persistence; diagnostics are categories, not raw provider errors. No arbitrary HTTP command/path/endpoint interface is exposed. Only existing internal role keys are reused. The n8n/app/PG network and fixed loopback proxy are unchanged.

Installed Codex/agy headless capabilities are metadata-verified, but safe unattended OS isolation and model auth are not. Their default adapters have no executor and cannot launch an owner-privileged agent. They are not made safe merely by a working directory, plan/read-only flags or prompts. HTTP-only 9Router execution is also off until a digest-bound owner grant and verified no-charge route exist. Existing router listener `0.0.0.0:20128` was observed, not changed; Social Studio calls loopback. No router credential store/saved CLI authentication was read. No perfect prompt-injection or secret-detection claim is made.

The proposed real canary is one scoped task/request, no tools, no render/post, with a persistent request ledger. A lost live-policy lease is manual review and cannot blindly re-execute. The [pending packet](AI_BRAIN_CANARY_APPROVAL.md) defines exact commands, scope digests, risks and non-destructive rollback. It is not granted. Existing A security results below remain historical and do not establish a safe E2 CLI executor.

## Current Milestone E boundary (automated existing-file MVP passed)

The owner explicitly granted all three E packets. Nine fresh keys retain the approved owner/SYSTEM ACL; none logged/committed. Four services run: only the fixed proxy has frontend routing and loopback bindings; n8n/app/database retain internal-only networking. Actual n8n/PostgreSQL mock acceptance, thirteen API security checks and twenty deployed regression scenarios passed. No old credentials, external account or real publishing were used. Fresh owner bootstrap uses the original approved password file's first 64 characters to satisfy verified n8n validation; the file/generator remain unchanged. No Windows power/firewall/service/startup change; native worker is manual. Runtime/media stay ignored. Earlier denied config access remains historical evidence. This is not an accepted A OS sandbox or a complete live-platform production security audit.

The native worker exposes no inbound listener or shell-command API. Fixed tools run with a clean project-local environment and bounded logs/timeouts; tracked process cleanup must succeed or the worker stops. This is not the unfinished A sandbox, and it does not provide hard Windows memory/GPU/network containment. Container isolation and worker guardrails must be verified after approved deployment. All external account access/public hosting/live uploading remain disabled.

## Historical supervisor implementation

Status: local implementation tested; live remote execution disabled. This is not an accepted production sandbox.

## Implemented local controls

- Exact numeric owner and private-chat matching; no enrollment by default. Reject unknown users/chats, bots, inline bots, groups, forwarded/edited/stale messages, attachments and unsupported update types.
- Exact predefined commands, bounded text/IDs/revisions, no arbitrary PowerShell, shell, path, URL, executable or Codex flag from Telegram. Original update IDs are persisted before actions; duplicates/out-of-order replays cannot launch work again.
- Immutable authority snapshots; task, policy, runner and independent-check digests; baseline references; expiring, revocable, one-use fixture grants. Approval requests do not create grants. No paid runs are allowed by this local implementation.
- Read-only disk authority with an externally supplied digest/revision pin, expiry and disjoint registered directories. Deployment binding persists in audit; changed pins, raw-authority fallback and unreviewed state migration are rejected. Recheck before dispatch and final validation. Actual protected bootstrap/ACL/anti-rollback deployment remains pending; see [AUTHORITY_STORE.md](AUTHORITY_STORE.md).
- Bounded durable queue/audit, exclusive controller lock, fsync, hash/sequence and semantic checks; corrupted/truncated audit blocks startup without cleanup. Startup is paused; unresolved launches become interrupted and block dispatch.
- One active fixture process; actual exit/duration; cancellation/timeout; no automatic repair, retry, merge or push. Independent file content/hash/path/size/type/link checks determine success; model/worker-reported test claims are not accepted as evidence.
- Signed bridge envelope verification, original identity checks and replay handling. No signing key is generated/provisioned for a live integration. Fictional test keys/grants are visibly test fixtures.
- Sanitized notifications with controlled IDs/state only; failed notification remains in the outbox without re-running work. Logs exposed to commands are bounded controller facts, not raw model output. Diagnostic redaction occurs after bounded stream reassembly to handle split secrets.

## Remaining live gates

1. Enroll owner user ID and private chat through an approved operator step; verify against an original bot update. Do not infer identity from model text or grant authority from repository files.
2. Inspect/review the active Hermes transport, allowlists, toolsets, hooks and command routes. Existing source has `pre_gateway_dispatch` before authentication and `post_gateway_admission` after admission. A pre-auth hook alone cannot authorize execution; hooks may fail open to normal dispatch, so the installed behavior and model/tool restrictions must be tested before activation.
3. Keep the existing bot's single update consumer. No second `getUpdates` poller, bot duplication, webhook, public endpoint or gateway restart is introduced implicitly.
4. Provision/verify a dedicated restricted execution domain with process-tree termination, filesystem/identity/network controls, protected authority/audit and resource limits outside the model. Node directory checks and a regular venv/worktree are not this boundary. Existing Codex config's `windows.sandbox="elevated"` is a configuration observation, not proof that the required worker isolation passes.
5. Approve credential read/use, data flow, exact model/usage budget and expiry. Keep long-lived credentials outside workers. Do not copy the owner's `.codex/auth.json`, Hermes `.env`, saved sessions, Docker socket or whole home. Supported broker compatibility and effective CLI configuration need real acceptance evidence.
6. Validate the pinned Codex CLI profile with `--ask-for-approval never`, `exec`, `workspace-write`, JSONL, fixed workspace, reviewed final schema, ignored user/rule config and stdin prompt. Never use full access, bypass flags, automatic approval review or an implicit fallback. Ignoring config still does not suppress auth lookup; an isolated controlled Codex home is required.
7. Test real owner-start/status/stop, unknown identity, replay, prompt injection, model/Telegram failure, crash/orphan reconciliation, budgets and notification delivery. Only actual controller/test/process facts can pass Milestone A.

Known limitations: no deployed protected approval store or Hermes adapter, no accepted live launcher/broker, no general Windows child-tree kill primitive, no enforced live network/RAM/GPU limits, no real Telegram/Codex canary and no automatic service startup. The code intentionally refuses live execution instead of treating fixture checks as permission to deploy.

Initially credentials were not opened. The owner subsequently explicitly approved A-AUTH-METADATA-01: the exact helper ran once against its three named authentication files and returned sanitized method/presence/configured-ID metadata only. No secret values were retained, no refresh/login/model/bot request was made and no settings changed; see [the receipt](research/auth-metadata-A-AUTH-METADATA-01.json). Presence does not verify live authentication. That consumed grant is not renewed by the current local OpenMontage pilot; advanced supervisor deployment/hardening is deferred.
