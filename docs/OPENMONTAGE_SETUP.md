# OpenMontage native Windows pilot setup

OpenMontage is primary; advanced A hardening stays deferred. **The approved local setup and tool tests are complete** under B-PILOT-SETUP-01 and the owner's explicit B-PILOT-CONTINUE-01 grant. 52 frozen wheels installed offline; Piper narration, FFmpeg encoding/probe/full decode, local registry summary and pip check pass. Completed components must not be reinstalled. [Actual results](TEST_RESULTS.md). The original setup packet remains byte-for-byte frozen for audit; its pending label is historical. A finished Horror render still needs authorised moving footage.

Reuse the existing anonymous no-checkout evaluation clone:

```text
C:\Users\Vinay\AppData\Local\Temp\SocialStudio-VideoEngineAudit-20261029\OpenMontage
195eab24478dc9363326aec437aefc3701635ddf
```

The original clone contains Git objects only; its source is now materialized at `C:\Projects\Manas_Flow\SocialStudio\openmontage` from those objects. No duplicate clone/fetch or upstream modification. Engine registry/generation imports have not run. Keep this pinned source separate; do not restart setup or overwrite the existing tree/environment.

## Existing workflow and selected route

OpenMontage is agent-driven, not a topic-to-video CLI daemon. Use `pipeline_defs/cinematic.yaml`: research -> proposal -> script -> scene_plan -> assets -> edit -> compose. Read the current stage director before executing it; persist canonical schema-valid artifacts and upstream checkpoints. Proposal, script, scene plan and assets require human approval under the manifest. No stage approval has been fabricated. Publishing is out of scope.

Use the existing source-footage FFmpeg route, explicitly locked in proposal/edit decisions. Registry-selected `video_stitch` supports cuts/crossfades, `piper_tts` shells out to a local model, `subtitle_gen` produces captions, `audio_mixer` mixes/ducks audio, `color_grade` handles grading and `video_compose` renders/burns subtitles and runs final review. These are source-confirmed capabilities, not locally executed passes. No substitute renderer or still-image slideshow is approved.

The documentary-montage alternative has a direct-search fast path, but its mandatory Remotion end-tag and optional CLIP corpus add work not required for this fiction brief. Remotion/HyperFrames remain excluded from initial setup. Do not install Torch, transcription/CLIP, diffusion or video-generation models implicitly.

Footage: use the existing registry/stock adapters and verified item-level rights from open archives/Commons, or approved supplied footage. Generic provider labels do not clear a clip. Voice: proposed Piper 1.8.0 / en_US-ljspeech-medium, one 63.5 MB model, sample first. Music/effects: proposed original locally synthesized dark ambient score, phone and knocks; record its source recipe, avoiding an unverified third-party recording.

## Actual host findings

| Component | Verified state |
| --- | --- |
| Node/npm | 22.19.0 / 10.9.3; no reinstall |
| Python | Existing 3.11.9 outside PATH, located explicitly; no new interpreter needed. Existing 3.14.9 also inventoried previously, not selected for this Windows ONNX environment |
| Python packages | 52 locked wheels installed in the existing venv; offline pip check passes, owner packages unchanged. Piper 1.8.0 / CPU ONNX Runtime 1.31.1 |
| FFmpeg/ffprobe/Piper | Portable 9.0.2 binaries and real encoding test pass; actual Piper voice WAV generated. All executables project-local, system PATH unchanged |
| GPU | RTX 4060 Laptop 8,188 MiB, driver 591.91; runtime performance not benchmarked |
| Remotion/HyperFrames | No installed runtime in this no-checkout clone; global availability not asserted; unnecessary for the initial selected route |
| Providers | Actual local registry preflight passed: selected Piper/composition/stitch/audio/subtitle tools available. Python networking denied, optional Node runtimes excluded from execution PATH; no credential/provider account used |

