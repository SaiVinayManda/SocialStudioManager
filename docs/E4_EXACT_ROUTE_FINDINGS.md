# Exact Nemotron route resolution

Continued from `716b6d3` on 2026-10-31. This is the specific requested route investigation, not another model comparison. Existing services, E3 videos, mock publishing and Codex → agy → 9Router preference are preserved.

The supported authenticated 9Router UI confirms **SocialManager**, one active OpenRouter connection, round robin off, no registered custom model cards, and the target model available as an Add suggestion. Its unsaved Add Model form preserves the exact provider ID `nvidia/nemotron-3.5-super-vl:free`; it was cancelled without saving or testing. Current `/v1/models` still has 37 IDs and no qualified Nemotron entry. This identifies the immediate registration gap; the catalog does not establish upstream rejection of the model.

Actual OpenRouter-only connection validation passed **1/1, zero failures**. Source inspection first established that this check uses an authenticated key-status metadata GET and does not generate text. No key was read/revealed, no cookie was extracted, no authentication setting was changed, and 401s were not bypassed. Remaining per-model quota and model response are untested. [UI receipt](test-evidence/milestone-e4/exact-route/dashboard-observations.json).

The public official endpoint still reports zero input/output pricing and structured JSON capability. [Current exact metadata](test-evidence/milestone-e4/exact-route/current-model-status.json). Adding the model through the verified save handler is a metadata operation, separate from inference tests. **Pressing Enter in the Model ID field invokes Test**, so operator steps explicitly prohibit Enter/Test before final inference authorization.

## Tested routing behavior

`node scripts/test-e4-router-core.mjs` evaluated only the installed module factories for the generic OpenAI transformer, sanitizers and base HTTP executor in an offline context. Provider configuration was a non-secret fixed endpoint and credentials were dummy literals. Actual transport was replaced by a stub; no network/credential interfaces were supplied. This test does not claim an OS sandbox or represent a full live-service request.

| Simulated upstream | Mock attempts | Exact model, zero-price/provider controls, JSON schema and no-plugin fields |
| --- | --- | --- |
| 200 | 1 | Preserved |
| 429 | 1 | Preserved |
| 503 | 4 | Preserved on every attempt |

All three compatibility cases passed; **the strict single-attempt condition did not pass**. Installed defaults include three retries for 502/503 and two for 504. The current inference guard's zero-extra-retry requirement remains unchanged and unmet. No genuine model fallback, quota failure or inference occurred. [Module fingerprints and actual result](test-evidence/milestone-e4/exact-route/offline-core-test.json), [narrowed source evidence](test-evidence/milestone-e4/exact-route/request-builder-source.json).

The authenticated combos page shows no combos. Its vision adapter is enabled with an empty pool/default model; the proposed task must remain text-only, with no image/audio attachments. No shared adapter settings were changed. The exact qualified parser bypasses combo lookup; the offline request path preserved NVIDIA-only/no-provider-fallback/zero-price fields. Full deployed forwarding remains to be confirmed during the final authorized canary, not falsely labelled executed here.

## Minimum next action

Approve **E4-ROUTE-CONFIG-01** under [the exact configuration-only packet](E4_ROUTE_CONFIGURATION_APPROVAL.md), or perform its seven dashboard steps yourself. This saves only the exact custom model. It does **not** authorize inference, UI Test, credential access, retry changes or service rebuilds. After registration, verify the qualified ID and address the single-attempt limitation; only then request a fresh model-specific final grant. Previous E4-FREE-CANARY-01/02 proposals are ungranted historical packets and are not reused.

Current outcome: **configuration not saved; real inference blocked; no new script, storyboard, E4 MP4, n8n E4 execution IDs or AI output records**. The previous 145 local/60 deployed checks remain historical baseline evidence; they were not repeated for this code-only investigation. New executed checks are the one real metadata validation, current local/public metadata GETs, and the three offline installed-core cases. No new infrastructure, model downloads, public posts or charges were made.
