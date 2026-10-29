# Video engine setup review packet

Prepared 2026-10-29. Status: **owner-approved artifact staging completed; installation and engine execution remain unapproved**. The owner explicitly authorized downloading and verifying the specified files only. The manifest and scope below remain the reviewed content; their proposal fields have not been changed into an agent-issued grant.

## Completed staging scope: VA-STAGE-MPT-01

The owner approved this exact bounded action with: "ok i give approval to download and verify those files only". It was completed within the following scope and does not authorize the other setup phases below.

| Field | Proposed scope |
| --- | --- |
| Action | Download and SHA-256/byte-count-check the 116 preselected MoneyPrinterTurbo dependency wheels. Store opaque files for later inspection; no installation, extraction, imports, scripts or engine execution. |
| Source baseline | MoneyPrinterTurbo `fd5127e81721f36f0a85aee21b298cc5f4452f42`; `uv.lock` SHA-256 `152b358be8e3cb211daa7d256fb6af7f29963939798f0df0f6adff777d2f615a`. |
| Exact content | [mpt-win311-artifact-manifest.json](research/mpt-win311-artifact-manifest.json), SHA-256 **`1bf8d7bb45b76ce5db7cbda2f7d07434bdcbb64ba64760d5157b441da6174908`**. Only listed filenames, versions, URLs, hashes and sizes are in scope. Other compatible candidates are not authorized substitutes. |
| Compatibility target | Windows x86-64, CPython 3.11.9. This selects wheel formats; it does not approve that interpreter as a production runtime or prove compatibility by execution. |
| Destination | `C:\Users\Vinay\AppData\Local\Temp\SocialStudio-VideoArtifacts-20261029\mpt-fd5127e8-win311`. Must be a new isolated directory. Stop if the destination exists unexpectedly; do not overwrite unrelated files. |
| Network | Anonymous HTTPS to exact listed `files.pythonhosted.org` URLs only; no credential helper, browser session, API key, proxy credentials or cross-host redirect. |
| Transfer/disk | Expected payload **224,210,240 bytes (213.82 MiB)**. Overall payload cap **256 MiB**; staging disk cap **512 MiB**, including partial files and logs. A file exceeding its declared size stops the operation. |
| Attempts/time | At most two concurrent transfers; one attempt per artifact, no automatic retry. Maximum 30 minutes for the entire staging operation. Stop on failed hash, size, unexpected URL or access error and preserve evidence. |
| Spend | USD 0 in service/API charges. No model/provider/agent CLI calls, subscriptions or purchases. Ordinary Internet connectivity only. |
| Expiry | **2026-10-30T06:30:00Z**. If approval arrives after expiry or the manifest/scope changes, prepare a new request; no silent renewal. |
| Evidence | Per-file URL, expected/observed size and SHA-256, start/end UTC, result, aggregate payload and final manifest/report. No raw credentials or user configuration in logs. |
| Exclusions | No installation or package restore; no models, browser/FFmpeg/Python/runtime download; no unpacking/build/lifecycle hooks; no upstream checkout or patch; no services, environment/PATH changes, credentials, paid APIs, publishing or production integration. No automatic deletion. |

The manifest's `authorized=false` remains proposal data. An agent must not turn that field into a grant. This staging action is inspection preparation; it does not accept M4 or waive the remote-development gate for runtime work.

The explicit download approval is required by [AGENTS.md](../AGENTS.md), whose software category covers "Packages, dependencies, tools, plugins, container images, runtime downloads, upgrades, and executing installers or downloaded code". The completed public-source clone approval does not cover fetching dependencies.

### Actual staging result

Completed successfully on 2026-10-29, from **06:26:28.389 UTC to 06:26:41.967 UTC** (13.58 seconds). All **116 files** matched their expected byte counts and SHA-256 hashes during transfer and again in a separate `Get-FileHash` pass from disk. Received payload: **224,210,240 bytes**. Total cache including report/logs: **224,464,375 bytes**, below the 512 MiB cap. Transfers were serial, with one attempt per artifact and no retry, redirect or credential use. No partial files remained.

The approved destination contains only opaque wheel files and verification evidence. No extraction, installation, package import/execution, model download, provider call, publishing or system change occurred. No engine benchmark ran. This verifies artifact identity against the upstream lock, not package safety, licensing or runtime compatibility.

Evidence copies: [verification report](research/mpt-staging-verification-20261029.json) (SHA-256 `8616da5fd03f93d9d05458420cb12934b9eb0cf85df896901f060f49eedb4f53`) and [per-file events](research/mpt-staging-events-20261029.jsonl) (SHA-256 `05c52dd90aca17dfec355dd53f95cbb4e05b82ad9d84df9d3b63ed4d59b46e45`). Original evidence is retained alongside the staged wheels. This action is complete; its grant is not reused for installation or additional artifacts.

## What the continued audit established

