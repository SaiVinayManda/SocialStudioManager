# Social Studio AI Agent Manager

Implemented inside the existing Studio API; no new service/container or dependency install. Durable PostgreSQL queue, attempts, schemas, fallback, cancellation and brand profiles. Existing workflow 02 uses the same stable `/ai/tasks` interface with legacy mock compatibility.

Provider preference is `codex`, `agy`, `9router`. CLI adapters implement distinct supported protocols; neither has an enabled, independently isolated executor. The native HTTP-only canary worker skips them and requires a separately authorised, zero-charge existing-router route before requesting inference. The example policy is deliberately disabled. No real model canary has run.

See [current implementation/runbook](../../docs/AI_BRAIN.md), [test matrix](../../docs/AI_BRAIN_TEST_MATRIX.md), [pending approval](../../docs/AI_BRAIN_CANARY_APPROVAL.md). E2 is not accepted from mocks alone. Do not run the unfinished supervisor, reinstall 9Router, rerender the pilot or publish content.
