# Milestone E3: dynamic video production acceptance

**Dynamic video acceptance: PASSED. Real-AI acceptance: PENDING AUTHORISATION.**

Three different topics produced three new MP4s through the deployed n8n intake, AI-manager fixture path, native OpenMontage worker, QC, checksum-bound mock-test approval, scheduling, all three mock platforms, notifications and reporting. No manually invoked OpenMontage acceptance render, real model call, paid service, new software/model/media download or public post. The original sixty-second pilot and fixed five-second baseline are checksum-identical.

Primary receipt: [summary.json](test-evidence/milestone-e3/fbd57ede-a022-4807-b255-9eb20207dd8c/summary.json). Individual case receipts include the full structured package, provider attempt, media record, performance, notifications, event history and execution metadata. Generated files and internal credentials remain outside Git.

## New videos

### mirror: A mirror whispers your name when nobody is home.

```text
C:\Projects\Manas_Flow\SocialStudio\generated-videos\horror\topic-789aaabf927070b98a60f52581da9f4a\final\video.mp4
```

5.000 s; 1080 × 1920; H.264/AAC; 772,161 bytes.

SHA256: `1801c5491189bd0ed3bc07f005932f5d1717c9c89f610be413643d1d0482a907`.

Job `5ad0e3ec-b3e2-4ee8-9fa3-947f2f4556ee`; asset `1ca5fd5e-01a1-479c-80b1-eff8dcab75ac`.

Script (**fixture, not a model response**): “Alone at home, I heard my name. The mirror answered.”

Actual visual: environment / mirror, camera push_in.

### road: A driver sees someone standing in the middle of an abandoned road.

```text
C:\Projects\Manas_Flow\SocialStudio\generated-videos\horror\topic-c0af6f72736bc4c27de87f1eb9ae282c\final\video.mp4
```

5.000 s; 1080 × 1920; H.264/AAC; 892,201 bytes.

SHA256: `08fff3e4c2b883937592544eb378d8783cde0ee5f27be483fe5933fe61853670`.

Job `4821d85d-612a-4f81-8fad-b2d04fffaa3c`; asset `e87ffdbc-720a-4a49-abf8-ec487fce8994`.

Script (**fixture, not a model response**): “The road was empty. Then my headlights found someone waiting.”

Actual visual: image_motion / road, camera pan_left.

### message: A phone receives a message from someone who disappeared years ago.

```text
C:\Projects\Manas_Flow\SocialStudio\generated-videos\horror\topic-6135ef9b54a8828f41231d84d849ec1c\final\video.mp4
```

5.000 s; 1080 × 1920; H.264/AAC; 900,936 bytes.

SHA256: `499b3adda87757b164423a77ce5cd3071c5bd5b05cb8f823ac4b85b0736cc335`.

Job `ede518d3-e3c3-42b2-9eb9-b4af0965b536`; asset `77e466d1-6999-41e9-bbc9-c4b082559555`.

Script (**fixture, not a model response**): “Her number vanished years ago. Tonight, it said: I am outside.”

Actual visual: typography / phone, camera drift.

## Actual deployed n8n evidence

| Workflow | Mirror | Road | Message |
| --- | --- | --- | --- |
| 01 | 5810, 5877 | 5821, 5892 | 5833, 5906, 5991 |
| 02 | 5811 | 5822 | 5834 |
| 03 | 5813 | 5824 | 5836 |
| 04 | 5819 | 5830 | 5843 |
| 05 | 5820 | 5831 | 5844 |
| 06 | 5866, 5869, 5872 | 5881, 5886, 5889 | 5895, 5898, 5901 |
| 07 | 5875 | 5890 | 5904 |
| 08 | 5873 | 5887 | 5902 |
| 09 | 5867 | 5884 | 5896 |
| 10 | 5812, 5868, 5870, 5871, 5874, 5876, 5878 | 5823, 5882, 5883, 5885, 5888, 5891, 5893 | 5835, 5897, 5899, 5900, 5903, 5905, 5907, 5992 |
| 12 | 5879 | 5894 | 5908, 5993 |

