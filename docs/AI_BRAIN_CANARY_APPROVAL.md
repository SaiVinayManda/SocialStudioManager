# E2-REAL-CANARY-01 — proposed owner approval, NOT GRANTED

This packet is reviewable preparation. Neither this document, its scope manifest, an example policy, nor inclusion in a backlog grants permission. No real provider has executed in E2. The separate current model-use approval is missing.

## Minimum action and owner information

Approve **one original-fiction content-package inference** through the existing local 9Router and **confirm that the exact `oc/jev-1.13-free` route is authorised for this use, pinned to a genuinely zero-billed-cost upstream, and cannot fall back internally to a billable or unapproved route**. Listing this model or its `free` name is insufficient evidence. If that confirmation cannot be made, do not run the request; supply the supported zero-cost route details for a revised packet instead.

The actual 9Router upstream tariff, quota and routing policy were not inspected because they may involve protected account configuration. This grant does not permit reading its provider credential database, tokens, cookies, saved CLI auth, changing its settings, or bypassing subscription restrictions. Operator confirmation of the route is required in the receipt; it is not manufactured by the helper. No paid route is permitted.

The application preference stays Codex → agy → 9Router. The first two are skipped because their minimum external isolation is not verified; **their authentication will not be accessed**. Approving this packet does not approve Windows security changes or an unrestricted CLI executor. A real 9Router response will not be described as successful live Codex/agy execution.

## Exact scope and limits

- Project: `C:\Projects\Manas_Flow\SocialStudio` only.
- Existing HTTP endpoint: `POST http://127.0.0.1:20128/v1/chat/completions`; anonymous gateway access only, no Authorization header. Downstream provider usage is limited to the confirmed exact route above.
- Model request: `oc/jev-1.13-free`; acceptable reported model identifiers are only `oc/jev-1.13-free` and `jev-1.13-free`. No model substitution, extra provider request, tool call or automatic repair request.
- One generated job UUID and one AI task for brand Horror (`10000000-0000-4000-8000-000000000001`). Topic: “A mysterious voicemail from someone who disappeared ten years ago.” English, 60 seconds, six scenes, original script, five titles, YouTube description, Instagram/Facebook captions, platform hashtags and storyboard.
- At most **one inference HTTP request**, 4,000 maximum output tokens, **USD 0 permitted monetary cost**. Token/account quota may still be consumed; the owner must authorise that one consumption. Actual billing remains unknown unless supplied by authoritative provider evidence; zero reservation is not an invented billed amount.
- One completion window of at most **20 minutes**, no later than **2026-11-01 18:00 UTC**. Worker lifetime is capped at five minutes and the task at 120 seconds. The first consumed request is durably recorded before dispatch; no budget reset or repeat request after an uncertain response.
- No installation/download, credential provisioning, model download, host configuration, public port, external message, new video render or social publishing.
- Existing approved local internal keys may be reused only by the operator/API clients: `control_token`, `n8n_token`, `webhook_key`, `worker_token` under `.runtime\orchestrator\secrets`. No values in output, prompts, arguments or receipts. They are not passed to the model or 9Router.
- Memory: concurrency one; native worker command uses 128 MiB V8 heap cap; no local GPU model. Existing container limits stay unchanged.

All execution-relevant files are enumerated by SHA-256 in [AI_BRAIN_CANARY_SCOPE.json](AI_BRAIN_CANARY_SCOPE.json). The actual owner receipt must bind both this packet's and that manifest's SHA-256. The worker verifies every listed file before reading its approved local worker token or requesting inference. Any changed digest/scope/expiry stops execution. No grant currently exists in `.runtime\ai-brain\canary-approval.json`.

## Exact commands and files, after approval only

The operator records the actual owner approval in `.runtime\ai-brain\canary-approval.json`: `approval_id`, `approved:true`, `approved_at`, `expires_at`, `packet_sha256`, `scope_manifest_sha256`, `maximum_calls:1`, `maximum_cost_usd:0`, `model:"oc/jev-1.13-free"`, and `zero_cost_route_confirmed_by_owner:true`. Record an expiry within this single completion window. The agent must not create an approved receipt until the owner actually grants this packet and route confirmation.

Start the actual n8n acceptance job:

```powershell
node scripts/ai-brain-canary.mjs --live --approved=E2-REAL-CANARY-01
```

Its signed intake durably creates the single job, prints the generated job UUID and waits. Before its 120-second deadline, provision `.runtime\ai-brain\operator-policy.json` from the secret-free `services\ai-agent-manager\operator-policy.example.json`: bind that exact job UUID, set `authorized:true`, use the grant expiry, retain both CLI adapters disabled, and set `router.route_verified:true` **only from the owner's confirmed route evidence**. Retain all other fixed limits/model/endpoint fields. No credentials are added.

Run this fixed foreground worker in another controlled terminal:

```powershell
node --max-old-space-size=128 services/ai-agent-manager/worker.mjs --approved=E2-REAL-CANARY-01
```

The intake helper creates `.runtime\ai-brain\canary-session.json` with create-new semantics to prevent a second canary job. The worker checks that session's job identity, claims only the approved job, records unsupported CLI attempts without invoking either CLI, and permits one bounded router request. `.runtime\ai-brain\real-canary-usage.json` records request consumption/outcome; `.runtime\ai-brain\real-canary-worker.lock` prevents another worker. Do not remove an existing session or usage ledger to rerun a request. A stale lock requires identified process-state review.

After actual completion, the canary writes only new files under:

`brands\horror\projects\ai-<generated-job-uuid>\`

`task-result.json`, `content-package.json`, `openmontage-input.json`, `script.json`, `scene_plan.json`, `narration.txt`; timestamped evidence under `docs\test-evidence\milestone-e2\<run-uuid>\`. Generated text is exported with create-new flags, not overwritten. No production pipeline stage is approved or advanced. Verify with:

```powershell
node scripts/verify-ai-artifacts.mjs <generated-job-uuid>
node scripts/record-ai-deployment.mjs <generated-run-uuid>
```

No new software/services, listener, firewall/ACL rule or public endpoint is created. The four existing Docker services and fixed proxy remain unchanged.

## Risks, failure handling and rollback

The fictional brief and brand prompt leave the laptop through 9Router's already configured upstream. Model quality and strict-schema compatibility are unverified. Usage can consume quota; route pricing and account permission must be confirmed before calling. Stop on missing approval, mismatched digest/model, credentials being requested, unsupported tariff, expired scope, cancellation, output validation failure, unknown cost/outcome or a changed route. No retry to a different paid model is allowed.

The request cannot be undone after it reaches the upstream. Local activation is reversible: cancel the exact AI task through the existing authenticated cancel endpoint or stop the identified foreground worker, set only the new policy's `authorized` flag false, and preserve the consumed-request/audit records. Cancellation does not guarantee the upstream cancels processing. An uncertain outcome goes to manual review. No automatic deletion, history rewrite, database down-migration, credential change, route change, volume cleanup or Windows setting rollback is required. Do not kill unrelated Node/Docker processes.

This is a one-call canary grant, not unrestricted future model use, unattended production or publishing permission. E2 remains incomplete until a real authorised response is schema-validated, persisted and returned through n8n.
