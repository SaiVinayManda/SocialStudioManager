# E4 one-request real-AI video approval packet

Revised 2026-10-31 after owner-reported OpenRouter/Antigravity connection setup. **PENDING OWNER APPROVAL.** ID: `E4-FREE-CANARY-02`. Supersedes the ungranted `E4-FREE-CANARY-01` proposal because the topic changed; old receipt/approval IDs are rejected.
Expires **2026-11-01T18:00:00Z**. The digest inventory is [E4_AI_SCOPE.json](E4_AI_SCOPE.json); its SHA256 binds this packet, production code, commands, profiles and existing workflow exports. A command-line flag or this proposal cannot grant approval. Earlier Jev, E2 and E3 proposals do not cover this model.

## Specific recommendation and verified public evidence

Use **`openrouter/nvidia/nemotron-3.5-super-vl:free`** through the existing `http://127.0.0.1:20128/v1/chat/completions` service. 9Router must remove only the `openrouter/` routing prefix and send **`nvidia/nemotron-3.5-super-vl:free`** to `https://openrouter.ai/api/v1/chat/completions`.

OpenRouter currently lists zero input/output prices and structured JSON support. Its public endpoint metadata identifies an NVIDIA free endpoint with zero prompt/completion prices and `response_format`, `structured_outputs` and `max_tokens` support. [Model](https://openrouter.ai/nvidia/nemotron-3.5-super-vl:free), [endpoint metadata](https://openrouter.ai/api/v1/models/nvidia/nemotron-3.5-super-vl:free/endpoints). Public receipts are saved in [target-evidence.json](test-evidence/milestone-e4/target-evidence.json). This is a specific candidate, **not verified entitlement on this owner's connection**. The exact proposed model was not advertised by the unauthenticated local model list; the installed router supports explicit OpenRouter-qualified model passthrough, but connection eligibility remains unverified.

The public model page discloses NVIDIA logging of free-endpoint prompts/responses. Only the original fictional topic, public brand instructions and JSON schema may be sent; no personal, confidential, authentication or repository contents.

## Current connection verification

The new read-only API check found 37 advertised IDs: 27 `ag/` entries and only one `openrouter/` entry, `openrouter/typesafe/jev-1.13`; the remaining routes are unchanged. The latter is a decision model with a nonzero input price, not a prose-generation candidate, and will not be tested. No requested inference has occurred. Protected alias/combo/pricing endpoints return 401; no credentials or cookie extraction were attempted. [Connection report](E4_CONNECTION_VERIFICATION.md), [current metadata](test-evidence/milestone-e4/connections/2026-10-31T20-11-27-437Z/metadata.json).

The owner reports both connections enabled. Their live connection identity/entitlement and exact routing controls remain unverified through the unauthenticated interface. Antigravity within 9Router is an OAuth HTTP connector, not the standalone `agy` process. Static code marks it deprecated with a risk notice and configures multiple retries; subscription overages/quotas remain account-specific. It is excluded from this free canary.

## Consolidated approval requested

1. **Minimum non-secret prerequisite:** the owner supplies a redacted route/settings export using the evidence template, confirming the existing OpenRouter connection label, enabled state, exact model forwarding, no substitution/extra retries/plugins, and preservation of the provider-side zero-price restriction. Current user instructions already authorize read-only metadata inspection; no new browser-control permission is requested. Do not supply keys, cookies, tokens, raw auth files or unredacted settings. Approval alone must not be interpreted as proof of these facts. If absent, inference remains blocked.
2. **One inference through that connection:** let 9Router itself reuse only its existing OpenRouter credential for one text-only request to the exact model above, after route verification. The agent does not read, copy, export or inject that upstream credential. No other connection/model, subscription session, Codex or agy execution is allowed.
3. **Local client authentication, only if required:** permission to read an already owner-provisioned dedicated router client token from `C:\Projects\Manas_Flow\SocialStudio\.runtime\orchestrator\secrets\e4_router_client_token`, and send it only as a header to that exact loopback endpoint. It must be scoped to this canary where the router supports scoping. No raw token in commands, prompts, files outside this approved secret location, Git, evidence or logs. This does not authorize creating a key, retrieving an existing secret through the router UI, or changing authentication. If this prerequisite is absent, stop rather than searching for another credential.
4. **One local production acceptance:** apply the reviewed one-run intake readiness record, restart only the existing Studio API to load the reviewed intake gate, and replace the idle manually started native media worker's policy with a one-job Horror policy. Preserve the prior worker configuration/receipt; no service registration, image build, software installation, host/network change or new public port. Trigger the existing signed n8n intake and workflows 02–10/12; use the single AI response both as the inference canary and the video input. Existing workflow 11 remains the unchanged recovery workflow.
5. **Mock-only completion:** generate one new five-second local video, run QC, record the existing checksum-bound **MOCK-PUBLISH TEST APPROVAL**, schedule and execute exactly three mock destinations. This is not human approval for any public publication.

This packet requests a maximum **90-minute supervised completion window** after activation, within the packet expiry. The grant and route proof must expire no later than the packet and within 24 hours of approval. No unattended continuation after the one job.

## Exact test and limits

| Field | Limit |
| --- | --- |
| Brand / topic | Existing Horror UUID `10000000-0000-4000-8000-000000000001`; “A shadow appears behind a woman every time she closes her eyes.” |
| Provider order | Codex → agy → 9Router unchanged. CLI adapters fail preflight as unsupported; no CLI model execution |
| AI task | `production_package`, English, five seconds, one scene; original script, storyboard, concept and platform metadata; no fixture/script supplied |
| Requests / tokens | **One real inference total**, maximum 4,000 output tokens; no retry, repair call, model substitution or additional render concept |
| Time | Maximum 60 seconds per inference, three-minute HTTP worker; native render five-minute timeout, concurrency one |
| Financial authorization | **USD 0 total; no chargeable request authorized** |
| Media | Existing Piper voice, OpenMontage and FFmpeg; original procedural/image-motion graphics and original local soundtrack. No external asset/model downloads |
| Output | `generated-videos/horror/topic-<derived-id>/final/video.mp4`, H.264/AAC, 1080×1920, 5.00 s ±0.15 s |
| Data | Existing PostgreSQL schema/migration 003. No new migration, reset or destructive operation |
| Network | Existing loopback API/n8n/router ports only; one fixed upstream inference plus unauthenticated official pricing metadata GETs. No other external model/account APIs |
| Evidence | AI task/output/attempt records, response model/provider/usage if supplied, separate reported-vs-actual cost, one-call ledger, n8n IDs, media/QC/hash and mock publication records |

## Hard prerequisites before any inference

The operator must save non-secret proof using [E4_ROUTE_EVIDENCE.example.json](E4_ROUTE_EVIDENCE.example.json), with references, connection identity, validity and verified fields. Pin its SHA256 in the new owner receipt. **Never replace “unverified” with true merely because this packet was approved.**

Verify the exact enabled upstream connection and free entitlement; no paid substitution, combo/alias rewrite, internal extra inference retries, server plugins, or alternate connection that can disregard the request restrictions. Confirm that 9Router forwards these fields intact to OpenRouter:

```json
{
  "provider": {
    "only": ["nvidia"],
    "order": ["nvidia"],
    "allow_fallbacks": false,
    "require_parameters": true,
    "max_price": {"prompt": 0, "completion": 0, "request": 0}
  },
  "reasoning": {"enabled": false},
  "plugins": []
}
```

These are provider-side selection/price restrictions described by [OpenRouter's routing documentation](https://openrouter.ai/docs/guides/routing/provider-selection). The application reservation of zero is **not** an upstream billing control. The server-side zero-price filter is the proposed enforcement; its preservation through this installed router is still unverified. **Until that is established, the only guaranteed spend bound is not issuing a request.** If forwarding, entitlement, pricing, model identity or paid-fallback behavior cannot be verified, stop before inference. A positive provider-reported cost stops continuation and is preserved as an incident; a post-response check cannot undo a charge.

The executor refreshes public zero-price/schema capability immediately before the request. It rejects unknown models, tool calls, malformed/truncated JSON and oversized output. An fsynced ledger consumes the single request slot before network execution. An interrupted/uncertain request is not retried or granted another slot. No live fallback is claimed when disabled CLIs are skipped; fallback failure tests remain explicitly simulated.

## Reviewable commands and paths

Review-only, no credential access or activation:

```powershell
node scripts/build-e4-ai-review.mjs
node scripts/test-ai-brain.mjs --e4
node scripts/test-ai-deployed.mjs --e4
Get-FileHash -Algorithm SHA256 docs/E4_AI_SCOPE.json
```

After the owner's exact new approval and verified route only, record the actual message reference, scope digest, route digest and expiry using [the non-granted receipt template](E4_OWNER_GRANT.example.json) at `.runtime/ai-brain/e4-owner-grant.json`. Save redacted route evidence at `.runtime/ai-brain/e4-route-evidence.json`. These paths are ignored by Git. No such grant or live route proof has been created during preparation.

Then execute:

```powershell
node scripts/e4-pilot.mjs --approved=E4-FREE-CANARY-02 --complete-mock-test
```

That helper calls the existing installed Compose executable with `-p socialstudio -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.local-access.yml`, for `restart studio-api`, operator-only `exec -T studio-api node /studio/services/ai-agent-manager/e4-readiness.mjs` (bounded redacted JSON on stdin), its later `--withdraw`, and read-only evidence SQL. It verifies the media worker's PID, executable, creation time, fixed worker/config command line and zero running production tasks before stopping/relaunching that exact manual process. Fixed Node/Python/FFmpeg entry points are reused; no arbitrary model-provided command is executable. The readiness record permits only the approved topic/idempotency/run/brand/duration and does not mark a provider successfully tested.

Runtime/evidence paths under the existing project:

- `.runtime/ai-brain/e4-session.json`, `e4-worker.lock`, `e4-usage-<run_id>.json` (non-secret scope/session/request accounting).
- `.runtime/orchestrator/e4/<run_id>/` (prior worker config/receipt and bounded worker logs); existing `worker.json` and `worker-process.json` updated only for this one-run worker.
- `docs/test-evidence/milestone-e4/<run_id>/` (redacted results, AI response, media validation and execution IDs).
- Existing approved internal `worker_token`, control and signing keys are reused only by their fixed local helpers; they never reach the model. Upstream credentials remain exclusively inside 9Router.

## Risks, rollback and acceptance

The real model/JSON generation remains untested; rate limits, provider downtime, insufficient entitlement or invalid output can consume the single slot and fail the test. Free quotas are not unlimited. Existing services have no newly verified unattended agent isolation, so no general CLI executor is enabled. This is an operator-supervised local test, not acceptance of Milestone A or a security boundary implemented solely by repository files.

Rollback: stop only the identified E4 HTTP worker; cancel only its exact job through the existing authenticated API if necessary; withdraw only its matching readiness record and keep general 9Router access `approval_required`. Preserve the fsynced ledger, PostgreSQL history and generated content. Never delete/reset a ledger or automatically repeat an uncertain request. While the native worker is idle, restore the saved prior configuration only if its separate policy/approval is still valid; otherwise leave generation disabled. Restore no expired E3 authority. No Windows service/auth/network setting is created to undo. Changes are local and reversible, but an external inference, quota usage or provider logging cannot be undone.

Acceptance remains **NOT RUN** until actual n8n execution, real model output and PostgreSQL attempts, one new playable QC-passing video and three checksum-matching mock publications are recorded. No final E4 MP4 path, inference result, invoice or live failover is claimed now.
