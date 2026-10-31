# E2 text-model discovery and route verification — 2026-10-31

Continued from `619c283`. **Stage 1 discovery is complete; Stage 2 found no verified zero-charge, exact-model route. Stages 3/4 were not started.** No inference, account authentication, credential access, install, service change, render or publishing occurred. Production preference remains Codex → agy → 9Router. The earlier Jev approval was not reused and no Jev inference/test was performed.

## Actual catalog and evidence

The existing 9Router 0.5.112 returned HTTP 200 with thirteen model IDs. Eleven are potential text candidates; both Jev IDs were excluded using the previously established decision-only capability, despite their generic tools/context flags. No embedding or reranking model appeared in this catalog. Model advertisement is not successful inference evidence.

Read-only local routing/pricing probes returned HTTP **401** for `/api/models/alias`, `/api/combos`, and `/api/pricing`. No login, cookie, token, account store, saved credentials or protected settings response was accessed. Public installed source was read as text only.

Live public upstream metadata was fetched with anonymous GET requests, not model calls:

- API.airforce `/v1/models`: HTTP 200, 785 rows; the three exact local candidates support chat. The corresponding `:free` variants are absent from this public response.
- OpenCode `/inference/v1/models`: HTTP 200, 78 rows; all three local OpenCode **text** candidates below are absent. No assumption was made about why any specific request would fail or whether a paid substitute would be selected.

Receipts: [local catalog and capabilities](test-evidence/milestone-e2/text-model-discovery-2026-10-31T13-36-03-649Z/metadata.json), [local protected-metadata status](test-evidence/milestone-e2/text-model-discovery-2026-10-31T13-19-30-579Z/metadata.json), [official public upstream catalogs](test-evidence/milestone-e2/public-text-catalogs-2026-10-31T13-32-26-954Z/catalogs.json), [installed-source excerpts and hashes](test-evidence/milestone-e2/text-route-source-2026-10-31T13-36-02-113Z/source-audit.json).

## Candidate comparison

Prices below are advertised upstream prices, **not billed amounts from a test**. API.airforce's documented integer price fields are cents per million tokens; the table converts them to USD per million. Cached public web pages can show older prices; the captured live API response is used here. A free-plan exception, credit balance or promotion was not assumed from a generic model price.