Workflow 11 is a global scheduled recovery operation, not a per-video step. Its actual successful record is in the primary receipt. All twelve existing workflow definitions remain active and unchanged; workflow 02 already accepts a configurable AI request and workflow 03 already queues/polls rendering. No new workflow per provider or second orchestrator was created. PostgreSQL migration 003 only extends the permitted AI task-type constraint; it preserves existing rows and records its SHA256 in migration history. Migrations 001/002 remain in place.

## What was implemented

- Authenticated topic intake: source_type=topic, brand UUID, topic, duration, idempotency key, explicit fixture/live mode, optional supplied script and safe production settings. Existing intake workflow translates it to approved_openmontage generation, never existing-file import.
- Closed production_package schema: concept/angle/audience/hook/arc, narration/timing/ending, contiguous timed storyboard, camera/transition/atmosphere/audio directions, local asset instructions and five titles plus platform metadata. Schema checks scene order, duration, narration consistency, asset IDs and speech budget. Prompt version studio-production-prompts-v1. Existing v2 task types remain supported.
- Reusable scene execution consumes each job's actual storyboard. It supports animated environments, original still illustration with pan/zoom, progressive typography and graphic/chart components. The three acceptance concepts use different geometry, backgrounds, motion and narration. No topic-specific branch exists in the renderer; the explicit editorial fixtures are separate data.
- Local asset index classifies filenames/tags/metadata, ranks aspect/resolution metadata and penalizes repetition. Only digest-bound same-brand entries with verified licence evidence are eligible. Uncatalogued/missing/changed/unverified media falls back explicitly to original procedural visuals. These three videos used that fallback; no stock footage was silently declared licensed. Actual external local-image/video selection is implemented but not exercised in the three acceptance renders; indexing/provenance failures were tested with labelled synthetic files.
- Piper uses the existing en_US-ljspeech-medium model. Measured phrase WAVs are fitted at 0.85–1.35×, with excessive narration rejected rather than truncated. Subtitles follow measured fitted phrase boundaries with no overlaps; this is phrase alignment, not ASR or word-level recognition. Original drone/effects are mixed with ducking, then normalized/limited using the installed OpenMontage audio tools. Fonts/models are not redistributed or downloaded.
- The fixed Windows worker still runs one media task at a time. Python is a fixed local execution wrapper for the supplied plan, original visual components, canonical artifact/checkpoint APIs and registry tools; it does not execute model-generated code. Existing OpenMontage piper_tts, audio_mixer, audio_enhance and video_compose perform real audio/render work. The FFmpeg runtime and local gate scope are recorded; external web research is explicitly omitted under this offline test scope, not invented. Engine publishing is never invoked.
- Six independent production profiles and asset catalogs live in brands/<slug>/config/. Brand AI prompts/audiences/restrictions remain independent. Horror and an ordinary Travel topic actually rendered; the other four brands are configuration/contract tested. Only the installed English voice and 1080×1920 vertical output are currently enabled. Other voices/models/aspect ratios are not implemented as active options.
- The local worker policy is digest-pinned, six-brand scoped, ≤60 seconds/job, ≤300 seconds/subprocess, at most twelve new renders per policy ledger and a two-hour expiry. Budget slots are consumed before execution and retained after interruption. No privileged service/startup or advanced supervisor was activated. A CLI flag/config proposal cannot grant new authority.

## QC and visual differences

FFprobe, complete audio/video decoding, duration/resolution/codec checks, file hashes, audio headroom, black/freeze checks and source-motion checks passed before test approval. Actual burned subtitles were checked through successful compositor commands, decoded cue-time frames and visible caption pixels. [Caption evidence](test-evidence/milestone-e3/fbd57ede-a022-4807-b255-9eb20207dd8c/caption-evidence.json). No ASR or human listening signoff is claimed.

