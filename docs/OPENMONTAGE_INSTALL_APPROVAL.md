# B-PILOT-SETUP-01: minimal local installation request

State: **PENDING OWNER APPROVAL**. This file is a proposal, not a grant. Advanced Milestone A development and its protected deployment proposal are deferred by the owner's latest priority change. No A acceptance is inferred.

## Requested action and limits

Approve one bounded native-Windows setup: materialize the already cloned OpenMontage source; create one isolated Python environment; resolve and install its core dependencies plus CPU Piper; install portable FFmpeg/ffprobe; download one English Piper voice. Then run local capability/voice/encoding smoke checks with those components. No global installation, PATH edit, account/ACL/service/power/firewall change, credentials, paid API, remote Codex invocation, publishing, Docker or WSL is included.

| Item | Exact scope |
| --- | --- |
| Source | Existing clone `C:\Users\Vinay\AppData\Local\Temp\SocialStudio-VideoEngineAudit-20261029\OpenMontage`, commit `195eab24478dc9363326aec437aefc3701635ddf`. Local archive extraction only; no new clone/fetch, submodule/LFS download or upstream modification |
| Python runtime | Reuse existing CPython **3.11.9** at `C:\Users\Vinay\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe`. No Python upgrade/download |
| Python input | [openmontage-pilot.requirements.in](../setup/openmontage-pilot.requirements.in), SHA-256 `decee478ec624073e22d8061190b3adddff8b132f8103d43e190476bc8e2a284`. Matches the pinned upstream core requirement constraints plus `piper-tts==1.8.0`; no GPU extras |
| Resolution/install | Approve binary-only resolution for Windows x64 / Python 3.11, followed by hash-pinned wheel staging/installation from that exact input. The transitive versions are **not resolved yet**. Freeze and record the full lock, wheel URLs/versions/hashes/sizes before installation. At most 100 wheels; stop for a source build, unavailable constraint, unknown hash/size, extra root requirement or changed input. Do not silently relax upstream constraints |
| Piper | **1.8.0**, Windows ABI3 wheel; PyPI published SHA-256 `5da9bfdb05dfe15da3536859d422e605483ffa6d2b3ec2c5b9593bae6b5aa6a4`. CPU ONNX runtime only; no CUDA/Torch/video models |
| FFmpeg/ffprobe | Gyan **9.0.2 essentials**, `https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-9.0.2-essentials_build.zip`; expected SHA-256 `60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba`. Verify before extracting; retain bundled notices/licences. No installer or system PATH write |
| Voice | `en_US-ljspeech-medium`: model **63,531,379 bytes**, SHA-256 `6f52a751e2349abe7a76735eb09dc1875298c77ea2342ffd2fef79ff81b87f22`; config 4,972 bytes and model card 517 bytes from `rhasspy/piper-voices` commit `bae641dcb5a608cff81ccaf7ff018baaca1a33e1`. Only these three files; no training dataset download. Verify model hash and configuration/card against the pinned repository content |
| Destinations | New `C:\Projects\Manas_Flow\SocialStudio\openmontage` source tree and new `.runtime\openmontage-pilot\` containing `venv`, `downloads`, `wheelhouse`, `ffmpeg`, `voices`, `cache`, `logs` and `tmp`. Stop if a destination exists unexpectedly; preserve it |
| Execution | Reviewed upstream registry preflight, Piper short voice sample, FFmpeg/ffprobe version/filter/encoding smoke checks. Cleared child environment; no owner keys, saved Codex/Hermes sessions or inherited provider configuration. No project `.env` with credentials |
| Network | Anonymous HTTPS package metadata/wheels from `pypi.org`/`files.pythonhosted.org`, FFmpeg from `www.gyan.dev`, pinned voice files from `huggingface.co` and its public delivery CDN redirects. No authenticated requests or provider generation calls |
| Limits | Maximum **750 MiB** dependency/binary/model payload, metadata checked before wheel transfers; maximum **3 GiB** new setup storage; one setup session, at most **60 minutes**. Stop and retain evidence on failure or a limit/scope change; no automatic cleanup or alternate dependency/provider |
| Charges | **USD 0 API/cloud charges**. SDK installation does not grant permission to call those services. Current interactive development is separate from autonomous provider calls |
| Expiry | `2026-11-02T00:00:00Z`; re-request if expired or changed |

The 14 upstream core requirements include Google/OpenAI client libraries and Backlot dependencies. They are installed for upstream compatibility, not credential provisioning or cloud use. No Backlot listener/browser is started by this setup. Remotion/HyperFrames/npm packages and browser downloads are excluded: the initial proposal uses the existing FFmpeg video pipeline. They can be reviewed later if the approved creative treatment needs them.

## Commands to execute only after approval

Run from `C:\Projects\Manas_Flow\SocialStudio`. These are sequential operator commands, not an installer already run. Create only fresh destinations and check source/input hashes first. No PowerShell activation script, execution-policy change or `npx` is used.

```powershell
# Source only: archive the existing pinned clone; extract to a new empty tree.
git -c safe.directory=C:/Users/Vinay/AppData/Local/Temp/SocialStudio-VideoEngineAudit-20261029/OpenMontage -c core.hooksPath=NUL -C C:\Users\Vinay\AppData\Local\Temp\SocialStudio-VideoEngineAudit-20261029\OpenMontage archive --format=tar --output=C:/Projects/Manas_Flow/SocialStudio/.runtime/openmontage-pilot/downloads/source.tar 195eab24478dc9363326aec437aefc3701635ddf
tar.exe -xf .runtime/openmontage-pilot/downloads/source.tar -C openmontage

