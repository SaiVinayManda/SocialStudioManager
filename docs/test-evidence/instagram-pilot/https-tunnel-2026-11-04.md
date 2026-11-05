# INSTAGRAM-HTTPS-TUNNEL — owner-authorized execution

Authorization: owner's explicit approval in this conversation under
`docs/INSTAGRAM_HTTPS_TUNNEL_APPROVAL.md`; at most one tunnel, callback only,
30-minute maximum, immediate stop after verified connection; no upload or post.
The original proposal is preserved rather than silently marked as a new grant.

Downloaded official portable cloudflared **2026.10.7**, exactly **55,390,512 bytes**.
Verified SHA-256 before execution:
`2493dbc168923bb3e59e5e7716f71deced92992eea9acd6e9d74f84ac7751343`.
No installer, account, service, firewall, trust-store, DNS or startup changes.

Single tunnel started at **2026-11-04 19:35:58.011 UTC**. Maximum expiry:
**2026-11-04 20:05:58.011 UTC**. The launcher and an independently running,
process-identity-checking watchdog enforce the deadline. Successful GET identity/
permission checks plus local credential confirmation immediately terminate the
public tunnel. Raw cloudflared/provider logs are not printed or persisted.

Exact allocated redirect:
`https://minute-fusion-fridge-knee.trycloudflare.com/instagram/callback`.
Only `127.0.0.1:8792` is forwarded. Secret entry and account confirmation remain
on `127.0.0.1:8791`, not exposed through the tunnel.

Actual TLS and six negative route checks passed at 19:36:27 UTC:
`https-2026-11-04T19-36-27-063Z.json`. Root/setup/select/jobs/videos and an invalid
state callback returned 400, no secret form, and `cache-control: no-store`.
No code, token, credential or media was transmitted in these checks.

The owner has been given the exact redirect and private setup link. Actual
Instagram consent, username/permission verification, encrypted vault save and
PostgreSQL account association remain pending. No post approval was requested.

Runtime process/session status is under the restricted, Git-ignored
`.runtime/orchestrator/instagram/tunnel` directory. This document records startup
evidence, not a claim that an expiring tunnel remains active indefinitely.
