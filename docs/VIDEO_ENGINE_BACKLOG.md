# Video engine implementation backlog

**Historical two-engine estimate.** The current owner direction selects OpenMontage and excludes MoneyPrinterTurbo/Postiz integration. Use [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)'s A-H sequence and active A backlog; do not activate this earlier candidate backlog.

Status: **proposal only; not an approved execution queue**. Estimates are engineering hours for one experienced engineer, excluding provider/app review wait times, licences, content approval, downloads and the separate M0-M4 remote-development milestone. They are not measured model runtimes or promises. Allow approximately 25% contingency for Windows/provider surprises; do not spend that allowance without a grant.

The latest instruction authorizes read-only Phase A source audit and these documents. No production code has been implemented. Existing VE-01 through VE-05 remain the high-level gates; the tasks below refine the two-engine proof of concept and later production integration without silently activating either backlog.

VA-02 progress on continuation: parsed both upstream locks, created a target-wheel catalog and offline MoneyPrinterTurbo production export, and completed owner-approved [VA-STAGE-MPT-01](VIDEO_ENGINE_SETUP_PACKET.md): 116 exact wheel artifacts downloaded and independently hash/size-verified. VA-02 is **partial**, not complete; no installation or runtime test is authorized or performed. OpenMontage's Python lock and final runtime/native/licence/isolation packet remain pending.

## Proof of concept

| ID | Depends on | Scope and acceptance evidence | Hours |
| --- | --- | --- | --- |
| VA-01 | Phase A findings; owner choices | Freeze media fixtures, voice/language, synthetic chart data, brand, rights and supplied long-form hash; record both engine requests and native/external capability labels | 6-10 |
| VA-02 | VA-01 | Resolve exact Windows dependencies and licence/BOM; prepare download origins/hashes/sizes, hooks, Python/FFmpeg/browser/model artifacts, lock digests and runtime design for approval; no auto-restore | 8-16 |
| VA-03 | M4 acceptance or explicit local-POC exception; VA-02 and installation/isolation grants | Provision two separate approved environments; verify filesystem/network/secret boundaries and serial resource limits; no owner credential inheritance | 8-16 |
| VA-04 | Contract review | Strict common job/result schemas, channel/brand authorization, capabilities and immutable profile mappings; invalid/unknown/path/flag/schedule inputs denied | 10-16 |
| VA-05 | VA-03/04 | MoneyPrinterTurbo submit/status/output/log/cost/cancel wrapper, publishing disabled; one isolated CLI process per job, actual artifact verification | 12-20 |
| VA-06 | VA-03/04; AGPL/renderer decision | OpenMontage fixed-profile runner, approved stage checkpoints and budget gates, safe artifact/export mapping; no broad tool discovery or detached board by default | 24-40 |
| VA-07 | VA-03/04 | Independent telemetry/validation harness: full decode, media metadata, sampled process-tree RAM/GPU VRAM, runtime/stage timing, bounded logs and hashes | 12-20 |
| VA-08 | VA-01/05/06/07; exact run/provider grants | Execute eight base jobs, inspect twelve required video outputs if all scenarios supported, score blindly, record unsupported/failed cases; optional repeats require grant | 16-28 |
| VA-09 | VA-05/06/07 | Failure, cancellation/process-tree, unknown-provider-outcome, restart, duplicate submit, denied publishing/network and cross-channel isolation evidence | 16-28 |
| VA-10 | VA-08/09 | Complete measured comparison and final recommendation; retain artifacts/failures; owner records adoption and production limits | 6-10 |

POC subtotal: **118-204 hours**, before the optional contingency. Some contract/harness work may be shared; estimates already assume that sharing. VA-08 includes review/reports, not an assumption that every scenario is natively supported.

## Production integration, separately authorized

| ID | Depends on | Scope and acceptance evidence | Hours |
| --- | --- | --- | --- |
| VP-01 | Accepted POC and product backlog | n8n/PostgreSQL job state, lease/outbox, budgets, approval digests, audit and recovery; one GPU lease across engines | 20-32 |
| VP-02 | VP-01; ingestion/credential grant | Registered Windows-folder and Google Drive intake; copied/versioned inputs, channel ACLs, limits, provenance and no arbitrary download URLs | 12-20 |
| VP-03 | VP-01; model/run grants | Preserve independent FFmpeg long-form-to-three-reels route with transcript-based selections/rationales, framing, captions and source timecodes | 16-28 |
| VP-04 | VP-01; engine/brand acceptance | Reusable brand render profiles, chart/overlay extension where needed, capability negotiation and regression renders; all extension costs attributed | 16-28 |
| VP-05 | VP-01; exact platform app/OAuth/publishing grants | n8n-only direct official Instagram, Facebook and YouTube adapters; separate channel destinations/credentials, receipt reconciliation, retries and no cross-posting inference | 24-48 |
| VP-06 | VP-01 through VP-05 | Restore/resource/update runbooks, pinned upgrade regression, observability, secret redaction, artifact retention and operator acceptance | 16-28 |

Production subtotal: **104-184 hours**. Combined POC + production: **222-388 hours**, plus separately approved contingency. Platform app review, legal/compliance decisions and M4 work are outside this estimate.

MoneyPrinterTurbo-only commodity qualification can stop after the relevant adapter/harness/scenario checks, but it does not satisfy branded charts or intelligent clipping by assertion. OpenMontage-only deployment would still need the common controller, isolation and validation work. A licence rejection or failed capability test changes the scope and requires a revised estimate/grant; no automatic substitute engine or paid provider is approved.
