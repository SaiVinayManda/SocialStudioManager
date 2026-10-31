// Generates documentation from saved, non-secret ACTUAL execution receipts.
import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),run=JSON.parse(fs.readFileSync(path.join(root,'.runtime/orchestrator/e3-session.json'),'utf8')),base='docs/test-evidence/milestone-e3/'+run.id;
const s=JSON.parse(fs.readFileSync(path.join(root,base,'summary.json'),'utf8'));
if(!s.dynamic_video_acceptance||s.rows.length!==3)throw Error('Actual accepted video receipts required');
const f=(n,d=3)=>Number(n).toFixed(d),workflow=(r,n)=>r.execution_ids.filter(e=>e.workflow==='socialstudio'+String(n).padStart(4,'0')).map(e=>e.id).join(', ');
const links=s.rows.map(r=>`### ${r.case}: ${r.topic}\n\n\`\`\`text\n${r.path}\n\`\`\`\n\n${f(r.duration)} s; ${r.width} × ${r.height}; H.264/AAC; ${r.bytes.toLocaleString('en-US')} bytes.\n\nSHA256: \`${r.checksum}\`.\n\nJob \`${r.job_id}\`; asset \`${r.asset_id}\`.\n\nScript (**fixture, not a model response**): “${r.script}”\n\nActual visual: ${r.scenes[0].component} / ${r.scenes[0].environment}, camera ${r.scenes[0].camera}.\n`).join('\n');
const workflowRows=Array.from({length:12},(_,i)=>i+1).filter(n=>n!==11).map(n=>`| ${String(n).padStart(2,'0')} | ${s.rows.map(r=>workflow(r,n)).join(' | ')} |`).join('\n');
const perf=s.rows.map(r=>{const p=r.performance;return `| ${r.case} | ${p.ai_task_ms} | ${f(p.storyboard_preparation_seconds)} | ${f(p.asset_selection_seconds)} | ${f(p.voice_generation_seconds)} | ${f(p.visual_render_seconds)} | ${f(p.composition_seconds)} | ${f(p.qc_seconds)} | ${f(p.render_subprocess_seconds)} | ${f(p.intake_to_last_mock_publication_seconds)} | ${f(p.resources.peak_host_ram_bytes/1073741824,2)} |`;}).join('\n');
const pub=s.rows.flatMap(r=>r.publishing.map(p=>`| ${r.case} | ${p.platform} | \`${p.post_id}\` | ${p.attempt_count} | ${p.completed_at} |`)).join('\n');
const q=s.rows.map(r=>`| ${r.case} | ${r.quality.peak_dbfs} | ${r.quality.mean_dbfs} | ${r.quality.subtitle_cues} | ${r.quality.source_motion_metrics.map(m=>m.longest_exact_duplicate_run).join(', ')} | passed |`).join('\n');
const doc=`# Milestone E3: dynamic video production acceptance

**Dynamic video acceptance: PASSED. Real-AI acceptance: PENDING AUTHORISATION.**

Three different topics produced three new MP4s through the deployed n8n intake, AI-manager fixture path, native OpenMontage worker, QC, checksum-bound mock-test approval, scheduling, all three mock platforms, notifications and reporting. No manually invoked OpenMontage acceptance render, real model call, paid service, new software/model/media download or public post. The original sixty-second pilot and fixed five-second baseline are checksum-identical.

Primary receipt: [summary.json](test-evidence/milestone-e3/${run.id}/summary.json). Individual case receipts include the full structured package, provider attempt, media record, performance, notifications, event history and execution metadata. Generated files and internal credentials remain outside Git.

## New videos

${links}
## Actual deployed n8n evidence

| Workflow | Mirror | Road | Message |
| --- | --- | --- | --- |
${workflowRows}

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

FFprobe, complete audio/video decoding, duration/resolution/codec checks, file hashes, audio headroom, black/freeze checks and source-motion checks passed before test approval. Actual burned subtitles were checked through successful compositor commands, decoded cue-time frames and visible caption pixels. [Caption evidence](test-evidence/milestone-e3/${run.id}/caption-evidence.json). No ASR or human listening signoff is claimed.

| Video | Peak dBFS | Mean dBFS | Measured subtitle cues | Longest exact duplicate source-frame run | Result |
| --- | --- | --- | --- | --- | --- |
${q}

Raw midpoint frames were compared **before subtitles**. Pairwise RGB mean absolute differences were ${s.visual_comparison.comparisons.map(x=>f(x.mean_absolute_pixel_difference_0_to_255,2)).join(', ')} /255, above the recorded 4/255 threshold. Different source-video hashes, scenes and narration also passed. This proves imagery changed, not artistic quality or photorealism. [Comparison](test-evidence/milestone-e3/${run.id}/visual-comparison.json). All source artwork is stylized 540×960 upscaled to the requested final resolution.

First mirror attempt failed the conservative −50 dB freeze detector and correctly stopped before media registration/approval/publishing. Inspection found 150 changing source frames, zero exact duplicate run and measurable one-second motion; the failure was low-motion sensitivity, not a corrupted file. Camera motion was increased; the detector was calibrated to −65 dB and supplemented with decoded source checks rejecting ≥15 identical frames or insufficient one-second motion. All accepted outputs pass both checks. The first failed job/files remain intact. No QC failure was relabelled successful.

The final message's test harness initially timed out collecting metadata even though all three mock posts had finished: Windows/Docker timestamp skew excluded an intake record. Job-UUID association fixed the collection; existing results were retrieved without re-rendering or repeating any publication attempt. Its prior harness error is retained in the case receipt.

## Performance

| Video | AI fixture ms | Storyboard s | Asset selection s | Voice s | Visual render s | Compose s | QC s | Render subprocess s | Intake→last mock s | Peak host RAM GiB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${perf}

Subprocess times include startup, tools, synthesis, composition and engine review; individual phase columns exclude some startup overhead and are not a disjoint sum. Worker-total validation time is retained separately in each receipt. Total workflow time includes time waiting for review, visual inspection and test approval, so it is not pure production latency. Compared with 19.39 s baseline, render ratios are ${s.rows.map(r=>r.case+' '+f(r.performance.render_relative_to_19_39s_baseline,2)+'×').join(', ')}. RAM samples cover the whole host including Docker/IDE/other applications, not process peak RSS. GPU/VRAM queries returned exit 255 in the sanitized worker, so no render-time GPU peak is claimed; encoding used CPU libx264 with four encoder threads.

## Mock publishing and persistence

| Video | Platform | Persisted mock publication ID | Attempts | Completion UTC |
| --- | --- | --- | --- | --- |
${pub}

All nine results are mode=mock/status=published, have null last errors, and reference the matching new media asset/checksum. This is not public publication. PostgreSQL also stores each content job, AI output/attempt, media validation, checksum-bound approval, scheduling, events and local notifications. Duplicate signed intake returns the same job and no extra publications. n8n cannot decide operator approvals. A changed checksum invalidates approval. The ordinary CLI Travel job 74212973-983e-4837-844d-412d5d8dc40c generated a new MP4 without an acceptance-run marker and remains awaiting operator approval, with zero publishing jobs; it was not given a mock-test decision.

## Test evidence and recovery limits

Final local suite: **123/123**, including production schemas, fixture differences, brand/path/provenance boundaries, missing/altered assets, script limits, provider guards and actual FFmpeg process-tree cancellation. Existing deployed regressions: **24 PostgreSQL AI + 11 AI API + 13 existing API**. E3 adds **12 real PostgreSQL checks**, plus **8 generation safety checks**, inside rollback transactions with synthetic media reports. All passed; those reports are not additional rendered-video QC.

Eleven supplemental actual PIL component/overlay checks pass; these are still-frame component checks, not extra video acceptances. The real-provider worker's actual preflight stops at E3_ROUTE_REVIEW_INCOMPLETE before reading its internal key or attempting inference. [Preflight receipt](test-evidence/milestone-e3/${run.id}/real-ai-blocked-preflight.json). A real manual worker restart preserved the ordinary Travel job and media checksum while awaiting approval. [Restart receipt](test-evidence/milestone-e3/${run.id}/restart-recovery.json). Mid-render process crash/resumption was not tested by killing an acceptance renderer; expired render leases and partial state require manual review. Read-only validation retries remain bounded. Automatic partial-render resume is not implemented.

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
`;
fs.writeFileSync(path.join(root,'docs/E3_DYNAMIC_VIDEO.md'),doc);console.log(JSON.stringify({report:'docs/E3_DYNAMIC_VIDEO.md',videos:s.rows.length,model_requests:0,public_posts:0}));
