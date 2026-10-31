# E2-REAL-CANARY-01 conditional approval — preflight stopped

2026-10-31, 13:13 UTC. The owner approved proceeding **only after** verifying the exact existing route has no billable fallback, paid-model substitution or additional charges. That condition was not satisfied. **No inference was executed.** This is a blocked preflight, not a failed live model response and not successful E2 acceptance.

## Scope and integrity

The existing packet and all 46 manifest files matched their reviewed digests; its absolute expiry (2026-11-01 18:00 UTC) had not passed.

- Packet SHA-256: `4314db366eb5514fdbf8b9670ebdf7de7b736ae0f7ee79f50bc980c83fa1d407`.
- Scope-manifest SHA-256: `24a4c3ad92220a7cde3a572bcf635b131bdc561300fcc486b42fb61d689e76d3`.
- Packet/manifest and their execution files were not changed. No active model-use receipt or policy was created; the owner did not independently confirm a zero-cost route, and the preflight did not establish it.

The requested short script/title/caption/hashtags are contained in the packet's larger content-package contract. Its helper is still fixed to that package and the original priority. No canary override, provider order change or source modification was activated. If a future canary explicitly selects only 9Router, use a reviewed canary-specific selection without changing production priority.

## Actual checks

| Check | Actual result | Limit |
| --- | --- | --- |
| Existing local 9Router public package | Version 0.5.112 inspected; public GET route implementations read as text, not executed/imported | No account database, saved provider configuration or secrets read |
| `GET http://127.0.0.1:20128/v1/models` | HTTP 200; thirteen listed models; exact `oc/jev-1.13-free` row present, owned_by `oc` | Catalog advertisement only; it does not establish working inference, pricing, route pinning or model capability |
| `GET http://127.0.0.1:20128/api/pricing` | HTTP 401 Unauthorized | No login, cookie, token or auth retry; no protected settings/provider endpoints queried |
| Live upstream route/fallback | **Not verified** | No evidence proving absence of paid substitution, internal model fallback, account-tier charges or additional fees |
| Upstream model capability | Official TypeSafe and OpenCode documentation describes Jev as a decision model using state and typed questions, not a text generator | The proposed model is unsuitable for generating the requested original horror prose |

OpenCode currently lists Jev 1.13 Free with free input/output and describes its limited-time free variant and System One endpoint. That is public upstream pricing evidence; it does **not** certify this particular installed 9Router route or account/fallback configuration. [Official OpenCode model, endpoint and pricing documentation](https://opencode.ai/v2/docs/console/models/).

TypeSafe explicitly documents typed decision results rather than generated prose. [Official TypeSafe introduction](https://docs.typesafe.ai/introduction). The earlier packet selected this model without verifying its task suitability. That selection was incorrect. No replacement model was selected or called under the existing grant.

## Execution outcome

- Inference HTTP requests: **0**. Actual model used: **none**. Model response duration/token usage/billed cost: **not measured**, because inference did not start. No billable inference request was initiated; no invoice or account-wide billing claim is made.
- No AI task/content job submitted to n8n; no new canary PostgreSQL task, attempt or output records; no generated script/output folder. Prior mock fixtures and their separate evidence remain unchanged.
- No Codex/agy agent execution, OpenMontage invocation, rendering, publishing, installation, credential access, route/system configuration change or automatic continuation.
- Production priority remains **Codex → agy → 9Router**.
- No pipeline/worker deployment or restart was performed. The canary was stopped at the conditional gate.

Actual metadata/scope receipt: [preflight.json](test-evidence/milestone-e2/canary-preflight-2026-10-31T13-13-21-862Z/preflight.json). Evidence directory: `C:\Projects\Manas_Flow\SocialStudio\docs\test-evidence\milestone-e2\canary-preflight-2026-10-31T13-13-21-862Z\`.

## Minimum information needed next

1. An explicitly approved **text-generation** model/route supported through the existing 9Router. Jev cannot fulfil the prose-writing request even if its free route is confirmed. A different model, endpoint/contract or canary-only selection requires a revised, reviewable scope; do not silently substitute another model or alter production priority.
2. Redacted evidence of that route's exact upstream endpoint/model, current genuinely zero-cost usage entitlement, and absence of billable internal fallback/substitution/additional fees. A catalog name or locally editable price estimate is insufficient. Provide non-secret evidence from the authenticated router/provider dashboard; do not paste keys, cookies, tokens or passwords. If obtaining metadata programmatically requires protected access, prepare a separate narrow metadata-only approval rather than granting inference/billing access.

The owner's conditional approval is recorded as received; it is not treated as unrestricted billing permission or as proof that the pricing condition passed. Do not ask to reapprove the same unchanged action merely because it is gated; resolve the evidence/model mismatch first.

## Commands and verification

`node --check scripts/inspect-ai-canary-route.mjs` passed. `node scripts/inspect-ai-canary-route.mjs` executed exactly the two metadata GETs above and recorded the digests. The initial helper had a JavaScript nullish/logical-operator syntax error and exited before any I/O; it was corrected and syntax-checked before the successful metadata run. No inference attempt was consumed by that error.

The existing 88-test result is historical E2 mock/local evidence; this preflight did not rerun or promote those tests into real inference evidence. No frozen execution file was edited. The new inspection helper and report are outside the approved execution manifest.