- Parsed the MoneyPrinterTurbo universal lock as data: **125 package/version entries** across environments, optional features and development tooling.
- Exported its production dependency set offline with `uv export --frozen --offline --no-python-downloads --no-config --no-dev --no-emit-project --no-build`. No package resolution network, package build or installation ran; the copied input lock was unchanged.
- Selected **116 CPython 3.11.9/Windows x64 wheels** from that export. The seven distinct environment expressions are explicitly reviewed; unknown expressions stop the audit helper. Wheel selection prefers CP311 native, then ABI3 Windows, generic Windows and generic-any; all choices and nonselected alternatives are recorded.
- Excluded `async-timeout` for Python <3.11.3 and `audioop-lts` for Python >=3.13. Development groups, optional TwelveLabs and the local `mpt` project are absent from the staging list. Models are not included.
- Parsed OpenMontage's npm lock: **244 entries**, of which **204** meet the static Windows/x64 OS/CPU filter. These are platform candidates, not an independently resolved installation set. The lock marks **esbuild 0.28.1** as having an installation script; that script has not been downloaded, read or executed.
- Located existing Python **3.11.9** and uv-managed **3.14.9** outside this session PATH. The data parser completed in isolated, site-disabled mode. No Python was installed or upgraded. These interpreters are inventory findings, not accepted worker runtimes. The successful sandbox parser rerun used existing 3.14.9; the wheel compatibility target remains 3.11.9.

The [dependency catalog](research/video-engine-dependency-catalog-20261029.json) retains package versions, wheel metadata and npm URL/integrity/licence/script flags. The [offline production export](research/mpt-production.pylock.toml) is a review copy, not an approved installer input. It includes source distributions and other platforms that are expressly outside the staging proposal. Root MIT attribution is retained in [MPT_UPSTREAM_LICENSE.txt](research/MPT_UPSTREAM_LICENSE.txt).

The [tree display](research/mpt-win311-dependency-tree.txt) is diagnostic only: `uv tree` displayed optional TwelveLabs even with development groups disabled. It must not be treated as the installation set. The manifest is derived from the no-extra production export instead. Official references: [uv locking/export behavior](https://docs.astral.sh/uv/concepts/projects/sync/), [wheel compatibility tags](https://packaging.python.org/en/latest/specifications/platform-compatibility-tags/).

## Representative pinned components

| Route | Components confirmed in the locks | Remaining review |
| --- | --- | --- |
| MoneyPrinterTurbo | MoviePy 2.2.1; OpenAI 2.24.0; PyAV 17.0.0; CTranslate2 4.7.1; imageio-ffmpeg 0.6.0; NumPy 2.4.4; Pillow 11.3.0; LiteLLM 1.86.2; Streamlit 1.59.1 | Review actual wheel contents, dependency metadata, native DLLs, licences, advisories and install side effects after approved staging. Hash equality proves identity, not safety or successful generation. |
| OpenMontage Node | Remotion/CLI/Windows compositor 4.0.484; React/ReactDOM 18.3.1; esbuild 0.28.1 | Resolve applicable graph, verify registry metadata/sizes, examine lifecycle scripts and renderer/browser provisioning; Remotion commercial terms still need owner review. |
| OpenMontage Python | Core requirements use lower bounds, including `openai>=2.44.0`; no complete frozen Python lock was found in the inspected baseline | A separately reviewed metadata-only resolution or staged-wheel process is needed. Do not use MoneyPrinterTurbo's OpenAI pin or run an automatic package restore. |

No dependency vulnerability or complete licence audit has passed. The catalog uses upstream lock metadata; it does not establish that an archive is authentic until its bytes are fetched and checked, or that the included code is suitable for execution.

## Later setup phases, not covered by VA-STAGE-MPT-01

1. Review staged archive metadata/licences/native files without executing or extracting into the project. Complete exact software/runtime/browser/FFmpeg/ffprobe and any build-hook packet. Keep source builds disabled unless individually approved.
2. Resolve and review OpenMontage's Python environment independently. Keep both engines in distinct runtimes because their declared OpenAI SDK versions conflict. Do not select optional Torch, diffusion/video-generation, CLIP, transcription or voice models by implication.
3. Select least-privilege execution identity and isolation, accepted Python runtime, staged inputs/output roots, no owner home/auth, fixed tool profiles, denied publisher egress and enforced resource/process-tree controls. A package directory or venv alone is not this boundary.
4. Obtain the exact installation and local POC grants, plus M4 acceptance or an explicit bounded local-runtime exception. No checkpoint commit, push, service or scheduled task is included.
5. Freeze free/local TTS/music/stock/LLM choices, rights, brand and voice. Models and even free external services need their own scoped data/download approvals. No paid reasoning/provider calls are authorized.
6. Obtain the owner-supplied long-form input path/Drive file and rights. L01 cannot run without it; the question remains pending. The other scenarios' stock/assets and profiles also remain unresolved.
7. Approve the [eight benchmark jobs](benchmarks/video-engine-jobs.json) and actual validation/cancellation profiles; only then execute and replace NOT RUN rows with measured evidence. n8n remains the sole publishing/scheduling authority.

## Actual inspection commands and limits

The local [audit helper](research/inspect-video-dependencies.py) uses only the standard library to read pinned Git objects and export data. It never imports either engine or any installed third-party package. Its first inline versions had quoting/syntax errors and did not execute; the readable helper was corrected, including generic Windows wheel handling and deterministic selection when both compiled/pure wheels exist. The final run exited 0 and the independent manifest checks passed.

`uv python find` initially failed on the sandbox-visible default cache path. The approved offline inventory retry used `--no-cache`; it did not change execution policy, repair caches or download Python. All lock/tree/export operations used existing tools, offline mode and disabled Python downloads. Subsequently, the owner-approved staging action above fetched and verified only the listed dependency files. All video benchmarks remain **NOT RUN**.
