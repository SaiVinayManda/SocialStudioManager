# E4 real-AI video operator procedure

Current result: implementation and no-inference regression checks passed. Real model/video acceptance is **pending**. Reuse all existing services, workflow 02 and OpenMontage/native worker. Do not rerun infrastructure installers, E3 videos or advanced supervisor development.

1. Review [E4_AI_APPROVAL.md](E4_AI_APPROVAL.md), [E4_AI_SCOPE.json](E4_AI_SCOPE.json) and their SHA256. The packet expires 2026-11-01T18:00:00Z; if it expires or source files change, refresh review and obtain a new exact approval. The existing E3 worker's time window is not extended by E4.
2. Obtain the owner's explicit `E4-FREE-CANARY-01` approval. Only then inspect the supported router UI's non-secret connection/routing metadata using the approved existing session. Do not access raw credentials/cookies or activate a different model. Verify an existing OpenRouter connection and free-model eligibility, exact upstream/model, zero-price filter forwarding, no paid substitution/plugins/extra upstream retries. If unavailable, stop before inference and give the minimum owner action. No key creation or new account connection is included.
3. Preserve the actual approval reference and evidence; populate the two runtime files from the non-granted examples. Remove `example_only`; do not assert evidence you have not established. Owner receipt binds manifest SHA256, route proof SHA256, exact manifest run UUID, actual approval timestamp, and expiry within 90 minutes and packet expiry. `allow_dedicated_local_token` may be true only if explicitly approved and the exact pre-provisioned token file exists. Never export upstream tokens into those JSON files.
4. Ensure the existing Studio API, PostgreSQL, n8n and proxy are healthy and no media production is running. The helper validates the prior native PID/executable/creation/config identity and saves its old configuration. No Windows service or startup registration is used.
5. Run the single approved command:

```powershell
node scripts/e4-pilot.mjs --approved=E4-FREE-CANARY-01 --complete-mock-test
```

This submits the fixed reviewed topic through the actual signed n8n intake. Workflow 02 creates the existing durable AI task. CLI preflights are unsupported, retaining Codex → agy → 9Router ordering. The narrow HTTP worker consumes one fsynced slot, invokes the exact approved route, validates the closed production schema and saves real output/attempt history through the existing Agent Manager. There is no fixture fallback or repair call in this E4 path.

The helper removes its scoped readiness after AI completion, leaving general model access approval-required. Existing workflows drive native Piper/OpenMontage/FFmpeg, production polling, QC and review. Only the existing labelled mock-test decision mechanism can complete the test approval. Scheduling and all three mock destinations must use that exact asset checksum. No public publishing path is enabled.

The same model response is the canary and the render input: **do not issue a separate second inference**. The dedicated prompt asks for original 8–12 spoken words, one five-second scene and platform metadata. Inspect the actual output rather than assuming the model obeyed every editorial preference.

Results will be in `docs/test-evidence/milestone-e4/<manifest-run-id>/e2e.json`, including real task/output, attempt history, any reported provider cost/usage, exact video path/checksum, approval and publication IDs and associated n8n executions. HTTP evidence distinguishes provider-reported cost from unknown actual billed cost; no invoice is claimed. `generated-videos/horror/topic-<derived-id>/final/video.mp4` is derived by the existing intake contract. Do not report a final path until it actually exists and passes QC.

On a failure, inspect typed errors and the ledger under `.runtime/ai-brain/e4-usage-<run-id>.json`. If `calls` is 1 or the outcome is uncertain, never reset/delete it or issue another request without a new approval. A failed model response must not enter rendering. A failed render/QC must not enter approval or publishing. Preserve histories and outputs. Use the rollback steps in the packet; restore no expired prior policy. No fresh E4 acceptance is possible while the grant or verified route is absent.

Local regression commands (no real inference):

```powershell
node scripts/test-ai-brain.mjs --e4
node scripts/test-ai-deployed.mjs --e4
```

The first is a preapproval suite; its absent-real-grant assertion deliberately rejects use after activation. Run it before creating the grant, or use a new explicitly isolated fixture checkout for later regression checks. The second executes real database/API checks with fictional E4 readiness rolled back; it does not exercise a real E4 n8n inference/render. Existing E3 ordinary fixture submission instructions remain in [E3_OPERATOR_GUIDE.md](E3_OPERATOR_GUIDE.md).