| Video | Peak dBFS | Mean dBFS | Measured subtitle cues | Longest exact duplicate source-frame run | Result |
| --- | --- | --- | --- | --- | --- |
| mirror | -3.9 | -21.3 | 2 | 0 | passed |
| road | -4 | -21.6 | 2 | 0 | passed |
| message | -4 | -20.7 | 2 | 0 | passed |

Raw midpoint frames were compared **before subtitles**. Pairwise RGB mean absolute differences were 24.30, 23.41, 31.47 /255, above the recorded 4/255 threshold. Different source-video hashes, scenes and narration also passed. This proves imagery changed, not artistic quality or photorealism. [Comparison](test-evidence/milestone-e3/fbd57ede-a022-4807-b255-9eb20207dd8c/visual-comparison.json). All source artwork is stylized 540×960 upscaled to the requested final resolution.

First mirror attempt failed the conservative −50 dB freeze detector and correctly stopped before media registration/approval/publishing. Inspection found 150 changing source frames, zero exact duplicate run and measurable one-second motion; the failure was low-motion sensitivity, not a corrupted file. Camera motion was increased; the detector was calibrated to −65 dB and supplemented with decoded source checks rejecting ≥15 identical frames or insufficient one-second motion. All accepted outputs pass both checks. The first failed job/files remain intact. No QC failure was relabelled successful.

The final message's test harness initially timed out collecting metadata even though all three mock posts had finished: Windows/Docker timestamp skew excluded an intake record. Job-UUID association fixed the collection; existing results were retrieved without re-rendering or repeating any publication attempt. Its prior harness error is retained in the case receipt.

## Performance

| Video | AI fixture ms | Storyboard s | Asset selection s | Voice s | Visual render s | Compose s | QC s | Render subprocess s | Intake→last mock s | Peak host RAM GiB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mirror | 151 | 1.188 | 0.007 | 7.359 | 5.609 | 4.922 | 0.610 | 21.146 | 173.595 | 13.38 |
| road | 94 | 1.234 | 0.006 | 7.266 | 5.531 | 4.828 | 0.640 | 20.943 | 160.582 | 13.48 |
| message | 125 | 1.172 | 0.007 | 7.578 | 8.344 | 4.641 | 0.687 | 23.843 | 146.160 | 13.32 |

Subprocess times include startup, tools, synthesis, composition and engine review; individual phase columns exclude some startup overhead and are not a disjoint sum. Worker-total validation time is retained separately in each receipt. Total workflow time includes time waiting for review, visual inspection and test approval, so it is not pure production latency. Compared with 19.39 s baseline, render ratios are mirror 1.09×, road 1.08×, message 1.23×. RAM samples cover the whole host including Docker/IDE/other applications, not process peak RSS. GPU/VRAM queries returned exit 255 in the sanitized worker, so no render-time GPU peak is claimed; encoding used CPU libx264 with four encoder threads.

## Mock publishing and persistence

| Video | Platform | Persisted mock publication ID | Attempts | Completion UTC |
| --- | --- | --- | --- | --- |
| mirror | facebook | `mock-facebook-6f5ed771b9dfe69a668cd8b2` | 1 | 2026-10-31T15:49:51.686Z |
| mirror | instagram | `mock-instagram-96aa4d6e11c746277705d765` | 1 | 2026-10-31T15:49:55.209Z |
| mirror | youtube | `mock-youtube-d3ffe4bb0a5497e1f4f5f97f` | 1 | 2026-10-31T15:49:54.239Z |
| road | facebook | `mock-facebook-496de6457731285caeb440f6` | 1 | 2026-10-31T15:49:59.223Z |
| road | instagram | `mock-instagram-aa8696f82301671bd1b9cd8e` | 1 | 2026-10-31T15:50:01.654Z |
| road | youtube | `mock-youtube-4fde8a965e2ee2ed6a510b21` | 1 | 2026-10-31T15:50:06.677Z |
| message | facebook | `mock-facebook-a554ed6f621584a0e5d59d1e` | 1 | 2026-10-31T15:50:11.684Z |
| message | instagram | `mock-instagram-919cc7a61520018eb407fe02` | 1 | 2026-10-31T15:50:14.844Z |
| message | youtube | `mock-youtube-52a6220bf57d74833475f972` | 1 | 2026-10-31T15:50:16.679Z |

