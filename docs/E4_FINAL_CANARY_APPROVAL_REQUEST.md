# E4 Final AI Canary — Inference Authorization Request

**Proposed ID: E4-FREE-CANARY-03**  
**Status: PENDING OWNER APPROVAL — NOT YET ACTIVE**  
**Prepared: 2026-10-31**  
**Depends on: E4-ROUTE-CONFIG-01 dashboard registration completed by owner**

---

## Prerequisites Before This Packet Can Be Executed

The following gate must be completed **by the owner in the browser** before this approval is requested or any inference is attempted:

1. **Model registration (E4-ROUTE-CONFIG-01 dashboard step)** — Owner must open `http://localhost:20128/dashboard/providers/openrouter`, confirm SocialManager is the single active connection, click **Add Model**, enter exactly `nvidia/nemotron-3.5-super-vl:free` in the Model ID field, confirm **Sent to provider as** shows that exact ID, click the dialog's **Add Model** save button (do NOT press Enter or click Test), then run:

   ```powershell
   cd c:\Projects\Manas_Flow\SocialStudio
   node scripts/e4-exact-route-status.mjs --after-configuration
   ```

   The script must exit 0 and `exact_model_registered` must be `true` in `docs/test-evidence/milestone-e4/exact-route/post-configuration-status.json`. That file must not exist before the dashboard step.

2. **Retry behavior explicitly acknowledged** — The final grant must acknowledge that a 503 from OpenRouter will trigger up to 3 transport-level retries (4 total upstream calls) to the same `nvidia/nemotron-3.5-super-vl:free` route before the request fails. No paid model substitution occurs (allow_fallbacks:false, max_price:0 enforced throughout). The task layer enforces `max_attempts_per_provider=1` preventing re-dispatch to a different provider.

---

## Exact Change Requested (Inference — NOT yet approved)

**One text-generation request only**, from the AI Brain worker (`services/ai-agent-manager/e4-worker.mjs`) through 9Router to OpenRouter NVIDIA endpoint.

### Fixed parameters (all reviewed in e4-route.mjs and e4-worker.mjs)

| Field | Value |
|---|---|
| Local route | `openrouter/nvidia/nemotron-3.5-super-vl:free` |
| Upstream model | `nvidia/nemotron-3.5-super-vl:free` |
| Upstream endpoint | `https://openrouter.ai/api/v1/chat/completions` |
| Provider controls | `only:["nvidia"]`, `allow_fallbacks:false`, `require_parameters:true` |
| Max price | `prompt:0, completion:0, request:0` |
| Server plugins | `[]` (disabled) |
| Reasoning | disabled |
| Maximum calls | **1** |
| Maximum cost | **$0** |
| Maximum output tokens | 4,000 |
| Brand | `10000000-0000-4000-8000-000000000001` (horror pilot) |
| Topic | `A shadow appears behind a woman every time she closes her eyes.` |
| Duration | 5 seconds |
| Scene count | 1 |
| Script provided | No (AI generates) |
| Max transport retries on 503 | 3 (same model, total 4 upstream calls maximum) |
| Provider re-dispatch | 0 (enforced by task policy) |

### What the AI is asked to produce

8–12 spoken words, one 5-second scene, original content only. Concept, timed storyboard, script, and platform metadata matching the production schema. No URLs, tools, external media acquisition or extra scenes. Asset ID must be empty (procedural environment or original image-motion component only).

---

## What Happens After the Response

1. `e4-worker.mjs` validates the output against the production schema (`validateOutput`)
2. One scene required (`demand(result.output.storyboard.scenes.length === 1)`)  
3. Usage ledger written to `.runtime/ai-brain/e4-usage-<run_id>.json` (fsync)
4. Result submitted to AI Brain internal API; job marked complete
5. Existing n8n Horror workflow picks up the completed job and passes it to OpenMontage for **local 5-second render only** — same pipeline as E3 videos
6. No public posts, no publishing, no credentials exposed

---

## Retry / Routing Safeguards

Per `docs/test-evidence/milestone-e4/exact-route/retry-behaviour-investigation.json`:

- **200, 429** → exactly 1 upstream call
- **503** → up to 4 upstream calls (1 + 3 transport retries), same model only, $0 price enforced on each
- **No provider fallback** — `allow_fallbacks:false` forwarded on every attempt
- **No model substitution** — qualified name `openrouter/nvidia/nemotron-3.5-super-vl:free` used throughout
- **Task layer** — `max_attempts_per_provider=1` prevents re-enqueue to a different provider (Codex/Agy also disabled)

Owner must explicitly accept the 503 retry behavior (up to 4 same-model attempts, $0 each) in the grant.

---

## Price and Cost Controls

- Official OpenRouter endpoint metadata as of 2026-10-31: **$0 input / $0 output** for `nvidia/nemotron-3.5-super-vl:free`
- `e4PublicPreflight()` is called live at worker startup and verifies `pricing.prompt === "0"` and `pricing.completion === "0"` from the official API; fails with `E4_PUBLIC_PRICE_OR_CAPABILITY_CHANGED` if price changes
- `verifyE4Policy()` re-reads and validates grant/route at inference time
- Worker `reserve()` hook: `demand(cost === 0)` — refuses any non-zero cost reservation
- Account entitlement (remaining free quota) is not independently verified; free-quota exhaustion results in an API error, not a charge

---

## What This Approval Does NOT Authorize

- Any inference beyond the one approved call
- Paid fallback or model substitution
- Credentials access or credential provisioning
- Public publishing or social media posts  
- Rendering beyond the local 5-second Horror pilot
- Additional brands, workflows, or database schema changes
- Any change to existing model routes, connections, or authentication

---

## Rollback

If the response fails validation or the worker errors, the usage ledger records `outcome: failed`. The job is not re-enqueued. No rollback of the model registration is needed; the route card can be removed from the provider page if desired.

---

## Remaining Blocker Summary

| Gate | Status | Owner Action Needed |
|---|---|---|
| E4-ROUTE-CONFIG-01 model registration | ❌ NOT DONE | 7 dashboard steps at `http://localhost:20128/dashboard/providers/openrouter` |
| Post-config verification script | ❌ NOT RUN | Run `node scripts/e4-exact-route-status.mjs --after-configuration` after dashboard step |
| 503 retry acknowledgment in grant | ❌ NOT GRANTED | Include in final approval message |
| This inference packet (E4-FREE-CANARY-03) | ❌ NOT APPROVED | Explicit owner approval after above gates |