Two source discrepancies to handle transparently: Piper's Layer 3 `text-to-speech` pointer currently documents HeyGen; use the inspected official Piper 1.8 CLI, whose speaker/length/silence/output flags match the adapter. Its documented `piper --download-dir ...` setup example is stale for the selected CLI: fetch the pinned model explicitly, never trigger an implicit download. Registry discovery loads a local `.env`; run from the fresh source without a credential-bearing `.env` and with a cleared child environment. Set npm offline/deny auto-install for discovery probes; do not let a status check provision a runtime.

## Brand workspace and later reproduction

The latest output instruction supersedes the initial brand-project location for this job. Use supported `OPENMONTAGE_PROJECTS_DIR=C:\Projects\Manas_Flow\SocialStudio\generated-videos\horror` and project ID `pilot-001`, retaining upstream artifacts/checkpoints in that single job directory. Its requested final/previews/subtitles/scripts/assets/logs folders exist; final target is `final/horror_pilot_001.mp4`. The script, actual voice sample and tool logs are saved there. Older brand config/input directories remain preserved, not duplicated or deleted. Generated videos, environments and source are Git-ignored. No board/server is started.

The [job configuration](../brands/horror/config/pilot.json) and [creative draft](HORROR_PILOT_PROPOSAL.md) are proposals. After approval/setup:

1. Select the reviewed pipeline appropriate to an original narrated Horror story using real footage. Read its full manifest and each director skill before executing that stage; keep preflight, capability selection, proposals, checkpoints and approvals.
2. Freeze the exact source/runtime/dependency/font/voice/stock/music/profile versions and rights; prepare the Windows installation/download packet. Reuse installed components only after verifying them under the approved execution identity. No dependency restore or `make setup`/npx fetch is implicit.
3. Reuse the verified Piper/voice and FFmpeg/ffprobe in a serial low-resource run. Do not install Remotion or other runtimes for this selected path. Licence review for future client deployments remains separate; no large LLM/CLIP/transcription/diffusion/video model is selected by a README claim.
4. Prepare Horror script/voice/footage/music/subtitle/brand fixtures through the pipeline. Validate rights per item; stock-provider availability does not establish rights. Do not invent narration/media evidence.
5. Render one English 60-second 9:16 1080x1920 MP4, with a strong hook, original script, narration, moving footage, cleared music, burned captions, pacing/transitions and a clear ending.
6. Independently decode/probe the final MP4; verify audio, dimensions, duration, subtitle presentation, all assets/rights and black/frozen/truncated sections. Review the complete video visually and audibly; a static detector alone cannot establish quality or distinguish intended holds.
7. Record actual times, sampled RAM/GPU/VRAM, renderer/dependencies, commands, exits and failures. Final target is `generated-videos/horror/pilot-001/final/horror_pilot_001.mp4`, with its requested preview/subtitle/script/asset/log folders. No final video exists yet. Provide its actual path and validated preview only after success. Build the reusable parameterized entry point afterwards.

The frozen setup commands are in [B-PILOT-SETUP-01](OPENMONTAGE_INSTALL_APPROVAL.md); the correction was separately approved/executed. Actual command wrappers, smoke scripts and receipts are retained. `openmontage-ffmpeg-smoke.mjs` and `openmontage-piper-smoke.mjs` both produced real verified outputs and intentionally refuse existing output destinations; do not overwrite them to rerun. `verify-openmontage-local.mjs` rechecks files/packages without installation or network. Successful **production** commands/results are not available yet; record actual invocations/versions/lock/media hashes/approvals as they occur. Do not advertise production replay before a render succeeds. First narration/render should be serial, CPU Piper and modest FFmpeg threads, with sampled process/GPU telemetry labelled accurately.

MoneyPrinterTurbo's previously approved dependency download is archived evidence only. Do not install/integrate it or Postiz. No OpenMontage dependency, account, model or renderer has been installed/activated during Milestone A coding.