| Exact local model ID | Provider / advertised upstream | Text-generation evidence | Advertised pricing/access | Zero-charge entitlement verified? | Paid fallback/substitution possible? | Exact-model restriction evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `af/gpt-oss-20b` | API.airforce / `https://api.airforce/v1/chat/completions` | Live upstream `supports_chat:true`, text input/output | $0.07 input / $0.21 output per 1M; local static registry labels it Free | **No**; account free access not verified | Router supports substitution paths; actual route/account policy unavailable | Qualified ID bypasses alias/combo selection in source; full live endpoint/account constraints unverified | Suitable text model; reject for this zero-cost test pending entitlement proof |
| `af/gpt-oss-120b` | API.airforce / same endpoint | Live upstream chat and text output | $0.20 / $0.78 per 1M in captured API; local Free label | **No** | Same unverified live policy | Explicit ID can be requested; end-to-end restriction unverified | Metered public tariff; not approved |
| `af/kimi-k2.7-code` | API.airforce / same endpoint | Live upstream `supports_chat:true` | $0.58 / $2.38 per 1M; local Free label | **No** | Same unverified live policy | Explicit ID can be requested; end-to-end restriction unverified | Metered public tariff; not approved |
| `agnes/agnes-2.5-flash` | Agnes AI / `https://apihub.agnes-ai.com/v1/chat/completions` | Installed LLM/chat registration and official provider chat API; exact version not live-tested | Local provider advertises signup credits; official docs distinguish free/default, enterprise and paid Token Plan key pools | **No**; actual key type, exact-model coverage, free allowance and billing behaviour unknown | Cannot rule out a paid account/pool or configured substitution | Qualified exact ID supported in source; selected live connection/endpoint and retries unverified | Best next **verification target**, not cleared for inference |
| `agnes/agnes-2.5-pro` | Agnes AI / same endpoint | Installed chat registration; no inference test | Credit/plan dependent; no verified exact-model zero rate | **No** | Unknown | Explicit ID supported; live restriction unverified | Hold |
| `agnes/agnes-2.5-pro-beta` | Agnes AI / same endpoint | Installed chat registration; no inference test | Credit/plan dependent; no verified exact-model zero rate | **No** | Unknown | Explicit ID supported; live restriction unverified | Hold |
| `agnes/agnes-3.0-flash` | Agnes AI / same endpoint | Installed chat registration; no inference test | Credit/plan dependent; no verified exact-model zero rate | **No** | Unknown | Explicit ID supported; live restriction unverified | Hold; public reference docs do not independently establish this version's free entitlement |
| `mmf/mimo-auto` | Xiaomi MiMo free channel / `https://api.xiaomimimo.com/api/free-ai/openai/chat` | Registered text/chat route; official MiMo Code launch describes a limited-time free built-in model | Limited-time promotion, not confirmed current entitlement for this integration | **No** | Underlying selection is an auto route; active policy unknown | Cannot establish one underlying model from `mimo-auto`; the installed MiMo free executor has a JWT bootstrap/retry path, but exact live `mmf` dispatch was not attested | Exclude from this exact-model, no-auth-change canary; no bootstrap was executed |
| `oc/muse-spark-1.2-contributor-free` | OpenCode Free / translated Responses transport | Registered text model; **absent from current upstream public catalog** | Historical local Free label; no current verified free offer | **No** | Cannot rule out unavailable model or paid replacement; none tested | Requested label is explicit, but no current available route verified | Stale entry; exclude |
| `oc/muse-spark-1.3-contributor-free` | OpenCode Free / translated Responses transport | Registered text model; **absent upstream** | Maintainer states Muse is no longer in the free tier; old local label is insufficient | **No** | No replacement/fallback approved | No available current exact free route verified | Exclude |
| `oc/union-alpha` | OpenCode Free / translated Anthropic transport | Registered text model; **absent upstream** | Old local Free/preview label; no current zero-cost entitlement verified | **No** | Actual substitution policy unavailable | Explicit label can be sent; current route not verified | Exclude |

Excluded without model execution: `openrouter/typesafe/jev-1.13` and `oc/jev-1.13-free` (decision-only). No new provider or model was added to 9Router.

## Routing and request-count findings

Installed source establishes a narrower positive result than “all explicit requests can fall back”:

- `provider/model` parsing directly resolves the registered provider. Slash-qualified names bypass the ordinary unqualified alias and combo lookup.
- The chat handler nevertheless supports configuration-controlled capability adapters that can prepend other models. For a plain-text-only request, that adapter's source returns the original selection; no multimodal fallback is needed for this canary.
- Those facts alone do not certify the actual live connection, runtime provider overrides, proxy/transform configuration, provider account entitlement, account failover or upstream model-selection/billing policy. Protected metadata remains unavailable.
- A client-side `maximum_cost:0` and a response-model check do not enforce a gateway or upstream billing cap. Rejecting an unexpected response occurs after a possible upstream charge.
- The installed `mimo-free` executor has an explicit bootstrap/JWT flow and a retry following 401/403. The registry also contains an `mmf` provider ID alongside a `mimo-free` alias named `mmf`; the effective live dispatch was not established. Bootstrap/retry is therefore a source-confirmed integration risk, not an observed request or a proven dispatch result for this current connection. A one-upstream-attempt guarantee is not established. Neither path was invoked.

**Conclusion:** 9Router has real substitution/retry capabilities; no evidence proves a paid substitution is currently enabled for a particular candidate. No candidate's complete no-paid-fallback/one-model/zero-charge chain was established. Do not invent that proof or alter settings to obtain it.