# Existing interpreter; fresh project-local environment.
& 'C:\Users\Vinay\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe' -I -m venv .runtime/openmontage-pilot/venv

# Existing uv, no Python download or source build. Output becomes the frozen lock.
uv --no-config --no-cache --no-python-downloads pip compile setup/openmontage-pilot.requirements.in --python-version 3.11.9 --python-platform x86_64-pc-windows-msvc --only-binary :all: --no-build --generate-hashes --output-file .runtime/openmontage-pilot/requirements.lock

# After recording the Windows wheel manifest and checking its count/size/hashes:
.runtime/openmontage-pilot/venv/Scripts/python.exe -I -m pip --isolated --disable-pip-version-check download --index-url https://pypi.org/simple --keyring-provider disabled --only-binary=:all: --require-hashes -r .runtime/openmontage-pilot/requirements.lock -d .runtime/openmontage-pilot/wheelhouse
.runtime/openmontage-pilot/venv/Scripts/python.exe -I -m pip --isolated --disable-pip-version-check install --no-index --only-binary=:all: --require-hashes --find-links .runtime/openmontage-pilot/wheelhouse -r .runtime/openmontage-pilot/requirements.lock
```

The FFmpeg and voice downloads use the exact URLs/revision/hashes above with bounded transfers and fresh output files; the model/config/card URL prefix is `https://huggingface.co/rhasspy/piper-voices/resolve/bae641dcb5a608cff81ccaf7ff018baaca1a33e1/en/en_US/ljspeech/medium/`. Extract only validated archive entries inside the fresh FFmpeg destination, rejecting absolute paths, traversal and links. Set PATH only in the production child process to include this environment's Scripts and FFmpeg bin directories; never edit Windows PATH.

Run the required `registry.discover()` / `provider_menu_summary()` only in the fresh secret-free source tree with the controlled environment. Capture actual configured/total counts; none are claimed now. `OPENMONTAGE_PROJECTS_DIR=C:\Projects\Manas_Flow\SocialStudio\brands\horror\projects` routes upstream checkpoints/assets through its supported setting. No engine source patch or alternate orchestrator is part of setup.

## Risks and reversibility

This downloads and executes third-party Python/native code. Hashes establish artifact identity, not safety. Limit execution to reviewed local setup/production, keep secrets out of its environment, preserve logs on failure and do not install optional generation stacks. The existing upstream Piper Layer 3 pointer currently describes HeyGen; use the inspected pinned Piper CLI documentation for Piper parameters, never its paid-provider instructions.

OpenMontage is AGPL-3.0; Piper 1.8 is from `piper1-gpl`; the selected FFmpeg build includes GPL components. Retain licences, keep the engine separate and review redistribution/commercial-service obligations before future deployment. The selected voice's [model card](https://huggingface.co/rhasspy/piper-voices/blob/bae641dcb5a608cff81ccaf7ff018baaca1a33e1/en/en_US/ljspeech/medium/MODEL_CARD) identifies the [LJ Speech public-domain dataset](https://keithito.com/LJ-Speech-Dataset/); this is stronger provenance than assuming every Piper voice has the same terms. Do not download the 2.6 GB training dataset.

Reversal: stop the local processes; leave source/environment/media/logs retained and inactive. No services, system packages, global PATH or existing configuration require restoration. Any later deletion of these explicitly named new directories needs a separate destructive-action approval; never clean them automatically.

## Production remains an honest pipeline run

Installation approval does not fabricate creative approvals, media rights or success. Follow the existing research/proposal/script/scene/assets/edit/compose contracts, recording stage approvals or an explicit owner-authorized full-run policy. Before using external footage, verify each actual item's licence/attribution and record provenance. Proposed public sources are Commons/open archives, with no account/key; no media was selected/downloaded yet. Proposed score/effects are locally authored synthesis, avoiding an unverified external recording. No public posting or social-account connection is included.

References: [Piper wheel metadata](https://pypi.org/project/piper-tts/1.8.0/), [pinned Piper CLI](https://github.com/OHF-Voice/piper1-gpl/blob/639388b6317fc4731e91d53da42aea68fd4166ff/src/piper/__main__.py), [FFmpeg's Windows build links](https://ffmpeg.org/download.html), [Gyan checksum](https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-9.0.2-essentials_build.zip.sha256).
