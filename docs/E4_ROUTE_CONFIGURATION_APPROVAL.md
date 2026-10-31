# E4 exact OpenRouter model registration — configuration only

Proposed ID: **E4-ROUTE-CONFIG-01**. **PENDING; NOT OWNER APPROVED.** Prepared 2026-10-31 from commit `716b6d3`. Expires **2026-11-01T18:00:00Z**, with at most 20 minutes of operator work after approval. The [scope manifest](E4_ROUTE_CONFIGURATION_SCOPE.json) binds this packet and its evidence. This is not permission for inference. Previous E4-01/E4-02 model-specific proposals are not reused.

## Verified cause and prerequisite

The supported authenticated dashboard shows OpenRouter connection **SocialManager**, one connection, enabled/active, round robin off. Available Models has no registered custom model cards; the target appears only as an **Add** suggestion. The model form, filled but then cancelled, previews the exact upstream ID unchanged. The local model-list API still advertises only OpenRouter's Jev entry. The immediate gap is target registration, not a missing account connection. Do not infer an account/model restriction solely from this incomplete local catalog.

An actual OpenRouter-only connection check completed **1/1 passed, 0 failed**. Its installed implementation performs `GET https://openrouter.ai/api/v1/auth/key`; it does not call a generation endpoint. No key value was read/exported. This validates the existing connection, not remaining model quota or a successful text generation. [Dashboard receipt](test-evidence/milestone-e4/exact-route/dashboard-observations.json), [latest model/pricing check](test-evidence/milestone-e4/exact-route/current-model-status.json).

## Exact change requested

Using only `http://localhost:20128/dashboard/providers/openrouter`:

1. Confirm **SocialManager** is still the single active connection and the exact model is still absent. If already present, verify it and do not create another entry.
2. Under **Available Models**, open **Add Model**.
3. Set **Model ID** to exactly `nvidia/nemotron-3.5-super-vl:free`. Do not include the outer `openrouter/` prefix in this field.
4. Leave **Vision**, **Reasoning** and **Speech to text** switches off for this text-only canary. Do not change existing model/connection settings, global Thinking settings, capability-adapter pools or round robin.
5. Confirm **Sent to provider as** is exactly `nvidia/nemotron-3.5-super-vl:free`.
6. Click the dialog's **Add Model** save button once. **Do not press Enter in Model ID**: source code confirms Enter invokes the separate model Test action. Do not click **Test** or any model-test control.
7. Read the saved card and unauthenticated `GET /v1/models`. Require the exact qualified entry `openrouter/nvidia/nemotron-3.5-super-vl:free`, then stop. Use `node scripts/e4-exact-route-status.mjs --after-configuration` to save a separate `docs/test-evidence/milestone-e4/exact-route/post-configuration-status.json`; do not overwrite frozen pre-change evidence. Do not submit a Studio job or start a model worker.

The installed save handler uses `POST /api/models/custom` through the existing dashboard session, with these fixed metadata fields (the UI also serializes the capability switches in their specified off states). This is a description, not permission to extract cookies or issue a raw authenticated shell request:

```http
POST /api/models/custom
Content-Type: application/json

{"providerAlias":"openrouter","id":"nvidia/nemotron-3.5-super-vl:free","type":"llm"}
```

No alias, combo, transport override, API key, account or service is added. No authentication/privacy/security setting is changed. The separate model test path is `POST /api/models/test` and is expressly excluded. [Installed handler evidence](test-evidence/milestone-e4/exact-route/request-builder-source.json).

## Price, fallback and remaining inference gate

Official current endpoint metadata reports text generation, `response_format`/`structured_outputs`, and **$0 input / $0 output** for the exact NVIDIA free variant. [Official endpoint](https://openrouter.ai/api/v1/models/nvidia/nemotron-3.5-super-vl:free/endpoints). Free quotas are limited; the account's remaining quota is unknown. No credit purchase is required for the documented free variant. [Official free-model rules](https://openrouter.ai/collections/free-models).

Authenticated UI inspection found **no combos**. The vision adapter is enabled with a default model; this task is text-only and must contain no attachments. Do not change that shared setting. Qualified names bypass combo lookup in the installed parser. The reviewed request pins NVIDIA, disables provider fallbacks, requires JSON parameters, sends no plugins, and caps allowed token/request prices at zero. [Official provider controls](https://openrouter.ai/docs/guides/routing/provider-selection).

An offline test executed the **installed** generic request transformer and HTTP executor using dummy data and a stubbed upstream. Exact model ID, JSON schema, `provider.only`, `allow_fallbacks:false`, `max_price:0`, `reasoning.enabled:false` and `plugins:[]` survived all three cases. This is a core-code compatibility test, not a live authenticated wire capture. [Actual offline result](test-evidence/milestone-e4/exact-route/offline-core-test.json).

**Important unresolved call-count limit:** the installed default HTTP executor retries 502/503 three times and 504 twice. A simulated 503 caused **four attempts to the same exact free route**, while 200/429 caused one each. No paid model substitution was observed in this core test, but a strict one-upstream-attempt promise is false under those defaults. This registration approval does not waive that limit, change retries, or permit those attempts. A future final inference packet must either establish a supported no-retry setting or explicitly request the bounded same-model retry behavior. Do not patch/reinstall 9Router or silently relax the current guard.

## Limits, risks and rollback

- Maximum one new non-secret model entry and zero inference calls, model tests, paid usage, new keys, software installs, account/auth changes, worker activations, renders or public posts.
- Existing router clients will see one additional model ID. Adding metadata is not a hard financial or access-control boundary for other clients; this test's later model usage still needs its separate approval and reviewed restrictions.
- No host ports, Windows settings, services, n8n workflows, PostgreSQL records, production priority, existing models or credentials are modified. No private data is sent to a model.
- Reversible metadata change: the owner can remove only this newly added custom-model entry through the same provider page, then verify the qualified ID disappears. Preserve the existing connection, Jev entry, histories and media. No automatic deletion, data reset or auth rollback is requested.
- Stop on a changed provider/connection, unexpected model ID, automatic model test, save failure, or a requirement to enter/reveal credentials. Never bypass a 401 or broaden the grant.

## Next acceptance, after configuration only

Confirm saved model and exact upstream mapping, recheck current price/schema capability and settle the internal retry limit. Then prepare a **fresh** final authorization for the one real AI Brain/n8n shadow-topic request, with cost/call limits explicitly stated. The same response will feed the five-second local render and existing QC/checksum-bound mock approval/scheduling/three mock destinations. No final inference packet or owner grant has been created or activated now.
