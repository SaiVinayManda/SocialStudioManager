# First real Horror pilot: executed render recipe

Final: `C:\Projects\Manas_Flow\SocialStudio\generated-videos\horror\pilot-001\final\horror_pilot_001.mp4`.

Actual result: 60.000 s, 1080x1920, 30 fps, H.264 yuv420p + AAC, 21,303,869 bytes. SHA256 `48fb3d02aecb4e83c43654d111194fd44870011c229a8b7387d8a83096858528`. [Evidence](test-evidence/openmontage-pilot-render-01/render_report.json). Review copy: `generated-videos/horror/pilot-001/previews/horror_pilot_001_preview.mp4`. Open either file in the installed Windows video player. Human listening/pacing review is pending; no publishing occurred.

## Scope and preserved inputs

Reused pinned OpenMontage source `195eab24478dc9363326aec437aefc3701635ddf`, project-local Python environment, portable FFmpeg/ffprobe 9.0.2, Piper 1.8.0 / existing en_US-ljspeech-medium narration, original score/effects and 32 generated SRT cues. No software/model/credential change. The continuation downloaded only the three exact approved 720p interior clips, 11,459,413 bytes, within 17 MiB and the unchanged cumulative limits. All six source files passed independent hashes, probe and full decode.

This is a record of commands actually used, **not permission to rerun them over the completed pilot**. Helpers preserve existing outputs and are scoped to pilot-001. A reusable new-job entry point remains B-07 backlog work. No byte-identical rerender is promised; versions, inputs, tool payloads, selects and actual FFmpeg commands are retained for repeatability/debugging.

## Stage execution

Research/proposal/script/scene-plan checkpoints already existed. The owner granted unchanged full-run creative production through validation; this is recorded in upstream decision_log. The agent read the cinematic directors and used upstream checkpoint validation. This continuation stayed inside that pipeline:

```powershell
node scripts/acquire-horror-media.mjs generated-videos/horror/pilot-001/logs/media-download-continuation.json --continuation=B-PILOT-MEDIA-CONTINUE-01
node scripts/audit-horror-sources.mjs
node scripts/prepare-horror-picture.mjs
node scripts/finish-horror-assets.mjs
node scripts/openmontage-local-call.mjs generated-videos/horror/pilot-001/logs/assets-complete-render.json
node scripts/openmontage-local-call.mjs generated-videos/horror/pilot-001/logs/edit-start-render.json
node scripts/openmontage-local-call.mjs generated-videos/horror/pilot-001/logs/edit-complete-render.json
node scripts/openmontage-local-call.mjs generated-videos/horror/pilot-001/logs/compose-start-render.json
node scripts/openmontage-local-call.mjs generated-videos/horror/pilot-001/logs/stitch-approved.json
node scripts/openmontage-local-call.mjs generated-videos/horror/pilot-001/logs/compose-approved-compatible.json
node scripts/validate-horror-final.mjs
node scripts/record-horror-final.mjs
node scripts/openmontage-local-call.mjs generated-videos/horror/pilot-001/logs/compose-complete-final.json
```

Acquisition was a specifically granted external operation. Local Python calls needed tool escalation because the filesystem sandbox cannot launch the existing Store Python base; this did not elevate to administrator or change Windows. Local generation uses a cleared environment, no credentials, and denied Python sockets/DNS. Upstream source code remains unchanged; the per-job wrapper adds command logging, FFmpeg benchmark reporting and bounded thread counts. This is not a claim of accepted operating-system isolation or live Hermes security.

Picture preparation makes source selects, crop/grade and per-scene review frames; it does not replace upstream full-film assembly. Eight selects total 62.8 s. Upstream video_stitch subtracts seven 0.4 s crossfade overlaps, producing 60.0 s. Upstream video_compose adds the **existing** audio mix and burns the styled ASS captions, explicitly retaining the proposal's FFmpeg runtime and passing proposal_packet for runtime review. The publish stage is not entered.

## Source-confirmed compatibility and failures

`node scripts/openmontage-local-call.mjs .../compose-approved.json` returned `'str' object has no attribute 'items'` before writing an MP4. The artifact schema allows `subtitles.style: "sentence"`, but `VideoCompose._resolve_subtitle_style` calls `.items()` on that field. Minimum fix: omit the optional string in the tool-call copy; retain the explicit `subtitle_style` dictionary. The canonical editorial artifact remains valid. This correction created `compose-approved-compatible.json`; it did not change provider, runtime, typography or upstream source.

An initial phone-screen blend expression timed out at 120 seconds. Its exact FFmpeg command/error and partial derived file are preserved in `logs/shot-05-screen-diffusion.json` and `assets/selects/shot-05-screen-diffusion.mp4`. A fast crop/blur/overlay correction wrote new `*-screen-diffusion-v2.mp4` files, removing unrelated stock caller text without replacing real motion. One checkpoint command ran before that preparation had finished and stopped on missing request JSON; no pipeline state changed, and it was retried after completion.

The first successful run's instrumentation inadvertently re-encoded a concat-copy step. The captured command and its time remain evidence. The helper now honors explicit global `-c copy` / `-codec copy` flags. No delivered MP4 was rerendered for this optimization. The minimal-environment GPU sampler could not query NVML; 45 independent read-only whole-GPU samples during composition supplied the reported observations instead.

## Validation and measured limits

Independent FFprobe and full-video decode passed. No black/freeze reports at the thresholds recorded in validation.json. Eight actual final frames showed readable, unclipped captions; decoded audio correlated 0.996691 with the reused mix. Final audio measured -16.56 LUFS / -0.83 dBTP. ASR/forced alignment was not run; no human listening pass is claimed.

Successful upstream render stages: stitch 51.080 s + compose/self-review 194.927 s = **246.007 s**. Source-select preparation separately took 97.241 s. From continuation session start to finished MP4 was 25 min 57.280 s, including local preparation, debugging and approval/tool waits; it excludes the previously completed narration/script/audio work. Largest FFmpeg-process RSS: ~1.67 GiB. Whole-GPU observed peaks: 1,382 MiB / 25%, including unrelated applications; rendering was CPU libx264, not a GPU video-generation model.

Known review points: three interior sources upscaled from 720p, suggestive stock continuity, visible phone-screen diffusion, and interpolated timing within narration phrases. Individual source/licence URLs and hashes are in `assets/ATTRIBUTION.md` and `assets/source-downloads.json`; music/effects are original local synthesis with recipe/seed/hash retained. Media and runtime remain Git-ignored. Supervisor history is preserved and advanced Milestone A remains deferred.
