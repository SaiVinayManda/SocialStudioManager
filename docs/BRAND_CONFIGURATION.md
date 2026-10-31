# Brand configuration plan

**E3 supersedes the historical design-only snapshot below.** Six brand registries, independent AI profiles, `production.json` and `asset-catalog.json` files are implemented. Horror has three actual dynamic n8n video acceptances; Travel has an ordinary topic-rendered draft awaiting approval. Other brands are configuration/contract tested. No live social credentials were provisioned. [Current configuration and safe asset format](E3_OPERATOR_GUIDE.md), [verification status](E3_DYNAMIC_VIDEO.md). Existing English Piper is the only enabled voice; each brand can independently configure the supported palette, style, subtitles and music policy. Adding unsupported voices/models or other integrations retains approval gates.

Status: design only. No brand ingestion folders, voices, credentials, schedules or production jobs have been activated. Milestone A must pass before product implementation.

| Brand ID | Display name | Rollout |
| --- | --- | --- |
| horror | Horror | First production pilot |
| storytelling | Storytelling | After accepted Horror route |
| motivation | Motivation | Later approved brand |
| travel | Travel | Later approved brand |
| business-insights | Business Insights | Later approved brand |
| company | Company | Later approved brand |

Each immutable brand profile will reference independent input folders, palette/logo/font assets and licences, narration voice/language, production/caption style, content templates, hashtag rules, n8n schedule/timezone, destination/credential IDs, approval policy and content history. Keep secrets in the approved credential store; profiles contain references only. A new brand is configuration/data, not a core code change.

Future ingestion copies stable, size-bounded files from registered roots, deduplicates by content/version hash, and assigns a brand before queueing. Google Drive uses separately approved OAuth and folder/file/version IDs. Never give a generation worker Drive credentials, arbitrary paths/URLs or another brand's assets.

Uploaded-video highlight selection is a separate evaluated capability: transcript, ranked candidate moments, source timecodes, context/rationale, framing and captions. OpenMontage's director guidance and FFmpeg trimming are not proof of automatic viral highlight detection. Each social destination is independent and explicitly bound to the brand; no cross-brand posting fallback is allowed.
