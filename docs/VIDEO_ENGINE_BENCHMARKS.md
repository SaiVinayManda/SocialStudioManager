# Controlled video engine benchmarks

Status on 2026-10-29: **NOT RUN for every video scenario**. No finished video, engine quality score, runtime, RAM/VRAM peak or reproducibility result exists. The read-only clones and hardware inventory are audit evidence only. This document and [job fixtures](benchmarks/video-engine-jobs.json) define the proposed proof of concept; they are not executable approvals.

## Controls and fixtures

Compare the exact source commits in [VIDEO_ENGINE_COMPARISON.md](VIDEO_ENGINE_COMPARISON.md). Pin runtime/dependency lock, renderer/browser/FFmpeg, fonts, voice/model, provider profile and prompt/configuration hashes before running. Use one neutral evaluation brand (`studio-eval`) with independent scenario channel IDs until the owner selects real brands. Never use production social accounts or publishing credentials.

The fixture file contains **eight distinct jobs**, one per engine/scenario, all blocked pending approved profiles and assets. Shared briefs and structured data provide equivalent creative requirements. Both engines receive the same approved source-asset collection, script constraints, music, brand and voice where supported. Record any difference in selected footage, timing, prompt orchestration or unsupported provider. Do not claim byte-identical determinism for agent/media-provider output.

Run the engine-native end-to-end route first. If exact shared narration or graphics need preprocessing for parity, identify that as a separate assisted route, include its time/cost/dependencies and keep the native outcome unchanged. A supplied-script/render-only test does not replace topic-to-video acceptance. An unsupported request is recorded as `UNSUPPORTED_CAPABILITY` or `SKIPPED_UNSUPPORTED`; it cannot pass without the required output.

## Four scenarios

| Scenario | Fixed brief and required output | Specific acceptance evidence |
| --- | --- | --- |
| H01 — horror | A non-graphic lighthouse story: a keeper hears his own voice from a locked radio, discovers the warning is from the next night, and must choose whether to answer. One 60-second vertical narrated MP4 with real moving footage, tense local/cleared music, subtitles and a hook within two seconds. | Hook is audible/visible immediately; coherent escalation and payoff; actual motion clips, not a sequence of animated stills; intelligible voice and matching captions; music supports speech. No graphic violence or unexplained stock changes presented as specific events. |
| T01 — travel | A 60-second Lisbon mini-documentary connecting riverside, street/tram and tiled-building footage, with title/location graphics and subtitles; narration/music use the same approved profiles. | Clips depict the claimed location, human-reviewed provenance, real motion, legible motion graphics and coherent geographical story. Reject generic footage mislabeled as Lisbon. |
| B01 — business | A 60-second branded explainer about why revenue growth can outpace profit. Use the fixture's explicitly fictional quarterly revenue/cost data, two accurate charts, structured section headings and branded animation, plus narration/subtitles. | Chart data/labels/units match exactly; visible fictional-data label; legible vertical layout; animation and branding present. A plain stock montage does not satisfy charts. External chart rendering is reported as adapter work. |
| L01 — highlights | The same owner-supplied long-form video becomes **three** vertical 30-60-second clips with source audio, subtitles, branded hook/title and intelligible standalone moments. | Record full-source transcript, ranked candidates, selected source in/out points, score/rationale and crop plan. Three distinct coherent clips, no mid-word cuts, no misleading context, no equal-spacing substitution for semantic selection. |

Common target for all outputs: vertical **1080x1920**, H.264/AAC MP4, 30 fps constant-frame-rate where supported, readable burned captions plus an SRT/VTT sidecar. H01/T01/B01 proposed duration tolerance is 60 +/-2 seconds. All three L01 clips must be within 30-60 seconds. Record unsupported settings explicitly; do not silently downgrade and mark full compliance.

Proposed real-motion rule for H01/T01: at least 80% of visual duration uses actual moving footage; titles/graphics may occupy the rest. Camera movement over a still does not count. Human scene inspection is required; pixel change alone cannot distinguish it. These thresholds are proposed criteria for the run grant, not measured achievements.

No long-form source was supplied with the request. A question for its local path/Drive file and brand/channel was issued during the audit. L01 remains blocked until the asset, rights, input duration/size and hash are known; never download an arbitrary public video as a substitute. Draft fixture asset/profile references are intentionally unresolved.

## Run plan and resource limits

