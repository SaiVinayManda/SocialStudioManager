# MoneyPrinterTurbo evaluation and integration requirement

**Historical single-engine proposal.** The later two-engine Phase A request authorized read-only source clones before M4. See [VIDEO_ENGINE_COMPARISON.md](VIDEO_ENGINE_COMPARISON.md) for the exact cloned revisions/current source audit, [VIDEO_ENGINE_BENCHMARKS.md](VIDEO_ENGINE_BENCHMARKS.md) for all four scenarios, and [VIDEO_ENGINE_ARCHITECTURE.md](VIDEO_ENGINE_ARCHITECTURE.md) for the six-operation interface. The status and findings below describe the earlier reconnaissance; they are not current evidence that no clone exists. Runtime tests and production integration remain unperformed.

Status: **required future evaluation; foundation research only**. Recorded and publicly inspected on 2026-10-29. Remote-development M4 has not been accepted. No clone, dependency installation, model download, authentication, generation run, adapter implementation or production integration has occurred.

Repository: [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo). Treat it as a candidate topic-to-video engine behind a replaceable adapter. Social Studio retains its own product architecture, job model, media library and review flow. Preserve the independent FFmpeg workflow that converts existing long-form videos into reels. All publishing and scheduling belong to n8n.

## 1. Sequence and gates

1. Finish Hermes + Telegram + restricted supervisor + Codex remote development and obtain owner acceptance of **M4 / ACCEPT-01**.
2. Bind VE-01 to a reviewed full upstream commit and isolated evaluation destination. Clone there without executing upstream code, fetching submodules/LFS implicitly, or incorporating it into production. Capture source identity and inspect the pinned tree.
3. Inspect the licence, dependency/lock files, configuration and defaults, API/CLI, downloads, external services, publishing hooks, maintenance and tests. Deliver an itemized installation/configuration/permission packet before setup.
4. With applicable grants, run a real topic-to-video sample and bounded comparisons on the target RTX 4060 8 GB GPU / 16 GB RAM machine. Capture artifacts and actual measurements, including failures.
5. Under an adapter implementation grant, build and verify the reusable contract below. Keep results quarantined and production integration disabled.
6. Present findings, unresolved risks and required human actions. The owner chooses adopt, conditional adoption, defer or reject before separately authorizing production integration. An adverse evaluation may justify deferral or rejection rather than rollout.

The proposed tasks are **VE-01 through VE-05** in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). Installation, large or small model downloads, credential use, external integrations, paid APIs and public publishing retain their approval gates in [HUMAN_ACTIONS.md](HUMAN_ACTIONS.md). A zero-price service still needs an approved data flow; a subscription or saved login is not permission to use it.

## 2. Preliminary public-source findings

These are observations from browser-accessible upstream files, not a pinned checkout audit or executed tests. The `main` links below move over time; recheck every finding against the approved commit after cloning. No dependency vulnerability scan, complete transitive licence audit or local compatibility check has run.

