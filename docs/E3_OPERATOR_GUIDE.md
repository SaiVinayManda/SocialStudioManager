# Submit and review a topic-driven local video

The dynamic renderer is operational. **Three Horror videos passed the actual n8n pipeline and all nine mock publications. Real AI generation is not authorised or accepted.** [Results, paths, checksums, execution IDs and performance](E3_DYNAMIC_VIDEO.md).

## Submit a new topic without editing source

From `C:\Projects\Manas_Flow\SocialStudio`, using the already approved running deployment and internal local authentication:

```powershell
node scripts/submit-video-topic.mjs --brand horror --topic "A mirror whispers your name when nobody is home." --duration 5 --mode fixture --idempotency topic:mirror-review-002
```

For any other topic, optionally supply an original short narration to keep fixture prose under editorial control:

```powershell
node scripts/submit-video-topic.mjs --brand travel --topic "A mountain lake at dawn" --duration 5 --mode fixture --script "Mountains catch the morning light. A quiet lake reflects the sky." --idempotency topic:travel-review-002
```

This signs the **actual deployed n8n intake webhook**; it does not invoke OpenMontage manually. The response contains `job_id`. The same idempotency key and parameters reuse the same job. Changed parameters with the same key are rejected. A new key creates a new job/output. Do not reuse the recorded completed acceptance keys to expect another render.

`fixture` means a deterministic editorial fixture, not real AI. The three acceptance topics have separate authored fixture scripts/storyboards. Other topics use a finite heuristic draft/scene choice; supplied scripts override narration. This is suitable for technical preview testing, not a substitute for the pending real-AI milestone. The renderer consumes the resulting validated storyboard without topic-specific rendering edits. Excessively long speech fails rather than truncating audio.

Supported brand slugs: `horror`, `storytelling`, `motivation`, `travel`, `business-insights`, `company`. Current output is 1080×1920, H.264/AAC, 9:16; duration 3–60 seconds with ±0.15 s validation tolerance. The one installed English Piper voice is enabled. Other voices/models/resolutions/aspect ratios are not automatically fetched or silently substituted.

The topic webhook body is:

```json
{
  "source_type": "topic",
  "brand_id": "10000000-0000-4000-8000-000000000001",
  "topic": "An original short story topic",
  "duration_seconds": 5,
  "idempotency_key": "topic:unique-example-001",
  "provider_mode": "fixture"
}
```

The optional `script` is a narration string. Optional `production` overrides only the validated brand production profile fields; it cannot supply shell commands, URLs, model paths, arbitrary fonts or output roots. Destinations remain scoped by the brand database records. Use the signed CLI/helper rather than placing credentials into command arguments or unprotected HTTP examples.

## Follow progress and review

```powershell
node scripts/studio-operator.mjs review <job-UUID>
node scripts/studio-operator.mjs logs <job-UUID>
```

Output metadata is available through authenticated `GET /jobs/<UUID>/output`. The native Windows path is under:

`generated-videos/<brand>/topic-<derived-id>/final/video.mp4`

Each job also keeps `scripts/production-package.json`, narration text, measured SRT cues, original scene/audio assets, `assets/ATTRIBUTION.md`, OpenMontage checkpoints/artifacts, actual tool commands, resource samples, QC and `previews/first-caption.png` when the acceptance caption-check helper was used. The engine saves `previews/frame-mid.png` for every successful job.

Ordinary CLI jobs do **not** carry an acceptance-run marker or receive automatic approval. Inspect the actual video and audio. Use the existing authenticated operator approval/rejection command only after review. n8n cannot decide an operator approval. All publishing remains mock; an operator review here does not enable public publishing. A media checksum/content-version change invalidates approval.

## Configure brands and local assets

`brands/<slug>/config/ai.json` retains the independent editorial identity/audience/restrictions and provider order. `production.json` selects the installed voice, palette, style, subtitle font/size/color/margin, music gain/policy and default duration. The API reads the profile from the existing media mount. Six defaults are present; Horror and Travel have actual rendered evidence. No account credentials live in these files.

`asset-catalog.json` is initially empty for each brand. Indexing records local images/video/audio by filenames/tags; uncatalogued files are not automatically licensed. A usable visual needs an explicit entry:

