# One existing Horror Reel — Instagram connection

**Superseded connection instructions:** the actual app uses Unified Login and
HTTPS. Follow [the verified Unified Login guide](INSTAGRAM_UNIFIED_LOGIN.md).
The Facebook configuration ID and HTTP redirect below are historical evidence,
not current setup instructions. Publishing remains unapproved and disabled.

Scope: owner request of 2026-11-04. Connect the owner's Professional Instagram
using Facebook/Meta; reuse the existing video and PostgreSQL/n8n approval pipeline.
No AI Brain, OpenMontage, video editing, installs, other destinations or paid calls.

## Selected content

- Existing job: `ede518d3-e3c3-42b2-9eb9-b4af0965b536` (recheck against PostgreSQL).
- File: `generated-videos/horror/topic-6135ef9b54a8828f41231d84d849ec1c/final/video.mp4`.
- SHA-256: `499b3adda87757b164423a77ce5cd3071c5bd5b05cb8f823ac4b85b0736cc335`.
- 900,936 bytes; existing independent report: 5 seconds, 1080×1920, 30 fps, H.264/AAC.
- Existing saved caption: `The Last Message. An original fictional short.`
- Account: not yet selected. No upload or publication has been approved.

## F1 deployed setup — 2026-11-04

Owner supplied Meta App ID `1113677711534120`, authorized this local deployment
and restricted permissions for only `.runtime/orchestrator/instagram`.
The directory is now owned by the Windows owner, with inheritance disabled and
only owner/SYSTEM full-control entries. Prior directory SDDL was preserved in
`test-evidence/instagram-pilot/credential-directory-acl-before.sddl`; no existing
data was removed or unrelated ACL changed. No credential has yet been stored.

The existing Docker stack is healthy. `node scripts/activate-instagram-pilot.mjs
--prepare-only` applied Instagram migration **004**, restarted the existing API,
imported/published workflow `socialstudio0008` and restarted existing n8n.
Migration 003 belongs to dynamic production and was preserved; an initial
version-collision check stopped before any migration execution.

`node scripts/verify-instagram-setup.mjs` passed all seven deployed checks:
existing migrations/content/caption preserved, no live pilot approval or scheduled
job, rollback-only singleton/digest/mode/grant tests, API 401/disabled-503 gates,
and deployed workflow timeout/no automatic retry. Evidence:
`test-evidence/instagram-pilot/deployed-setup-2026-11-04T19-05-12-313Z.json`.
No Meta requests, uploads or publications occurred in these tests.

The loopback-only OAuth connector is running on port 8791 with the app ID pinned.
Owner must enter configuration ID, supported Graph version and App Secret locally,
complete official Facebook consent and select the linked Instagram account.
After OAuth, `--connect-only` completes the dedicated credential mounts/account
association and GET-only identity/publishing-limit verification. Actual username,
permissions and connection acceptance remain pending. Upload/post approval is
separate and has not been requested or granted.

## Exact Meta setup

1. Open https://developers.facebook.com/apps/ and select your existing app, or
   create a business app supporting Instagram API with Facebook Login. Product
   names can differ in Meta's current dashboard. Do not use Instagram Basic Display.
2. Confirm the Professional Instagram is linked to the Facebook Page you manage:
   https://www.facebook.com/ → switch to the Page → Settings → Linked accounts →
   Instagram. Connecting the Page does not enable Facebook publishing here.
3. Add/configure **Facebook Login for Business**. In its Settings add this exact
   Valid OAuth Redirect URI: `http://localhost:8791/callback`. Use development mode
   localhost support; if Meta rejects HTTP for this app configuration, stop and
   report the exact validation message. Do not create a tunnel/public endpoint.
4. Under Facebook Login for Business → Configurations, create a configuration
   requesting `pages_show_list`, `pages_read_engagement`, `instagram_basic`, and
   `instagram_content_publish`. Select the Page/Instagram assets and a **User access
   token** configuration (the connector obtains the selected Page token via
   `/me/accounts`). Copy its
   configuration ID. The direct resumable upload requires Facebook Login for Business.
5. For an app in Development mode, use a Facebook user with an app role and the
   required Page tasks. Accounts outside app roles can require Advanced Access/App
   Review; do not claim that a Facebook login alone grants API publishing rights.
