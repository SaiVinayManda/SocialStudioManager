# E3 real-AI review packet — blocked, not an inference grant

Prepared 2026-10-31. Review packet expires **2026-11-01T16:00:00Z**. Proposed ID: `E3-REAL-AI-01`. **Do not approve or execute inference until the route evidence below is complete and a revised scope manifest is REVIEW_READY.** Earlier Jev/E2 approvals and “continue” do not authorize this model. Nothing in this document grants itself approval.

The dynamic video portion already passed using explicit fixtures. Only actual model execution remains unaccepted. Current status: Codex and agy have no independently verified unattended isolation/executor; 9Router requires route/cost authorization. The existing unauthenticated local model list advertises `agnes/agnes-2.5-flash`, but that is not entitlement, zero-price, chat success or no-substitution proof. No protected router credentials/configuration, saved CLI auth or model services have been accessed for this E3 review.

## Consolidated proposed scope

| Item | Exact proposed restriction |
| --- | --- |
| Candidate model | `agnes/agnes-2.5-flash`, existing local 9Router only |
| Endpoint | `http://127.0.0.1:20128/v1/chat/completions` |
| Upstream identity | **Unverified**; must be supplied and pinned, including allowed response model ID |
| Application/provider order | Codex → agy → 9Router; CLI adapters stay unsupported/disabled without separate isolation review |
| Calls | Maximum **3 real requests**, one per distinct topic/job; no output repair, retry, paid fallback or model substitution |
| Topics | “A mirror whispers your name when nobody is home.”; “A driver sees someone standing in the middle of an abandoned road.”; “A phone receives a message from someone who disappeared years ago.” |
| Content | Horror brand; `production_package`; English; five seconds; concept, narration, storyboard, five titles and platform metadata; no script fixture in a real task |
| Output | Closed schema, maximum 4,000 output tokens per request, bounded output bytes; reject tool calls, incomplete responses and unapproved returned model IDs |
| Maximum permitted cost | **USD 0 total**. Actual entitlement/pricing is currently **unknown**, so requests remain prohibited |
| Deadline | 60 seconds per inference; five-minute worker window; grant expiry no later than packet expiry and within 24 hours of activation |
| Credentials | Reuse only the existing scoped internal worker key after all checks pass. No model key, cookie, owner CLI authentication, new secret or auth change. Route must support the reviewed `auth_mode: none`; otherwise a separate auth review is needed |
| Execution | HTTP-only native worker; no agent CLI process, arbitrary shell, elevated runtime or model tools |
| Publishing | Worker cannot publish. Any existing n8n continuation retains local rendering policy, QC and approval gates; no public posting or external account connection |

## Minimum owner information needed now

Provide a **non-secret/redacted route/account export**, using [the field template](E3_ROUTE_EVIDENCE.example.json), showing:

1. Exact upstream/model and route ID for this existing model; no combo/alias leading to another model.
2. The actual account's current free entitlement, applicable model allowance, validity and quota exhaustion behavior.
3. Paid fallback and automatic substitution disabled; one maximum upstream attempt and hard failure on quota exhaustion.
4. Zero-charge enforcement at the provider/account/route, such as a verified free-only pool with no billable pool or automatic paid upgrade. A local `maximum_cost: 0` field and a model name **do not enforce an upstream financial cap**.
5. Non-secret evidence references and a validity period covering the proposed run. Do not send passwords, tokens, cookies, keys or saved auth files.

No authentication/configuration change is requested to obtain this export. If the current route cannot enforce these conditions, identify that limitation; no paid alternative is approved. The current packet cannot truthfully state verified pricing or a guaranteed bill ceiling beyond **no request until verified**.

## Reviewable implementation and activation boundary

`services/ai-agent-manager/e3-worker.mjs` is implemented but **disabled and not live-tested**. It checks the manifest, owner receipt, route evidence, source digests, topics, IDs, expiry and call/cost limits before reading the internal worker key. Its durable ledger consumes a request slot before inference; interrupted usage is not blindly retried. CLI adapters retain their original priority but remain unavailable for unattended execution. Existing n8n workflow 02 calls the same AI manager; fallback remains inside that manager.

`docs/E3_AI_SCOPE.json` currently has state **BLOCKED_ROUTE_EVIDENCE**. `node scripts/build-e3-ai-review.mjs` can refresh a blocked digest inventory but cannot create a grant or mark it ready. After evidence is available, finish the route review, pin its digest and exact upstream, bind three fresh job IDs to the three exact topics, prepare the final REVIEW_READY packet and obtain the owner's separate explicit approval. No runtime grant or model-worker activation has been created now.

Exact future command, **currently blocked**:

```powershell
node services/ai-agent-manager/e3-worker.mjs --approved=E3-REAL-AI-01
```

Future non-secret runtime files, created only by an authorized operator after that review: `.runtime/ai-brain/e3-owner-grant.json` and `.runtime/ai-brain/e3-route-evidence.json`. The grant must reference the manifest and route SHA256, approval reference, expiry, exact three job UUIDs/topic bindings, maximum_calls=3, maximum_cost_usd=0, maximum_output_tokens=4000, provider_order=[codex,agy,9router], codex_enabled=false and agy_enabled=false. Their existence alone is not owner authorization.

## Risks and rollback

Quota may be consumed; provider JSON/schema support and actual model identity remain untested. A model may return invalid content; the task fails rather than making additional repair calls. Local metadata cannot prevent a separately reconfigured router from changing behavior, so external no-charge/no-substitution enforcement must be established and remain pinned throughout the run. No such guarantee is claimed today.

Rollback: stop only the verified E3 HTTP worker if it was explicitly started; cancel only its three scoped tasks through authenticated control; preserve usage ledger, histories and outputs for reconciliation. Do not reset a call ledger to regain slots after an uncertain outcome. The local fixture renderer and existing workflow definitions continue to work independently. No software, Windows service, account setting or publishing permission is changed by this proposal.
