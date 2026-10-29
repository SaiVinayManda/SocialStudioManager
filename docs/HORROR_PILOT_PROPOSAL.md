# Horror pilot: The Second Caller

Draft for review, not an approved OpenMontage checkpoint. Runtime/provider preflight, research, proposal approval, script/scene gates and asset review remain to be executed through the existing cinematic pipeline. No footage, voice, music or MP4 has been generated.

Use [the job configuration](../brands/horror/config/pilot.json): original English story, about 60 seconds, 1080x1920, 30 fps, real moving footage. Proposed route: cinematic pipeline, explicitly locked FFmpeg runtime, CPU Piper narration, locally authored ambient score and effects, phrase subtitles. No still-image substitute or paid provider.

## Proposed narration

At three AM, I called myself.

A woman whispered, "Whatever knocks, don't open the bedroom door."

It was my voice.

Three knocks came from the hallway.

"How do you know?" I asked.

"Because I opened it."

The handle turned.

On the phone, I heard myself screaming.

Then a text appeared: CHECK UNDER YOUR BED.

I stopped breathing.

"Don't worry," the caller whispered. "The thing outside isn't looking for you."

The knocking stopped.

Something beneath the mattress breathed against my ear.

"It's looking for me."

My phone rang again. From my mother's number.

Under the bed, my own voice whispered:

"This time, let me answer."

## Proposed moving-footage coverage

| Planned time | Coverage and audio |
| --- | --- |
| 0-3s | Immediate moving phone close-up, ring interrupt, opening hook in narration/captions |
| 3-12s | Rain against glass and phone/hand details; intimate dry narration, low ambient pulse |
| 12-22s | Dark hallway or doorway, three spatial knocks, slow push or naturally moving shadow |
| 22-33s | Handle/door detail and phone insert; controlled tension rise, brief phone-filtered scream implied by sound design |
| 33-44s | Bed/curtain or low interior detail, subtitle reveal, sparse breathing and a low drone |
| 44-54s | Return to hallway/phone coverage with tighter cuts; resolve the first warning |
| 54-60s | Phone light/ringing, whisper ending, hold the final moving shot long enough to read the last caption |

These are coverage targets, not claims that matching assets exist. Avoid effects requiring a specific actor/reflection/monster continuity. Select only verified-license moving clips; record crops, in/out points, creator, source URL, license URL/version, download hash and attribution. If coverage is unavailable, revise the proposed shot coverage openly before locking assets; never replace it silently with stills.

Durations are estimates pending a real narration sample. Align subtitles to measured per-utterance audio and allow pauses for suspense; do not label estimated word timing as forced alignment. Review the voice sample for naturalness before full narration. Use FFmpeg-backed OpenMontage video_stitch for selected crossfades, audio_mixer for narration/score/effects and video_compose for the locked render and final review.

## Acceptance

A real playable MP4, 1080x1920, 9:16, approximately 57-63 seconds, audible intelligible narration, quiet music under speech, readable synchronized burned captions, real moving footage, no unintended black/frozen gaps, all assets present and rights documented. Retain probe/full-decode/detector reports, sampled frames, audio/mix results, manual visual/listening review, production timing and sampled process/GPU telemetry. No posting. The reusable production entry point follows the first successful video.