```json
{
  "id": "original-window-01",
  "relative_path": "brands/horror/assets/window.png",
  "tags": ["window", "night"],
  "width": 1080,
  "height": 1920,
  "checksum": "<SHA256 of the actual image>",
  "licence": {
    "status": "verified",
    "evidence_reference": "brands/horror/assets/window-rights.md",
    "evidence_checksum": "<SHA256 of saved rights evidence>"
  }
}
```

Provide actual usage-rights evidence; a label/checksum does not grant rights. Paths must stay in same-brand asset folders, without links/hardlinks/traversal/devices. Modified/missing/unverified files are ineligible. The selector ranks tags and aspect metadata and discourages repeated assets. If none qualifies, it records an original procedural fallback. The three accepted videos needed no external media. Do not download media/models or enable an image API without separate approval.

## Runtime limits and recovery

The existing single manual Windows media worker uses `.runtime/orchestrator/worker.json`. Its dynamic policy pins the Python runner/component hashes, allowed brands, local job budget, duration and expiry. The initial E3 policy permits up to twelve new renders, each ≤60 seconds, within a two-hour window. The usage ledger consumes a slot before execution; do not delete/reset it to recover capacity. The application's separate local-auth approval also has an expiry. An installed tool, script flag or helper cannot grant new authorisation.

If the approved local render policy has expired or source hashes changed, queueing is not permission to bypass the gate. Record the typed error and have the authorised operator review the current scope before refreshing it. `scripts/e3-activate.mjs --local-fixture-renders-only` was the E3 implementation activation helper: it applies the existing additive migration only if absent, preserves config/receipt history, verifies the exact idle manual-worker identity, pins current runner digests and refreshes existing services. It is **not** an installer, automatic renewal grant, secret generator or startup-registration tool. Do not run it to expand an owner-approved scope or time/budget boundary without that approval.

Cancellation: `node scripts/studio-operator.mjs cancel <job-UUID>`. The worker observes cancellation/lease loss, aborts the process tree and reports cleanup failure instead of silently continuing. Actual FFmpeg cancellation is covered by the local suite. A mid-render crash or existing partial generation directory requires manual review; do not overwrite it or blindly retry in place. A new bounded retry uses a new idempotency/output path while preserving failed evidence. The acceptance-only `e3-retry.mjs` limits its three named test cases to three attempts; it is not a general production retry bypass.

Existing lifecycle/recovery guidance remains in [the Studio operator guide](STUDIO_OPERATOR_GUIDE.md). No Docker pulls, package installation, owner bootstrap, new secrets, privileged service or Windows settings are needed. The real pending Travel job `74212973-983e-4837-844d-412d5d8dc40c` survived an actual media-worker restart with the same checksum and no publishing jobs.

## Acceptance helpers and evidence

The three-video acceptance was run with these existing/local commands (not installers):

```powershell
node scripts/e3-inspect.mjs
node scripts/e3-activate.mjs --local-fixture-renders-only
node scripts/e3-e2e.mjs
.runtime/openmontage-pilot/venv/Scripts/python.exe -I scripts/e3-compare.py
.runtime/openmontage-pilot/venv/Scripts/python.exe -I scripts/e3-caption-evidence.py
node scripts/e3-e2e.mjs --finish-mock-tests
node scripts/e3-record.mjs
node scripts/test-ai-brain.mjs --e3
node scripts/test-ai-deployed.mjs --e3
```

These helpers reuse the saved `.runtime/orchestrator/e3-session.json`; they do not overwrite successful videos. The finish flag records only the owner-authorised **MOCK-PUBLISH TEST APPROVAL** for the three isolated acceptance jobs. It is not a normal production approval, human creative review or public publishing permission. Do not delete the session to force repeated tests. Main receipt: `docs/test-evidence/milestone-e3/fbd57ede-a022-4807-b255-9eb20207dd8c/summary.json`.

## Real AI is a separate pending gate

`--mode live` fails closed while no authorised provider is available. There is no silent fixture substitution or paid model fallback. Codex → agy → 9Router priority remains unchanged. The E3 HTTP worker is implemented but blocked and not live-tested. [One consolidated route/call review packet](E3_AI_APPROVAL.md) specifies the existing model candidate, endpoint, three exact topics, maximum three calls and USD 0 permitted cost. First provide the non-secret exact-route/free-entitlement/no-paid-fallback evidence; then obtain a revised review-ready approval. Do not reuse the blocked Jev/E2 grant or assume a subscription/model name covers API cost.