All nine results are mode=mock/status=published, have null last errors, and reference the matching new media asset/checksum. This is not public publication. PostgreSQL also stores each content job, AI output/attempt, media validation, checksum-bound approval, scheduling, events and local notifications. Duplicate signed intake returns the same job and no extra publications. n8n cannot decide operator approvals. A changed checksum invalidates approval. The ordinary CLI Travel job 74212973-983e-4837-844d-412d5d8dc40c generated a new MP4 without an acceptance-run marker and remains awaiting operator approval, with zero publishing jobs; it was not given a mock-test decision.

## Test evidence and recovery limits

Final local suite: **123/123**, including production schemas, fixture differences, brand/path/provenance boundaries, missing/altered assets, script limits, provider guards and actual FFmpeg process-tree cancellation. Existing deployed regressions: **24 PostgreSQL AI + 11 AI API + 13 existing API**. E3 adds **12 real PostgreSQL checks**, plus **8 generation safety checks**, inside rollback transactions with synthetic media reports. All passed; those reports are not additional rendered-video QC.

Eleven supplemental actual PIL component/overlay checks pass; these are still-frame component checks, not extra video acceptances. The real-provider worker's actual preflight stops at E3_ROUTE_REVIEW_INCOMPLETE before reading its internal key or attempting inference. [Preflight receipt](test-evidence/milestone-e3/fbd57ede-a022-4807-b255-9eb20207dd8c/real-ai-blocked-preflight.json). A real manual worker restart preserved the ordinary Travel job and media checksum while awaiting approval. [Restart receipt](test-evidence/milestone-e3/fbd57ede-a022-4807-b255-9eb20207dd8c/restart-recovery.json). Mid-render process crash/resumption was not tested by killing an acceptance renderer; expired render leases and partial state require manual review. Read-only validation retries remain bounded. Automatic partial-render resume is not implemented.

## Status matrix

| Area | Status |
| --- | --- |
| Three new storyboard-driven videos through deployed n8n | Implemented and tested |
| Ordinary topic CLI and independent Travel profile/render | Implemented and tested; output awaiting approval |
| Script/concept/storyboard/platform metadata generation | Mock/fixture tested; not real AI |
| Local narration, measured captions, mixing, rendering and QC | Implemented and tested |
| Nine checksum-bound mock publications/persistence/reporting | Implemented and tested |
| Local asset index/provenance/fallback | Implemented and tested with fixtures; actual stock selection not end-to-end tested |
| Six brand profiles / ten environment components | Configuration/contract and component-frame tested; only Horror/Travel video tested |
| Multi-scene transitions | Implemented but not end-to-end tested; acceptance videos each have one scene |
| E3 HTTP real-provider worker and bounded guards | Implemented, simulated policy and blocked-start tested; no live model test |
| Real model content generation/fallback | Awaiting AI provider authorisation and route evidence |
| Codex/agy unattended isolated execution | Not implemented as an approved active executor |
| Other voice models / horizontal output / automatic partial-render resume | Not implemented/enabled |
| Public publishing / advanced supervisor activation | Disabled; outside this milestone's approval |

## Operator entry point and next action

See [E3 operator guide](E3_OPERATOR_GUIDE.md) for exact topic submission/recovery commands. No source edit or manually composed scene is needed. The default is a clearly labelled fixture draft; do not describe it as AI generation. For real AI, the minimum next action is the non-secret route/account evidence requested in [the consolidated blocked review packet](E3_AI_APPROVAL.md). No approval is inferred from this report, an installed subscription or the prior Jev packet. No model grant or live worker was created. Old Milestone A tests remain historical and A remains deferred.
