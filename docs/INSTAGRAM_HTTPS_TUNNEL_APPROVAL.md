# Pending approval: one Instagram HTTPS callback tunnel

Status: **NOT GRANTED**. No software download, tunnel, public URL or external
account has been created. The corrected Instagram Login connector is implemented
and tested locally. This request covers only its HTTPS callback.

Proposed owner authorization:

- Download official portable `cloudflared-windows-amd64.exe` **2026.10.7** from
  `https://github.com/cloudflare/cloudflared/releases/download/2026.10.7/cloudflared-windows-amd64.exe`.
- Exact size **55,390,512 bytes**; SHA-256
  `2493dbc168923bb3e59e5e7716f71deced92992eea9acd6e9d74f84ac7751343`.
  Verify the digest before execution. Store only under this project's ignored
  `.runtime` directory. No installer, service, package manager, administrator
  configuration or auto-update; preserve unrelated files.
- Run one no-account Cloudflare Quick Tunnel to `http://127.0.0.1:8792`, using a
  dedicated empty project-local home/config and no saved Cloudflare credentials.
  Disable executable auto-update. Maximum lifetime **30 minutes from launch**;
  stop earlier when account connection is verified or the owner cancels.
- Expose only the dedicated callback listener. It serves only
  `GET /instagram/callback` and enforces a one-use, expiring random OAuth state.
  Do not expose the local secret-entry page on 8791, n8n, Studio API, PostgreSQL,
  videos, publishing routes or any unrelated application.
- Cloudflare terminates TLS and may observe the OAuth authorization code/state
  and connection metadata. App Secret/token exchange occurs directly from the
  local connector to Instagram, not through the tunnel. No access token/App Secret
  is returned to the callback response or persisted in tunnel logs.
- No Cloudflare account, subscription, billable resource, Windows trust-store,
  firewall, startup or DNS change. No video upload, media-container creation or post.
- Verify HTTPS certificate/route and provide the actual allocated
  `https://<allocated-host>.trycloudflare.com/instagram/callback` URL before the
  owner pastes it into Meta. The hostname is not known before tunnel creation.
- Then run the corrected private local setup; owner enters the **Instagram** App
  ID/Secret and completes official consent for `instagram_business_basic` and
  `instagram_business_content_publish`. Verify identity/grants with GET-only calls,
  save only the chosen Horror credential in the approved restricted vault, and
  reuse existing PostgreSQL account association. No public publishing approval.

Release metadata was read from Cloudflare's official GitHub release API on
2026-11-04. Metadata retrieval did not download or execute the artifact.

Primary references:

- https://api.github.com/repos/cloudflare/cloudflared/releases/latest
- https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/

If the owner supplies an already approved HTTPS reverse proxy, prefer it and
prepare its exact routing proposal rather than launching this tunnel. Silence or
choosing a preference is not approval for software download/public exposure.
