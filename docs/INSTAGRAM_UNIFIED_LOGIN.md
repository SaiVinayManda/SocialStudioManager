# Verified Unified Login setup and state fix

Current owner direction supersedes the earlier standalone Instagram Login
assumption. Actual Meta dashboard inspected read-only on 2026-11-04:

- App **SocialManager**, App ID `1113677711534120`.
- Instagram use case explicitly says new apps use **API setup with Unified login**.
- Selected configuration `1470617858256660`, **Instagram API (Unified Login)**,
  Instagram Login Compatible; variation General; system-user access token (SUAT).
- Registered selected redirect:
  `https://minute-fusion-fridge-knee.trycloudflare.com/instagram/callback`.
- Dashboard login template uses `https://www.facebook.com/dialog/oauth`,
  `config_id`, `override_default_response_type=true`, `response_type=code`,
  `display=popup`, `prompt=login` and the literal `<STATE>` placeholder.
- The selected configuration includes `instagram_basic` and
  `instagram_content_publish`; it also currently includes ads, messaging and
  comments permissions. The connector invokes none of those unrelated APIs and
  does not edit or expand the configuration. Owner reviews Meta's consent screen.
- Both required Instagram permissions are **Ready for testing**. Use the owner's
  own Professional account with its applicable app/tester/asset role. No App Review,
  business verification, live-app publishing or new permission request was started.

The old tunnel was not still running: its saved record confirms automatic stop
at **20:05:58.017 UTC**, essentially its 20:05:58.011 UTC deadline. Inspection
at 21:40 UTC found neither the tunnel process nor port 8791/8792 listeners. A URL
remaining registered in Meta does not make that expired hostname reachable.

## Corrected implementation

The private setup's **Connect Instagram** button now defaults to `unified`, with
the verified App ID/configuration prefilled and immutable. Owner enters the Meta
App Secret locally and a supported Graph version. It constructs Meta's observed
authorization URL with a cryptographically random 32-byte state on each click;
no `<STATE>` or pre-generated state is copied out of a template.

State is retained in local memory, expires after ten minutes, is bound to the
current setup attempt, and is consumed before code exchange. New clicks invalidate
earlier states. Mismatches, expired state, callback replays and reuse of a previously
consumed code hash are rejected before another token request. Local POST requires
the setup cookie, exact origin and CSRF token. Callback remains isolated from the
secret-entry page and all application/media/publishing routes.

Code exchange uses the Meta app's Graph Facebook endpoint. Token debug verifies
application identity, validity and actual Instagram scopes. The connector reads
the selected Instagram asset from granular token grants, or requires the owner's
explicit Instagram asset ID when it cannot identify exactly one. It does not
guess an account, use the Facebook principal as an Instagram ID or depend on a Page.
GET-only account/type/publishing-limit checks precede encrypted vault save and
Horror account association. Never-expiring SUAT is recorded with a null expiry;
no standalone Instagram long-token refresh is performed on a Meta token.

`node scripts/test-instagram-local.mjs`: **26/26** tests passed, including generated
state uniqueness, state mismatch, callback replay, repeated-code rejection,
exact configuration pinning, read-only Unified transport and fake token inspection.
Actual account authorization remains pending, not claimed from fixture results.

## Replacement tunnel is a separate owner action

The previous grant allowed exactly one tunnel for 30 minutes and has been consumed.
The prepared replacement uses the already verified cloudflared binary and same
callback-only routing, shutdown guard and limits. No second tunnel, download or
public endpoint has been started. Fresh owner approval is pending before launch.

After approval, supply the newly allocated HTTPS callback and verify TLS/routes;
owner registers that exact URL in Meta, then opens the fresh private local setup
link. Read the registered value back from the dashboard before claiming registration.
Stop the replacement immediately after connection/verification or its deadline.
Do not reuse the stale URL above as a working endpoint or provide an unbacked
Facebook authorization link containing an arbitrary, untracked state.
