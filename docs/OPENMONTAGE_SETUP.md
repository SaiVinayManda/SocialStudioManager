# OpenMontage native Windows pilot setup

OpenMontage is primary. The owner explicitly deferred advanced Milestone A hardening and authorized this local pilot before A acceptance. Installation/model/credential/charge/system/publishing gates remain. **B-PILOT-SETUP-01 is pending; nothing has been installed or rendered.** Use [the exact setup packet](OPENMONTAGE_INSTALL_APPROVAL.md), not `make setup`, global installs or automatic `npx` downloads.

Reuse the existing anonymous no-checkout evaluation clone:

```text
C:\Users\Vinay\AppData\Local\Temp\SocialStudio-VideoEngineAudit-20261029\OpenMontage
195eab24478dc9363326aec437aefc3701635ddf
```

The clone currently contains Git objects only. README, operating/context contract, manifests, relevant cinematic director skills, registry/config/dependency declarations, Piper and FFmpeg paths were inspected as data. No upstream import/setup code ran. Materialize one working source tree at `C:\Projects\Manas_Flow\SocialStudio\openmontage` from these existing objects after setup approval; no duplicate clone or network fetch is needed. Keep the engine separate and pinned.

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
| Python packages | Required core/Piper/ONNX packages missing; Pillow 9.5.0 is below upstream >=10. New isolated environment avoids altering owner packages |
| FFmpeg/ffprobe/Piper | Not resolved on this session PATH; portable project-local setup proposed |
| GPU | RTX 4060 Laptop 8,188 MiB, driver 591.91; runtime performance not benchmarked |
| Remotion/HyperFrames | No installed runtime in this no-checkout clone; global availability not asserted; unnecessary for the initial selected route |
| Providers | Real registry preflight NOT RUN. No credential file or provider account is used for the pilot |

Two source discrepancies to handle transparently: Piper's Layer 3 `text-to-speech` pointer currently documents HeyGen; use the inspected official Piper 1.8 CLI, whose speaker/length/silence/output flags match the adapter. Its documented `piper --download-dir ...` setup example is stale for the selected CLI: fetch the pinned model explicitly, never trigger an implicit download. Registry discovery loads a local `.env`; run from the fresh source without a credential-bearing `.env` and with a cleared child environment. Set npm offline/deny auto-install for discovery probes; do not let a status check provision a runtime.

## Brand workspace and later reproduction

Use the supported `OPENMONTAGE_PROJECTS_DIR` setting for `C:\Projects\Manas_Flow\SocialStudio\brands\horror\projects`. Upstream `lib.paths.PROJECTS_DIR`, checkpointing and Backlot share this root, avoiding symlinks or a second production store. `brands/horror/inputs`, `assets`, `projects`, `outputs` and `config` are prepared. Generated media, environments, credentials and the materialized source are Git-ignored; job/config/proposal text is intentionally versioned. No board/server is started by setup approval.

The [job configuration](../brands/horror/config/pilot.json) and [creative draft](HORROR_PILOT_PROPOSAL.md) are proposals. After approval/setup:

1. Select the reviewed pipeline appropriate to an original narrated Horror story using real footage. Read its full manifest and each director skill before executing that stage; keep preflight, capability selection, proposals, checkpoints and approvals.
2. Freeze the exact source/runtime/dependency/font/voice/stock/music/profile versions and rights; prepare the Windows installation/download packet. Reuse installed components only after verifying them under the approved execution identity. No dependency restore or `make setup`/npx fetch is implicit.
3. Evaluate approved Piper/voice, FFmpeg/ffprobe, Remotion and a serial low-resource renderer first. Renderer and AGPL commercial obligations remain a separate review. No large local LLM, CLIP, transcription, diffusion or video model is selected by inclusion in a README.
4. Prepare Horror script/voice/footage/music/subtitle/brand fixtures through the pipeline. Validate rights per item; stock-provider availability does not establish rights. Do not invent narration/media evidence.
5. Render one English 60-second 9:16 1080x1920 MP4, with a strong hook, original script, narration, moving footage, cleared music, burned captions, pacing/transitions and a clear ending.
6. Independently decode/probe the final MP4; verify audio, dimensions, duration, subtitle presentation, all assets/rights and black/frozen/truncated sections. Review the complete video visually and audibly; a static detector alone cannot establish quality or distinguish intended holds.
7. Record actual times, sampled RAM/GPU/VRAM, renderer/dependencies, commands, exits and failures. Planned engine output is `brands/horror/projects/horror-3am-call-001/renders/final.mp4`; expose a validated deliverable in `brands/horror/outputs`. These paths do not yet contain a video. Provide the actual path and approved preview only after success. Build the reusable parameterized entry point afterwards.

Exact setup commands are in [B-PILOT-SETUP-01](OPENMONTAGE_INSTALL_APPROVAL.md). Successful production commands and measured results are **NOT AVAILABLE YET**; record the actual invocations/versions/lock/media hashes/stage approvals as they occur. Do not advertise a one-command production replay before it has rendered. First narration and rendering should use one process at a time, CPU Piper and modest FFmpeg threads; sample total process RAM and nvidia-smi periodically, labeling sampled peaks rather than inventing exact hardware maxima.

MoneyPrinterTurbo's previously approved dependency download is archived evidence only. Do not install/integrate it or Postiz. No OpenMontage dependency, account, model or renderer has been installed/activated during Milestone A coding.
