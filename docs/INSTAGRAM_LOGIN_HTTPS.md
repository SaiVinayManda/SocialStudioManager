# Instagram Login correction and HTTPS callback

**Superseded for this app:** read-only dashboard inspection confirmed that it
requires Unified Login. Follow [the verified Unified Login setup](INSTAGRAM_UNIFIED_LOGIN.md).
Standalone Instagram Login remains an explicit compatibility mode, not the default.

The owner's latest instruction supersedes the Facebook Login configuration and
HTTP redirect in `INSTAGRAM_REEL_PILOT.md`. The original advice was incorrect for
the selected Instagram Login setup. No Facebook configuration ID or linked Page
is requested by the corrected connector.

## Implemented connection-only flow

- Instagram authorization: `https://www.instagram.com/oauth/authorize`.
- Credentials: **Instagram App ID** and **Instagram App Secret**, shown in
  Instagram API → API setup with Instagram Login. Parent Meta App ID
  `1113677711534120` is not automatically assumed to be the Instagram App ID.
- Requested scopes: `instagram_business_basic`,
  `instagram_business_content_publish`. No messaging, comments or Facebook scopes.
- Code exchange: `POST https://api.instagram.com/oauth/access_token`, then the
  official long-lived token exchange at `https://graph.instagram.com/access_token`.
- GET-only verification against versioned `graph.instagram.com`: identity,
  Professional account type, both granted permissions and content-publishing limit.
- Owner confirms the returned username before the encrypted credential is saved
  in the previously approved owner/SYSTEM-only directory and associated with Horror.
- No media mutation endpoints exist in the new client. The pilot's approval and
  publishing methods explicitly reject Instagram Login credentials in this scope.
  Facebook/YouTube remain mock and no generation component is changed.

`scripts/connect-instagram.mjs` now requires an explicit HTTPS redirect ending in
`/instagram/callback`. The old Facebook connector is retained as a retired,
non-runnable historical file. No existing credential is overwritten on reconnect.

## HTTPS routing and approval boundary

No existing project HTTPS certificate/listener, mkcert, cloudflared, ngrok or Caddy
was found in the inspected configuration/PATH. No certificate was created/trusted,
software downloaded, tunnel started or external service connected during preparation.

The connector has two separate loopback-only listeners:

- `127.0.0.1:8791`: private setup form, App Secret input, account confirmation.
- `127.0.0.1:8792`: only `GET /instagram/callback`; rejects all setup, media,
  secret-entry and publishing paths. State is unpredictable, one-use and expires
  after ten minutes; arbitrary invalid callbacks cannot cancel a legitimate login.

Use an existing approved HTTPS reverse proxy if the owner supplies one. An
alternative requiring new approval is a **30-minute, callback-only Cloudflare
Quick Tunnel** to port 8792, using the official portable Windows executable.
No account, paid plan, background service, firewall rule, public n8n/API/video
endpoint, automatic startup or system certificate change is needed for that proposal.
Cloudflare terminates HTTPS and can see callback authorization codes/state/IP;
App Secrets and access tokens never go through the public callback listener.

For direct existing TLS, pass `--tls-cert=... --tls-key=...` using approved existing
certificate files; the server sets a TLS 1.2 minimum. Do not bypass browser warnings
or claim a self-signed localhost certificate is accepted by Meta.

For an approved reverse proxy/tunnel, launch:

`node scripts/connect-instagram.mjs --approved-https-proxy --redirect-uri=https://ACTUAL_HOST/instagram/callback`

`ACTUAL_HOST` is a placeholder, **not** a URL to paste into Meta. A Quick Tunnel
hostname exists only after the owner approves and starts the tunnel. Verify the
actual certificate and path before supplying its exact HTTPS redirect. The
connector and tunnel must stop after the agreed window; preserve redacted evidence.

## Owner steps after HTTPS is established

1. Open https://developers.facebook.com/apps/1113677711534120/.
2. Instagram API → API setup with Instagram Login → Set up Instagram business
   login / Business login settings → OAuth redirect URIs. If Meta shows Unified
   Login instead, report that exact screen; do not silently switch login protocols.
3. Paste the exact verified HTTPS callback supplied after endpoint creation and save.
4. In the private local connector link, enter Instagram App ID/Secret and the
   supported Graph API version. Never send secrets/tokens in chat.
5. Complete Instagram consent. In app development mode the account must have the
   required app/tester role and accept its invitation; app review/advanced access
   may still be required for other accounts.
6. Verify username, Professional type and both grants through GET-only API calls;
   confirm **Connect @username to Horror**. Then complete the existing dedicated
   vault mounts/database association with `--connect-only`. No post approval is created.

Actual account verification and Meta redirect acceptance remain pending. No exact
working public HTTPS URL is claimed before infrastructure approval and TLS checks.

Primary references checked:

- https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/
  (direct fetch rate-limited; live login verification remains required).
- https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