OpenCode's current official documentation also limits free-tier chat access to OpenCode clients. Compatibility/authorisation of this installed free-provider transport was not established, and no client-header workaround was attempted. [Official OpenCode model/access documentation](https://opencode.ai/v2/docs/console/models/).

## Recommendation and minimum owner action

**Do not run another canary yet or approve a different model merely from its name.** The best next verification target is the already configured `agnes/agnes-2.5-flash` route: it has a stable text-model ID and the provider documents a separate free/default key pool. This is a recommendation for checking an existing account, not a claim that its exact model is free or that inference is approved. API.airforce's live public tariffs are nonzero; the stale OpenCode routes and MiMo auto/bootstrap path are poorer choices under the current constraints.

Minimum action: provide one redacted, non-secret route/account export for that exact Agnes route, or another existing route you can document as genuinely zero-cost. It needs:

1. Exact local model → actual upstream endpoint/model and connection **reference**, with no keys, tokens, cookies, emails or passwords.
2. Current free/default key **type** and exact-model access/price/remaining free entitlement, including confirmation that exceeding it fails rather than consumes a paid pool, auto-top-up or subscription quota that incurs charges.
3. Any active provider override, alias/combo/capability routing and upstream model substitution/fallback policy; evidence that a plain-text canary stays on the exact approved model/connection.
4. Retry/account-failover behaviour sufficient to enforce the single authorised inference attempt, plus any other fee.

Use an existing authenticated dashboard yourself; no need to share a credential or install anything. Alternatively, a separately reviewed metadata-only read mechanism could return precisely these fields, but no such protected access is requested or performed here. Provider guarantees/evidence matter; a hand-edited local cost estimate is not enough.

Once an eligible route is verified, prepare a **new** model-specific packet/manifest with a 9Router-only canary override and a short script/title/caption/hashtags schema; keep the production order unchanged. Request that packet's approval before inference. The earlier Jev packet/manifest and execution source remain untouched. No new inference approval packet is presented because its viability gate has not passed.

## Primary evidence sources and limits

- [API.airforce model API](https://api.airforce/docs/api/models/): public capability/price fields and free-variant semantics. [Current public catalog](https://api.airforce/v1/models): captured exact-model data, no account authentication. [Pricing plans](https://api.airforce/pricing/): free and paid plan access differ; this does not establish the owner's account entitlement.
- [Agnes official chat FAQ](https://github.com/AgnesAI-Labs/AgnesAI-Models/blob/main/docs/FAQ.md) and [key-pool/Token Plan FAQ](https://github.com/AgnesAI-Labs/AgnesAI-Models/blob/main/docs/TOKEN_PLAN_FAQ.md): compatible chat endpoint and separate access pools. Public reference date is June 2026; exact local 2.5/3.0 free rates and current owner balance were not verified.
- [Xiaomi official MiMo Code launch](https://mimo.mi.com/docs/en-US/news/latest/mimocode): limited-time anonymous free model promotion, not a perpetual unrestricted third-party API guarantee. Installed executor source supplies the bootstrap/retry facts.
- [OpenCode current public catalog](https://opencode.ai/inference/v1/models), [current official access docs](https://opencode.ai/v2/docs/console/models/), and [maintainer's Muse free-tier retirement response](https://github.com/anomalyco/opencode/issues/56978): no available local-listed free text route established. Unofficial Union Alpha promotional pages were not accepted as evidence of current entitlement.

Verification performed: three inspection-helper `node --check` commands passed; local metadata/source audit and anonymous public catalog reads completed. Protected endpoints returned expected 401 blocks. No inference/parser/PG/n8n canary test was run; previous mock test results remain historical. Helpers/evidence are outside the old execution manifest. No new runtime grant/session was created and no implementation/deployment change activated.
