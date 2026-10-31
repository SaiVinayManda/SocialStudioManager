# Generated five-second video: actual deployed acceptance

2026-10-31: **passed**, using a brand-new OpenMontage render triggered by n8n. No existing-file shortcut, inference, downloads, credentials for models, or real publishing. The owner explicitly permitted the supplied-script fixture and isolated mock-test approval. Advanced supervisor work remains deferred.

Final file:

`C:\Projects\Manas_Flow\SocialStudio\generated-videos\horror\door-5s-e74cbd3f-5edd-41ab-9869-2d6364cd7a2b\final\the_door_that_opened_itself.mp4`

5.000 seconds; 1080 × 1920; 30 fps; H.264/AAC; **1,256,353 bytes**.

SHA256: `3c82d7ea829be6e6e537afeb4d484f190aec29fd30c11d58b6b5482923b0e718`.

Content job `4c4e90e0-bc2a-4cba-9ef4-2303beedb710`; media asset `686ffee0-4047-43b5-9201-8fbb1dcf74f7`; Horror brand `10000000-0000-4000-8000-000000000001`.

## What actually ran

The signed n8n intake created `approved_openmontage` source mode with template `horror-door-5s-v1`. Workflow 02 called the durable AI manager in explicit mock mode, preserving the supplied original text: **“I locked the door. Then something knocked from inside.”** This was not a model response. AI task `7dd0cdb9-4ba2-4cc3-850f-cc9e0b04ef30` completed with one simulated `mock` attempt, model label `deterministic-fixture-v2`, zero cost and no invented tokens.

Workflow 03 queued a real render. The authenticated native worker checked the project-specific allowlist/expiry and Python runner digest, then invoked its fixed local template. OpenMontage's existing cinematic checkpoint/artifact APIs, registry `piper_tts`, `audio_mixer` and `video_compose` executed. Proposal/script/scene/assets gate evidence records the owner's explicit approval of this fixed offline test; it does not authorize public posting. Local technical preflight replaces out-of-scope web research, explicitly documented rather than claimed as eight searches. No engine publish stage ran.

The original moving hallway/door scene is procedural animation, **not photorealistic stock footage or AI-generated imagery**. Its 540 × 960 source is upscaled to the requested final 1080 × 1920. Continuous camera push, flicker and opening door provide motion. The drone and knocks are original local mathematical synthesis. Piper 1.8.0 uses the existing English LJSpeech voice; the saved model card identifies a public-domain dataset. No assets/models were downloaded. Attribution, source recipe, narration WAV, mixed WAV, source scene, script, SRT, checkpoints and tool-command receipts are retained in this job folder.

## Actual n8n execution records

These IDs are from the deployed n8n database, associated with this content job through execution-data matching. Only metadata was exported; credential-bearing execution payloads were not exported.

| Workflow | Actual successful execution IDs |
| --- | --- |
| 01 Intake | 4960; duplicate delivery 5003 |
| 02 AI preparation | 4961 |
| 03 OpenMontage production | 4963 |
| 04 Media QC | 4968 |
| 05 Approval | 4969 |
| 06 Scheduler | 4991, 4994, 5000 |
| 07 YouTube mock | 5001 |
| 08 Instagram mock | 4998 |
| 09 Facebook mock | 4992 |
| 10 Notifications | 4962, 4993, 4996, 4997, 4999, 5002, 5004 |
| 11 Recovery | 5060, scheduled global recovery during test interval, not per-video generation |
| 12 Reporting | 5006 |

The API and worker code were refreshed; all twelve workflow definitions were reused without reimport or rebuild. The existing PostgreSQL migrations 001/002 were reused; no migration or database reset was needed. Four existing Compose services are healthy. The single manual worker remains the only media executor; no startup/service registration or ports changed.

## Media checks and measurements

- FFprobe: 5.000 s, 1080 × 1920, H.264/AAC, nonempty file. Full audio/video decoding passed.
- Complete FFmpeg black/freeze detection: no black interval ≥0.1 s and no frozen interval ≥0.5 s at the recorded thresholds. These detectors do not promise perfect visual quality.
- Audio: actual Piper narration is 3.3034 s, padded within a five-second mixed soundtrack; peak −3.8 dBFS, mean −22.2 dBFS. Engine review found narration/music and no clipping or unexpected silence. No ASR was run; listening review remains advisable.
- Burned subtitles: successful logged FFmpeg subtitle filter plus decoded PNG inspection; visible high-contrast English text. SRT existence alone was not treated as burn-in proof. Preview: `previews/frame-2s.png`.
- New output checksum differs from the original sixty-second pilot; no pilot media was copied as the final output.
- **Render subprocess: 19.3928738 s**, exit 0; original scene encoding 6.078 s, included in this total. Worker generation plus validation duration is in the media report. Intake to last mock publication was about 118.8 s, including time waiting for test approval/restarting the idle worker; this is not pure render time.
- 21 host RAM samples; peak **14,389,129,216 bytes (13.40 GiB)**, including Docker/IDE/other applications. Process peak RSS was not measured.
- GPU/VRAM samples were not captured successfully by the clean worker environment. A later interactive `nvidia-smi` query works, but is not a render-time peak measurement. Encoding used CPU libx264, four encoder threads. No GPU usage number is invented.
- API charges: zero; no real model or publishing request.

