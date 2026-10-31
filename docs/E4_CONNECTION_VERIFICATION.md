# E4 connection verification — shadow topic revision

Read-only verification on 2026-10-31, continuing from `6512f5bd35536066fd1bcb6423cb7a21ce105370`. Owner reports OpenRouter and Antigravity connected. No software reinstall, authentication change, account token access or inference. Browser control was stopped in previous turns; this review uses only unauthenticated metadata, public documentation and static installed program text.

## What the running service actually shows

`GET http://127.0.0.1:20128/v1/models` returned 200 and 37 IDs. Prefix counts: `ag` 27; `openrouter` 1; `agnes` 4; `mmf` 1; `oc` 4. This proves catalog advertisement and endpoint reachability, not successful upstream authentication or quota entitlement. `/api/models/alias`, `/api/combos` and `/api/pricing` return 401; their protected response bodies were not read. No authentication retry or model test was made.

The exact advertised IDs, official catalog evidence and timestamps are in [metadata.json](test-evidence/milestone-e4/connections/2026-10-31T20-11-27-437Z/metadata.json). The earlier sandbox-limited public request was retained separately; its empty candidate list was an EACCES failure, not a claim that no free models exist.

| Candidate / connection | Capability and pricing evidence | E4 decision |
| --- | --- | --- |
| `openrouter/typesafe/jev-1.13` — sole advertised OpenRouter entry | Structured decisions/classification; public price $0.042 per million input tokens, $0 output | Excluded; no repeat of the prior Jev test |
| `ag/gemini-3.8-flash`, plus its high/medium/low variants — Antigravity inside 9Router | Text-capable model family; current account quota and credit-overage setting unknown | Not approved for inference; not demonstrated zero-charge |
| Other advertised `ag/` families: Gemini 4 Argon, 3.7/3.6 Flash, 3.1 Pro, Gemini Pro Agent, Claude Sonnet/Opus, GPT-OSS | Advertised names only; exact available upstream variants, eligibility and prices not established | No speculative model calls |
| `openrouter/nvidia/nemotron-3.5-super-vl:free` — proposed explicit OpenRouter route | Official catalog and NVIDIA endpoint report zero prompt/completion prices, text output and JSON schema support | Recommended one-request candidate; absent from local advertised list, live route verification and owner grant still required |

Jev capability/price: [official model page](https://openrouter.ai/typesafe/jev-1.13). Candidate capability/pricing: [official NVIDIA route](https://openrouter.ai/nvidia/nemotron-3.5-super-vl:free), [public endpoint metadata](https://openrouter.ai/api/v1/models/nvidia/nemotron-3.5-super-vl:free/endpoints).

## Router Antigravity versus `agy`

Static installed 9Router source maps `ag` to its Antigravity OAuth HTTP connector at `daily-cloudcode-pa.googleapis.com`; its registry maps variants to upstream model IDs, marks this connector deprecated with `RISK_NOTICE`, and defines up to three attempts for several transient statuses. This is program-code evidence, not a verified live connection or a statement that every such retry is enabled in current settings. The router connector does not launch the standalone `agy` executable. No Google internal endpoint, quota refresh, token refresh or inference was called during this review.

Google's public plans describe account-dependent quotas and optional purchased-credit overages. Thus a connected subscription route cannot be assumed zero-charge; this owner's overage choice and remaining quota were not accessed. [Official plan/overage documentation](https://antigravity.google/docs/plans). The Social Studio `agy` CLI adapter separately remains unsupported without verified external isolation. Production order stays Codex CLI → agy CLI → 9Router; the canary may use only the 9Router adapter.

## Exact route/cost boundary

Installed static source previously confirmed the OpenRouter endpoint and explicit qualified-model parsing; slash-qualified names bypass combo lookup. The router's live alias settings, enabled connection, internal retry policy, plugin settings and forwarding of the `provider` object are still unverified. The source search found no literal `max_price`/`allow_fallbacks` support; their absence does not prove the fields are discarded or forwarded. No runtime settings are guessed from that search.

The proposed request pins the NVIDIA provider, prohibits provider fallbacks, requires JSON parameters, sends `plugins: []`, and caps permitted prompt/completion/request prices at zero. These are upstream selection controls only if forwarded unchanged. [Official routing controls](https://openrouter.ai/docs/guides/routing/provider-selection). OpenRouter documents free-variant quotas of 20 requests/minute and 50/day, or 1,000/day after the documented credit-purchase threshold; actual remaining account quota is unknown. No credits are purchased for this test. [Official free-model documentation](https://openrouter.ai/collections/free-models).

## Minimum action and implemented preparation

Supply the redacted route evidence fields in [E4_ROUTE_EVIDENCE.example.json](E4_ROUTE_EVIDENCE.example.json), and approve the exact revised [E4-FREE-CANARY-02 packet](E4_AI_APPROVAL.md). No upstream secret is requested. If the exact free route cannot be established, stop before inference; approval does not waive the zero-charge conditions. No paid alternative or Antigravity credit use is approved.

The existing runner now binds the requested new shadow topic and rejects the superseded topic/approval ID. It still consumes one durable request slot, calls the existing AI Manager and workflow 02, and reuses that one real response for the local five-second video. No fixture fallback, extra inference canary, second render concept or public publishing. One new manifest run UUID separates it from the prior proposal.

## Evidence handling correction

The first static-source extractor included a bundled OAuth application-secret literal in tool output. It did not read a user's authentication file or account access/refresh token. The saved receipt was immediately sanitized; nine excerpts were redacted, and the extractor now strips secret-bearing literals and OAuth-secret prefixes before storing/displaying source. Those original literal values are not repeated here or committed. The tool output cannot be retracted. [Sanitized static-source receipt](test-evidence/milestone-e4/connections/installed-routing-source.json); a focused regression covers complete and truncated literals. No account/session revocation or authentication change was performed.

**Actual outcome:** real inference NOT RUN; E4 PostgreSQL AI output and MP4 NOT CREATED; E4 n8n execution IDs and publication IDs do not exist yet. Historical E3 acceptance remains intact.