| Area | Observed evidence | Evaluation implication |
| --- | --- | --- |
| Licence | The root [LICENSE](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/LICENSE) is MIT, copyright 2024 Harry. | Retain its notice when distributing covered code. Separately inventory dependency licences and footage, music, font, model and voice terms; the root licence alone does not establish rights to those assets. |
| Python and dependency declarations | [pyproject.toml](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/pyproject.toml) declares Python >=3.11 and package version 1.3.9. It includes MoviePy 2.2.1, FastAPI 0.136.3, Streamlit 1.59.1, edge-tts 7.3.1, faster-whisper 1.1.0, imageio-ffmpeg 0.6.0 and several provider SDKs. [requirements.txt](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/requirements.txt) identifies `pyproject.toml` / `uv.lock` as primary. | Review the complete lock, platform wheels, build hooks, binary provenance, download sizes and native requirements. A Python runtime was not found on the earlier session PATH; do not auto-download one. Do not install the entire UI/provider stack without reviewing what the engine actually requires. |
| Configuration | [config.example.toml](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/config.example.toml) defaults to `0.0.0.0:8080`, an empty optional API key, five concurrent API tasks, Edge subtitles, and a `large-v3` Whisper model configured for CPU/int8 if selected. Its comments describe first-use model downloading. | Use an explicit reviewed configuration, private binding, concurrency one and controlled downloads. Keep credentials/configuration out of Git and artifacts. Do not select Whisper without a separately approved model artifact. |
| API | [video controller](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/app/controllers/v1/video.py) and [router base](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/app/controllers/v1/base.py) define `POST /api/v1/videos`, `GET /api/v1/tasks/{task_id}`, audio/subtitle operations and artifact retrieval. | Candidate asynchronous service interface. Validate request/result schemas and terminal states at the pinned revision; keep it private. The adapter must not expose deletion, configuration or arbitrary file endpoints to Studio jobs. |
| CLI | [cli.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/cli.py) exposes topic/script inputs, local or remote media, pipeline stages, aspect ratios, JSON results and exit status. Its help says the final video stage can run configured cross-posting. | Prefer evaluating one fixed CLI process per job first for cancellation and isolation. Validate actual output, not just exit zero or an upstream success flag. CLI capability does not imply a verified safe wrapper. |
| Voice, footage and music | The [English README](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/README-en.md) advertises Edge and other TTS providers, stock/local media, subtitle styling and background music. | Availability, rights, relevance, language quality and synchronization need actual evaluation. Edge TTS is an external service even when no API key is required. No provider has been activated. |
| Rendering | [video service](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/app/services/video.py) contains MoviePy/FFmpeg processing, `libx264` default and optional `h264_nvenc` support. | The RTX 4060 does not guarantee GPU use or a particular throughput. Verify the encoder and GPU path at runtime and record any CPU fallback. No CUDA/driver/library change is authorized. |
| Publishing | Upstream configuration contains Upload-Post integration and automatic-upload switches; upstream CLI generation can reach it. | Force publishing off, provide no publishing credentials and deny publisher endpoints. Verify with a negative test. Do not wrap upstream publishing as a Studio feature; n8n owns this boundary. |
| Maintenance | The retrieved [release page](https://github.com/harry0703/MoneyPrinterTurbo/releases/tag/v1.3.9) labels v1.3.9 as Latest, dated 21 October. The retrieved [commit view](https://github.com/harry0703/MoneyPrinterTurbo/commits/main/) was cached and headed 2026-09-11, with merged fixes/contributions. | There is evidence of recent release activity, but the freshest HEAD and exact release SHA are not verified. Recheck releases, commit dates, issue response, security advisories and CI at VE-01. Activity is not evidence of security or production suitability. |

The anonymous GitHub API commit query was inaccessible through the browser tool. No authenticated connector or saved credential was used to work around it. No upstream full commit is selected or approved for execution yet.

Preliminary decision: **retain as a candidate for isolated evaluation; no production suitability decision yet**. Quality, successful end-to-end generation, peak memory, GPU use and performance on the target hardware are all **NOT RUN / UNVERIFIED**.

## 3. Architecture boundary

```mermaid
flowchart LR
    Studio[Social Studio structured media job] --> Router[Engine adapter router]
    Router --> MPT[MoneyPrinterTurbo adapter: topic to video]
    Router --> Reels[Separate FFmpeg adapter: long video to reels]
    MPT --> Artifacts[Validated local media, metadata, logs and errors]
    Reels --> Artifacts
    Artifacts --> Review[Studio human review]
    Review --> N8N[n8n: all scheduling and publishing]
```

This is a proposed product boundary, not a deployed service. The remote-development supervisor controls approved development tasks; it does not become the product's publishing scheduler. n8n setup is separately gated, and no live n8n connection is part of foundation work.

Use a separate evaluation runtime and scratch root, such as logical `<isolated-evaluation-root>/moneyprinterturbo/<full-commit>/source`, plus per-run input/output directories. The operator chooses and approves the actual absolute paths. Keep the clone outside the owner's production checkout and accepted baseline; do not vendor it, add a submodule or alter production dependencies during evaluation. Directory separation alone does not enforce filesystem, process or network isolation.

Generation receives only approved input assets and scoped provider access. It cannot read the owner's home/authentication, supervisor state, n8n credentials or unrelated projects. No host drives or Docker socket are mounted. Bind any optional API to a private interface, review authentication, and expose only the adapter's required operations. Publishing is disabled in configuration and denied by egress policy; missing isolation or publishing controls stop the run.

Do not follow upstream instructions that automatically install, update, connect accounts, launch agent skills or run sample pipelines. Pin and review code first. Choose approved offline fixtures or narrowly approved LLM/TTS/stock endpoints; no generic HTTP proxy, automatic paid fallback or undeclared download is permitted. Keep the existing remote-worker secret/network boundary intact; approve any dedicated generation broker/runtime separately.

## 4. Proposed reusable adapter contract

This contract is design documentation, not implemented code or an executable task manifest. Before VE-04, freeze a strict versioned schema, reject unknown fields and cap all strings/arrays/numbers. The trusted caller supplies validated identifiers; a job cannot grant permissions.

| Input | Required meaning |
| --- | --- |
| `schema_version`, `job_id`, `idempotency_key` | Contract version and stable identifiers. Bind idempotency to the canonical request hash; changed content with the same key is an error. |
| `operation`, `engine_profile_id` | `topic_to_video` selects the reviewed MoneyPrinterTurbo profile; `long_video_to_reels` selects the independent FFmpeg profile. Never silently route one through the other. |
| `content` | Topic, language, optional prepared script and approved search terms. Bound text; treat it as content, never commands or tool instructions. A supplied script test cannot replace the topic-to-video acceptance test. |
| `render` | Target duration, supported aspect/resolution/frame rate, output count and reviewed style profile. Reject unsupported choices rather than claiming they were honored. |
| `audio`, `subtitles`, `media` | Approved voice/provider, subtitle/style, music and stock/local-asset profile IDs; immutable asset references with hashes. Local asset IDs resolve inside the registered input root. |
| `limit_profile_id` | Reference to trusted time/memory/VRAM/disk/network/cost ceilings. Effective limits are the minimum of job, runtime and owner grant. |

Jobs contain no shell text, executable, CLI flags, arbitrary path/URL, environment overrides, raw API keys, OAuth/session data, publishing target or schedule. Provider endpoints, credential routing, executable/argument vectors and source versions come only from reviewed protected profiles. Translate fields explicitly; never pass arbitrary job fields directly into upstream `VideoParams` or a CLI batch manifest.

Expose wrapper operations `submit(job)`, `get(job_id)` and `cancel(job_id)`. Proposed states are `queued`, `running`, `validating`, `succeeded`, `failed`, `cancelled` and `timed_out`. A cancellation terminates and verifies the entire process tree before resources are released. Do not assume upstream has an API cancellation primitive. An unknown process or provider outcome pauses new work and requires reconciliation.

| Result | Required evidence |
| --- | --- |
| Identity and status | Contract/job/request hash; engine/adapter version; pinned source and runtime/configuration digests; terminal state, timestamps and observed exit code. |
| Video files | One or more validated local artifact references, relative path inside the export root, MIME/type, byte length, SHA-256, duration, dimensions, frame rate and codecs. No untrusted upstream absolute path or download URL is returned directly. |
| Metadata | Final script/topic/language, subtitle file, voice/audio and music references, media source/asset IDs and rights evidence, render settings and known random seeds. Label unavailable optional artifacts explicitly. |
| Logs | Bounded redacted stdout/stderr and structured stage-event artifacts, each with hashes; controller observations separate from upstream/model narrative. No tokens, saved configuration or raw credential-bearing URLs. |
| Usage | Stage/wall time, CPU/process-tree RAM, GPU/VRAM with sampling method, scratch/output/download bytes, provider calls and actual/reserved cost/currency. Unavailable telemetry is marked unknown. |
| Errors | Stable code, failing stage, safe message, retryability, evidence reference and required human action. Suggested codes: `INVALID_JOB`, `APPROVAL_REQUIRED`, `DEPENDENCY_MISSING`, `PROVIDER_ERROR`, `RESOURCE_LIMIT`, `TIMEOUT`, `CANCELLED`, `ENGINE_FAILED`, `ARTIFACT_INVALID`. |

Preserve validated partial artifacts and failure logs with a failure status. Do not return a partial video as success. Retry only within an explicit grant and after checking that neither a local output nor a billable provider operation will be duplicated. Resubmitting a successful idempotency key returns its existing result.

The trusted exporter rejects traversal, symlinks/reparse points, nonregular files, oversized artifacts and paths outside the run root. It inspects media using a reviewed validation profile in isolation; arbitrary media parsers remain untrusted code. Success requires actual decodable output and mandatory artifacts, not merely an upstream task state. No deployment, deletion, publication or scheduling side effect is part of this adapter.

## 5. Topic-to-video and hardware evaluation protocol

Target: **RTX 4060 with 8 GB VRAM and 16 GB system RAM**, as specified by the owner. The foundation inventory observed approximately 15.8 GB RAM; the GPU, driver, available memory, encoder support and GPU visibility inside the eventual isolated runtime have not been verified. The combined footprint of the host, Hermes/supervisor, n8n if later running, and video process matters.

Prepare one immutable sample fixture: topic **How rainbows form**, English narration, target 30-60 seconds, one 9:16 1080x1920 MP4, H.264/AAC, subtitles, stock footage, one approved voice and rights-cleared local music. Record exact prompt, language, provider/model/voice, media IDs, configuration and source/runtime hashes. The owner may select another topic/language before the fixture is approved.

The primary run starts from the topic and actually generates its script, voice, subtitles, selected stock footage and finished video using approved services. Record manual interventions. A fixed-script/local-media smoke test is useful but must be labeled separately and cannot satisfy the complete topic-to-video requirement. If provider approvals or rights are missing, mark the relevant run pending rather than substituting an unapproved source.

After the initial successful run, compare a frozen script/media fixture across the approved CPU baseline and NVENC path if supported, changing only the encoder. Optional second language, alternate voice or Whisper comparisons need explicit run/model grants. Reuse approved assets where possible; capture unavoidable provider/random differences rather than claiming byte-for-byte reproducibility. Do not run local LLM, TTS and transcription models together by default on this hardware.

Proposed starting limits, **not authorized**: one job, one output, serial clip/material processing, 20 minutes per attempt, at most one separately authorized retry, 8 GiB process-tree RAM, 6.5 GiB observed VRAM and 5 GiB total scratch/output. Maintain at least 3 GiB available system memory; pause/terminate on threshold breach. The installation packet must separately state exact package/model/media transfer ceilings and sizes; no model is included implicitly. If these limits are insufficient, report measurements and request a revised grant.

Prove the chosen enforcement/sampling mechanism before claiming resource isolation. GPU telemetry thresholds are not necessarily a hard allocation cap; if the runtime cannot enforce the required boundary, disclose it and keep that profile disabled. Record actual available VRAM/RAM before starting. Missing telemetry is a finding, not zero usage. Do not install monitoring tools, CUDA libraries or drivers automatically.

| Dimension | Evidence and proposed acceptance check |
| --- | --- |
| End-to-end output | Record actual command/profile, exit, timestamps and hashes. Decode-check the complete output; verify H.264/AAC, 1080x1920, intended duration and no black/frozen sections or truncated narration. |
| Overall quality | Human watches the entire sample and scores coherence, pacing, visual quality and topic fidelity on a defined 1-5 scale. Proposed threshold: each >=3, with no material factual error. Save observations and representative frame timecodes. |
| Subtitles | Save subtitle artifact; inspect timing, line breaks, glyph coverage, contrast and safe placement. Proposed checks: no missing/clipped words; inspect at least 10 cues or all if fewer, each within 0.5 s of speech. |
| Voiceover | Listen end to end for pronunciation, naturalness, pauses, clipping and completeness. Record provider/voice/language. Proposed human clarity score >=3/5 with no missing final words. |
| Stock footage | Trace every clip to its source/ID and recorded terms. Judge topic relevance, repetition, crop suitability, watermarks and resolution; flag misleading shots. Do not treat engine availability as usage-rights evidence. |
| Music/mix | Record track source/rights and mix settings. Listen for intelligible speech, clipping, abrupt loops and endings. Record measured loudness/peaks if a reviewed tool is available; no rights-unknown track passes. |
| Performance/resources | Sample process-tree RAM/CPU and GPU utilization/VRAM at a declared interval (proposed 1 s). Record idle/peak, per-stage and total time, encoder actually used/fallback, download/output/scratch bytes, paging/OOM and provider cost. Stay within approved limits; no throughput claim until measured. |
| Failure behavior | In isolation, exercise invalid jobs, missing providers/dependencies, network/provider failure, timeout/cancel, resource stop, malformed upstream results and bad artifact paths. Keep evidence and typed errors; verify no automatic paid fallback, model fetch or public upload. |

These are proposed evaluation criteria for the owner to review with MPT-RUN, not measured outcomes. The 20-minute cap is a bounded diagnostic window, not an accepted production latency target. Set production targets using the observed results and intended workload.

## 6. Adapter validation and production decision

VE-04 must include schema/mapping checks, request-hash/idempotency tests, actual result/artifact validation, redaction, timeout and verified process-tree cancellation, denied path/URL/flag inputs, and a publishing-disabled negative test. Verify both engines retain independent routing and that any future delivery request goes only to a separately approved n8n workflow. Run trusted checks inside the approved isolated test environment; upstream tests and package scripts do not run in the owner's checkout.

Before VE-05, assemble a private evidence bundle containing:

- Full source commit/tag, relevant file and dependency-lock hashes, reviewed runtime/configuration digest, licence/asset inventory, maintenance/security review and installation record.
- Immutable input fixtures, exact executed vectors/profiles, observed exits, redacted stage logs, validated MP4/subtitle/audio artifacts and their hashes, human quality scores and reproducibility limitations.
- Hardware/runtime inventory, resource traces and peaks, stage/total times, provider usage/cost, failed or skipped comparisons with reasons, and operational limits supported by evidence.
- Adapter contract/mapping, actual check reports, FFmpeg route regression evidence, disabled publishing proof, proposed n8n handoff and all unresolved owner actions.
- Adopt/conditional/defer/reject recommendation, accepted versions if any, rollback/disable plan without automatic deletion, and explicit production integration decision.

Until these exist, the findings ledger is:

| Item | Current result |
| --- | --- |
| Public source reconnaissance | Completed on 2026-10-29; preliminary evidence linked above |
| Pinned isolated clone and complete source/dependency/licence audit | Pending M4 and MPT-SOURCE |
| Installation/configuration and service credential provisioning | Not performed; applicable grants pending |
| Topic-to-video sample and quality scores | NOT RUN |
| RTX 4060 resource/performance measurements | NOT RUN |
| Reusable adapter implementation and tests | Not implemented / NOT RUN |
| Existing long-form-to-reels workflow | Requirement preserved; no FFmpeg implementation was present in the foundation tree |
| n8n publishing/scheduling | Required boundary documented; not deployed or connected |
| Production integration | Disabled; owner decision pending |

Required human actions are **ACCEPT-01**, followed by the scoped **MPT-SOURCE**, **MPT-INSTALL**, **MPT-DATA**, **MPT-AUTH** where credentials are needed, **MPT-RUN**, **MPT-ADAPTER** and **MPT-ACCEPT** entries in [HUMAN_ACTIONS.md](HUMAN_ACTIONS.md). Billable usage also needs COST-01. n8n setup and any actual publication require N8N-01 and the applicable installation, credential and publishing grants. None of those grants is created by this document.
