# Live supervisor readiness review

Status: the local Milestone A core and fixture evidence are ready for review. Live dispatch remains disabled. No existing credential was read or used. This packet does not request broad administrator or installation access.

## Concrete next request: A-AUTH-METADATA-01

Purpose: determine the existing supported authentication/configuration route so an exact live runtime/broker/canary packet can be prepared without repeating installation or login. The owner explicitly requires approval before accessing credentials, even though tools are already authenticated.

| Field | Exact proposed scope |
| --- | --- |
| Read targets | Existing C:\Users\Vinay\.codex\auth.json, C:\Users\Vinay\AppData\Local\hermes\auth.json and C:\Users\Vinay\AppData\Local\hermes\.env, only if present; this prepared command does not read config.toml/config.yaml or any other credential target |
| Permitted results | Authentication method/provider names, credential-field presence booleans, explicit nonsecret expiry metadata if present without decoding tokens, and normalized numeric Telegram owner/chat allowlist settings |
| Secret handling | Local parsing only. No token/API-key/password/cookie values printed, sent to a model/provider/Telegram, copied into the repo or preserved in logs. Do not decode JWTs, export sessions or inspect unrelated credential stores. |
| Changes/use | No login, refresh, credential creation/import/reuse, account connection, credential modification, config rewrite, process/service restart or model/bot request |
| Limits | One read-only inspection session, maximum 15 minutes, zero network requests and USD 0 charges |
| Expiry | 2026-10-31T00:00:00Z; if the scope or date changes, prepare a new request |
| Evidence | A sanitized field-presence/auth-method summary and next required operator actions; no raw file copy |
| Exact command, from project root | `node scripts/inspect-auth-metadata.mjs --inspect-approved=A-AUTH-METADATA-01` |
| Prepared entry point SHA-256 | `18e0b1d6870d2cf722a1ac25162957c34380f8d2a8fd429e3796aef9fb1f8100` |
| Reversibility | Read-only: no persistent account/system changes to undo. Access already performed cannot be undone; no raw values are retained or sent. |

This request remains **PENDING**. A generic "continue" does not approve credential access. The restriction comes from the owner's current approval rule, "Accessing or configuring credentials", and [AGENTS.md](../AGENTS.md)'s credential boundary. No fixture grant or repository checkbox can authorize it.

The concrete [inspection helper](../scripts/inspect-auth-metadata.mjs) and [pure parsers](../src/supervisor/auth-metadata.mjs) are prepared. `node scripts/inspect-auth-metadata.mjs --plan` prints targets/limits without opening any credential file; only that plan branch has been run. Synthetic parser tests verify that method/provider allowlists, presence booleans and explicit UTC expiry fields do not echo fictional secret values. Unknown formats are reported without raw content. Configured numeric IDs are candidates only: they do not verify Telegram ownership or enroll a user. The CLI flag is not an approval mechanism; actual owner authorization remains external.

The current source/dependency hashes and executed checks are retained in [A-03 evidence](test-evidence/milestone-a-authority/summary.json). No new install is needed. This packet narrows the earlier metadata proposal; it does not add credential use or integration activation.

## Decisions still needed after that inspection

1. Confirm/enroll the actual numeric owner user/private-chat IDs. The current example config has null enrollment; tests use fictional IDs only.
2. Select and review the actual native Windows isolation path. Existing windows.sandbox=elevated is not accepted proof of separated identity, protected filesystem/state, egress/resource limits or full child-tree control. Identify exact changes before seeking an administrator/configuration grant; do not require Docker Desktop by default.
3. Review compatibility of the installed Codex auth method with the credential broker/controlled home. Existing saved user authentication must not become a worker mount or shell environment. If no compatible supported boundary is demonstrated, keep dispatch disabled and propose a reviewed alternative.
4. Approve exact credential use, provider/model/data flow, request/time/token/spend limits and expiry for a single harmless canary. Existing ChatGPT/Gemini subscriptions are not inferred API entitlements or an unattended usage grant.
5. Review the deterministic Hermes extension and protected deployment. Installed source exposes pre_gateway_dispatch before authorization and post_gateway_admission after admission, with exception handling that can fall through. Ensure management failures cannot reach general model/shell tools; do not attach an unreviewed hook or second bot poller.
6. Freeze the accepted task/test/runner/policy/baseline digests and execute the real positive and negative acceptance exercise. Only then ask for Milestone A sign-off and proceed to OpenMontage.

## Harmless canary acceptance specification

One approved task in one disposable job workspace writes a known canary file. The owner launches only the immutable task ID/revision through private Telegram. The controller records original update identity/deduplication, task/grant digests, actual Codex PID/runtime, actual exit, elapsed/usage, bounded redacted logs, changed paths/patch and independently verified canary content/hash. The result notification must be received through the approved existing Hermes transport. No install, destructive operation, model/tool purchase, repository push or publishing is part of it.

Unknown users/chats, forwarded/edited/stale/replayed commands, command injection, changed/expired/revoked grants and unapproved tasks must not start work. Stop/timeout must terminate and verify the full worker tree. Crash/restart remains paused with known reconciliation; provider/channel outages cannot duplicate execution or widen access. Failure/missing evidence keeps A incomplete.

The current local implementation deliberately cannot perform this live exercise. See [SECURITY.md](SECURITY.md), [TEST_RESULTS.md](TEST_RESULTS.md) and [the active backlog](IMPLEMENTATION_PLAN.md) for the distinction between implemented logic and deployment/acceptance work still required.
