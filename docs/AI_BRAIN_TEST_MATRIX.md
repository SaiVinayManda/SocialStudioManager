# E2 verification matrix — 2026-10-31

**E2 is incomplete: no authorised real inference has occurred.** `simulated` means deterministic adapters, injected CLI envelopes or controlled database state; it never means a real provider exhausted quota or returned content.

| Required case | Evidence and actual outcome |
| --- | --- |
| 1. Codex availability | Actual installed 0.165.0 help/version with empty CLI home; production adapter unavailable without verified external isolation. |
| 2. Codex structured output | Simulated JSONL parsing and fixed invocation tests pass; live response not tested. |
| 3. agy discovery | Actual standalone binary/help confirms noninteractive print and schema options; executable digest recorded. |
| 4. agy execution | Injected fixture executor/envelope tests pass; real execution blocked by isolation/auth scope. |
| 5. 9Router health | Existing listener 20128; actual unauthenticated `/v1/models` HTTP 200, thirteen IDs. `/health` HTTP 404. |
| 6. 9Router response | Request/response and limits tested with simulated HTTP. Real response requires route/cost authorisation. |
| 7. Primary success | Simulated Codex completion stops fallback. |
| 8. Codex→agy | Simulated primary unavailable/unsupported selects agy. |
| 9. Both CLIs→9Router | Simulated unsupported CLIs select router in exact priority; no live fallback claim. |
| 10. All unavailable | Local and actual PG state-machine fixtures terminate; bounded attempts. |
| 11. Rate limiting | Simulated HTTP/category/backoff tests pass. No real limit induced. |
| 12. Quota exhaustion | Simulated Codex/router quota tests pass. No real quota consumed/tested. |
| 13. Timeout | Actual PG total-deadline expiry; simulated transport timeout. Existing actual Windows child-cleanup regression passes. |
| 14. Cancellation | Actual PG queued/running cancellation and API role checks; simulated transport abort. No live upstream cancellation claim. |
| 15. Malformed output | Actual PG fixture records invalid schema then mock fallback; bad output cannot become successful content. |
| 16. Schema validation | Eight closed schemas, bounds/order/duration/storyboard/narration checks and malformed cases pass. |
| 17. Duplicate submission | Actual PG idempotency/conflict tests; two actual workflow-02 executions share one task/output; post-completion delivery suppressed. |
| 18. Restart recovery | Simulated lost leases against actual PG: mock resumes; live-policy unknown outcome requires review. Actual PG restart preserves output/history. |
| 19. Brand isolation | Actual composite FK/wrong-brand submission tests; six profile/prompt tests. |
| 20. Cost limits | Actual PG reservation rejection, zero mock cost; simulated tariff/endpoint/budget fail-closed checks. No invented billed cost. |
| 21. Credential redaction | Fixture redaction and credential-shaped input/output rejection. No real provider credential read; local-key artifact scan separate. |
| 22. Injection boundary | Content cannot supply commands/URLs/paths; prompt data stays data; native worker cannot execute agent CLIs. No perfect semantic-resistance claim. |
| 23. PG persistence | Actual versions 1/2, one task/output, two attempts, checksum/events; unchanged after actual PG restart. |
| 24. n8n integration | Existing `socialstudio0002` updated/published; actual successes 3288/3291; signed intake and exact result attachment. |
| 25. OpenMontage mapping | Actual upstream Draft2020-12 script/scene_plan schemas pass in existing Python; no render or stage advance. |
| 26. Publishing regression | Existing 35 local + 2 proxy tests, 13 deployed API checks and original completed-job n8n regression pass. Historical all-twelve proof preserved; no new publishing/render executions claimed. |

Latest combined local suite: **88/88** (51 AI, 35 existing orchestrator, 2 proxy), [receipt/TAP](test-evidence/milestone-e2/2026-10-31T12-55-33-292Z/unit.json). Actual PG **24/24**, AI API **11/11**, existing API **13/13**: [deployed receipts](test-evidence/milestone-e2/2026-10-31T12-45-14-107Z/postgres-ai-checks.json). SQL lifecycle fixtures roll back.

Latest actual n8n mock canary: [1.580-second result](test-evidence/milestone-e2/3a5a058b-4664-4130-8071-7e259cc0ca5d/canary.json). [Workflow executions](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/n8n.json), [PG rows](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/postgres.json), [provider capabilities](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/providers.json), [healthy services](test-evidence/milestone-e2/2026-10-31T12-56-19-652Z/services.json), [actual PG restart](test-evidence/milestone-e2/2026-10-31T12-54-50-138Z/restart-persistence.json).

Retained failures: initial SQL `42P08` (timeout parameter type inference) fixed by explicit cast; sandbox Python launcher access failed, then the existing environment passed outside the sandbox without an install; older pilot verifier refused overwrite with `EEXIST`, replaced by a timestamped E2 verifier; metadata import rejected a version containing a CLI PATH warning, fixed by extracting the real version line. [Failed SQL receipt](test-evidence/milestone-e2/2026-10-31T12-34-50-081Z/postgres-ai-checks.json). No failure was labelled a pass.

Host elapsed times use a monotonic timer. Container timestamps are not used as model inference latency. No RAM/VRAM peaks or real model billing measurements exist.