## Approval, publishing and persistence

The exact media checksum/version received a labelled **MOCK-PUBLISH TEST APPROVAL**, only after QC. n8n's identity was rejected when attempting to decide approval. Scheduling before approval returned 409. Each destination performed fresh worker hash verification, then one mock publishing attempt:

| Platform | Persisted mock ID | Publishing job |
| --- | --- | --- |
| YouTube | `mock-youtube-514a5aa519639e5203f080ad` | `b2ac805a-abd6-4d2f-bdc0-9d8ac82c1db9` |
| Instagram | `mock-instagram-e8cc6c84497917902d9c7592` | `e1b83d45-a7f5-4699-9ec3-78927b0c498c` |
| Facebook | `mock-facebook-2fcf36e28aaef04bcbfd4837` | `3de6b667-7897-4482-8c8d-31a9e041a7ce` |

All three have status `published`, mode `mock`, attempt count one, the same new media asset/checksum, completion timestamps and null errors. These database statuses refer only to simulation; **zero public posts** occurred. Durable AI output/history, media, approval, production tasks, publishing receipts, events and local notifications are in PostgreSQL. Signed duplicate intake returned the same content job without new publications. Reporting completed through n8n.

## Failures and recovery limits

The first rendered attempt (`53ed2356-403c-4923-a3a7-031c02abc6d9`, content job `469c2c0d-4091-4828-a691-82f8bd156b72`) raised possible clipping after loudness normalization. It received a mock-test **rejection** before scheduling. Its MP4 and evidence are preserved. The fix uses explicit narration headroom and the existing audio mixer limiter without normalization; a distinct new content job rendered the accepted file. The runner now rejects a clipping warning. No existing video was overwritten.

Eight actual PostgreSQL checks passed inside rollback transactions: failed render stops QC/approval; failed decode creates no media/scheduling; expired render lease becomes interrupted/manual review; interrupted validation requeues within limits; cancellation defeats late completion; unapproved media cannot schedule; wrong-checksum approval fails; changed checksum invalidates approval and blocks dispatch. Their media reports are synthetic fixtures, not extra real renders. An initial test-fixture checksum collision correctly triggered deduplication; fixed to use distinct fixture checksums, then all eight passed.

A real idle native-worker restart occurred while this job awaited approval; afterward the same job completed its three publishing-verification tasks. Mid-render crash/resume was **not** tested by killing an actual renderer. Render interruption deliberately requires manual review rather than blindly rerunning into existing partial assets. The completed run does not imply automatic arbitrary-topic generation, real AI availability or live publishing readiness.

## Evidence and reproduction

Primary non-secret receipt: [e2e.json](test-evidence/generated-video/e74cbd3f-5edd-41ab-9869-2d6364cd7a2b/e2e.json). [PostgreSQL safety results](test-evidence/generated-video/e74cbd3f-5edd-41ab-9869-2d6364cd7a2b/postgres-generation-safety.json). Job-local `logs/` retains actual tool commands, full QC, resource samples and exit status. Generated media/runtime credentials stay ignored by Git.

For the current session, these commands resume/verify without re-rendering:

```powershell
node scripts/generated-video-e2e.mjs
node scripts/generated-video-qc.mjs
node scripts/generated-video-e2e.mjs --finish-mock-test
node scripts/record-generated-video.mjs
```

The finish flag is only for this owner-authorized isolated mock test; it cannot enable live publishing. The fixed Python generator is invoked by the worker only, never manually during acceptance.

For a newly authorized repeat in a fresh checkout/session, with the existing approved deployment/auth already present: `node scripts/generated-video-local.mjs --new-session --refresh-api --restart-worker`, then the four commands above. The helper refuses an existing session, checks the old worker PID/executable/creation time and idle state, preserves its previous config/receipt, and adds a one-project one-hour render allowlist with the runner SHA256. It cannot confer authority by itself. Do not erase the current session or reuse its output path to force a second render; use an independently reviewed new test session. Ordinary production and publishing approvals remain separate.