6. Basic app settings: note **App ID**, **App Secret**, and the app's supported Graph
   API version. Enter the secret only in the local setup form, never in chat or Git.
   Dashboard: `https://developers.facebook.com/apps/APP_ID/settings/basic/`.
7. First approve and apply an owner/SYSTEM-only ACL to the new
   `.runtime/orchestrator/instagram` directory. Its parent is not private enough.
   The connector refuses to start without protected, restricted permissions.
8. Run `node scripts/connect-instagram.mjs`. Open the exact local startup URL it
   prints. Enter App ID/version/configuration ID/secret, continue to Facebook,
   select the linked Page and Instagram, then explicitly choose **Connect … to Horror**.
   The local callback exchanges the OAuth code and performs GET-only discovery and
   publishing-limit checks. The secret/user token remain in memory; only the selected
   Page token is stored in an AES-256-GCM vault with a separate key. Both files are
   inside the restricted, Git-ignored directory. The setup listener expires in 30 minutes.

## Local integration and review

Start the existing Docker Desktop engine. With the existing Social Studio stack
running, execute `node scripts/activate-instagram-pilot.mjs --connect-only`.
This applies additive migration 004, updates only the existing API and Instagram
workflow, retains the installed images with `--pull never`, associates the account
with Horror and returns a GET-only preflight/preview. It does not invoke the
scheduler or approve/upload/post. It restarts existing n8n to load workflow 08;
the generation worker and workflows 01–07/09–12 are unchanged.

The optional Compose overlay gives only the API outbound routing and mounts the
two dedicated Instagram secret files. It adds no inbound ports. Generation workers
receive neither file. YouTube and Facebook remain mock-only. Existing mock
Instagram accounts are retained for historical records and tests.

Show the live verified username/ID/Page, exact MP4/checksum and caption to the owner.
Ask for explicit approval **before any container creation or upload**. Approval
must identify this one Reel, the account/caption/checksum and an expiry no later
than one hour. Never interpret login, connection, test approval or an old mock
approval as permission to publish.

Only after that reply, the authenticated control role may call
`POST /instagram/approve` with `job_id`, `account_id`, `checksum`, `caption`,
`caption_checksum`, `expires_at`, `owner_reference` and
`approve_upload_and_publish: true`. This renews the existing media approval with
an audit snapshot and creates exactly one scheduled `instagram_live` job. The
existing n8n scheduler/worker must verify its checksum and dispatch workflow 08.
No direct transport script or manual Graph Explorer upload is an acceptance test.

Before live dispatch, test migration/approval/claim behavior against a rollback
fixture in the existing PostgreSQL instance; inspect deployed account binding and
workflow settings without creating a container. Those deployed checks have not
yet run. The account and final caption must be re-read after connection.

The pilot is consumed durably before the first Meta mutation. Container/media IDs
persist separately. A timeout, crash, lost response or ambiguous API error requires
read-only Meta reconciliation, never an automatic re-upload/re-publish. A saved
media ID permits permalink recovery with a GET only. A second approval is rejected
by the singleton pilot record. Return the verified media permalink after success.

## Verification recorded so far

`node scripts/test-instagram-local.mjs`: 12/12 offline tests passed (no live
credentials, uploads or Meta requests). Syntax checks passed for connector,
pilot and API. `node scripts/test-studio-local.mjs`: sandbox run 33/35 passed;
two existing Windows process-cleanup checks failed. The normal-permission rerun
passed **35/35**, recorded in `docs/test-evidence/milestone-e-local/unit-2026-11-04T00-11-01-465Z.json`.
Docker engine inspection failed because neither local engine pipe
was available. No SQL migration, workflow deployment or account connection is claimed.

Primary references checked 2026-11-04:

- Meta sample and direct-upload flow:
  https://github.com/fbsamples/reels_publishing_apis/tree/main/insta_reels_publishing_api_sample
- Meta's API collection:
  https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- Publishing guide: https://developers.facebook.com/docs/instagram-platform/content-publishing/
  (direct fetch rate-limited; Meta sample/collection were readable).
- Facebook business login:
  https://developers.facebook.com/docs/facebook-login/facebook-login-for-business/

This is a bounded pilot, not general multi-account credential rotation or an
unattended publishing rollout. Token expiry/revocation requires a deliberate
reconnection; do not silently request additional permissions or switch login modes.