1. Freeze inputs and rights manifest, exact scripts/prompts, two source commits, provider/renderer/dependency profiles and benchmark revision/hash. Confirm all grants and no publish route.
2. Provision only the itemized approved environment. Do not run upstream setup, tests, imports, doctor probes or package restoration during read-only Phase A. Any package/browser/model download is a separately enumerated prerequisite.
3. Record hardware, power mode and thermal/idle conditions without changing settings. The observed GPU is **RTX 4060 Laptop GPU, 8,188 MiB, driver 591.91**; Node v22.19.0 is present. Python/FFmpeg/ffprobe/Codex did not resolve on this session PATH. Available RAM and the complete isolated runtime remain to verify.
4. Execute serially, with one active renderer/GPU lease across all routes. Rotate engine order between scenarios to reduce warm-cache/thermal bias. Record cold provisioning/download/model load separately from steady render time and total end-to-end time.
5. Collect one-second sampled process-tree working set/private bytes, system available/committed RAM, GPU total/used memory and utilization, encoder used, CPU, disk/scratch/output/network bytes and stage times. On WDDM, per-process VRAM may be unavailable: report sampled device-total peak and idle baseline as such, not as exact job allocation. Sampling can miss spikes; do not call it an absolute hardware maximum.
6. Independently validate artifacts, watch/listen to all final videos, score blindly with engine labels hidden, and keep all attempts including failures. Optional frozen-asset CPU/NVENC comparisons or repeat runs need their own bounded grant.

Proposed initial ceilings, **not approved**: one job at a time; 30 minutes per short-video attempt, 60 minutes for L01; 8 GiB aggregate worker private memory, at least 3 GiB system RAM available, 6.5 GiB observed device VRAM, 5 GiB scratch/output per short job. L01 staging/space limits must be sized from the supplied source before approval. Pause/terminate on an agreed threshold breach; do not increase limits or download a replacement model automatically. GPU telemetry is not itself a hard allocation cap, and the enforcement method must be accepted before running.

No paid requests are authorized, including creative-agent reasoning on an existing paid account. Free services still need approved data flows and terms. Prefer approved local narration/music and stock footage; a Piper voice, Whisper/CLIP model or local LLM is not presumed present or downloadable. Keep the first profile free of local video-generation/diffusion models and concurrent large workloads.

## Validation and scoring

An engine reports success only after a finished video exists and passes the following checks:

- Capture actual process exit, task/result JSON and artifacts with UTC timestamps and source/runtime/input hashes. Exit zero alone is insufficient.
- Probe every MP4, then fully decode every video and audio stream in the approved validation sandbox. Verify dimensions, codec, duration, frame cadence and audio presence. Retain actual validation command vectors, exits and bounded logs.
- Inspect full playback for black/frozen/truncated tails, repeated or mismatched clips, speech clipping, caption gaps and unwanted watermarks. Sample at least ten subtitle cues or every cue if fewer; proposed alignment tolerance 0.5 seconds, with no clipped/glyph-missing words.
- Verify stock/music/font/voice rights references, chart values and source timecodes. Check strong opening hook, factual/contextual fidelity and motion-footage requirements. Rights unknown or materially misleading output fails acceptance.
- Score story/hook, visual relevance/motion, voice, captions, music/mix and brand/graphics each 1-5. Mark non-required dimensions N/A. Proposed threshold: each required dimension >=3, plus all hard requirements. Preserve reviewer notes/timecodes; no automatic average can hide a missing required feature.
- Test cancellation, timeout, unavailable provider, malformed result, denied publishing, duplicate submission and restart separately. A successful happy-path video does not prove those controls.

Report both engine-native and assisted results if extensions are tested. Any shared FFmpeg/graphics work must have its own row, effort and resource attribution. The independent FFmpeg L01 route is a useful control, not evidence that MoneyPrinterTurbo has native highlight intelligence.

## Results ledger — current

| Job | Engine | Finished outputs / required | Runtime / sampled VRAM / RAM | Quality / reproducibility | Result |
| --- | --- | --- | --- | --- | --- |
| H01-OM | OpenMontage | 0 / 1 | Not measured | Not scored | NOT RUN |
| H01-MPT | MoneyPrinterTurbo | 0 / 1 | Not measured | Not scored | NOT RUN |
| T01-OM | OpenMontage | 0 / 1 | Not measured | Not scored | NOT RUN |
| T01-MPT | MoneyPrinterTurbo | 0 / 1 | Not measured | Not scored | NOT RUN |
| B01-OM | OpenMontage | 0 / 1 | Not measured | Not scored | NOT RUN |
| B01-MPT | MoneyPrinterTurbo | 0 / 1 | Not measured | Not scored | NOT RUN; native chart capability unestablished |
| L01-OM | OpenMontage | 0 / 3 | Not measured | Not scored | NOT RUN; source asset pending |
| L01-MPT | MoneyPrinterTurbo | 0 / 3 | Not measured | Not scored | NOT RUN; source asset and native capability pending |

For each actual attempt retain: unique job/attempt/request IDs; channel/brand; source/config/lock/model versions and hashes; exact commands; asset and licence inventory; stage/runtime/telemetry CSV or JSONL; provider operations/cost; exits; output manifests/hashes; validation and human score reports; intervention count and minutes; installation/automation complexity; failure reason and next action. Unavailable telemetry is `null` with a reason, never zero.

One run per engine/scenario can establish functional feasibility only. Reproducibility needs a separately approved repeat with frozen assets and environment; compare artifact metadata/scene plan and output quality, not an invented deterministic seed. Production reliability needs crash, outage and repeated-run evidence beyond these eight jobs. Final recommendation and any weighted scores remain pending.
