# Supervisor security and acceptance boundary

Status: local implementation tested; live remote execution disabled. This is not an accepted production sandbox.

## Implemented local controls

- Exact numeric owner and private-chat matching; no enrollment by default. Reject unknown users/chats, bots, inline bots, groups, forwarded/edited/stale messages, attachments and unsupported update types.
- Exact predefined commands, bounded text/IDs/revisions, no arbitrary PowerShell, shell, path, URL, executable or Codex flag from Telegram. Original update IDs are persisted before actions; duplicates/out-of-order replays cannot launch work again.
- Immutable authority snapshots; task, policy, runner and independent-check digests; baseline references; expiring, revocable, one-use fixture grants. Approval requests do not create grants. No paid runs are allowed by this local implementation.
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

Credentials were not opened during inspection: only selected nonsecret configuration values/section names and file metadata were read. No `.env` or `auth.json` content was read, no login/auth status call made, and no model/bot request sent. Existing tool authentication is user-reported until an approved live test verifies it.
