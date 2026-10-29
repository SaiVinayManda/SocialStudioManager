# B-PILOT-CONTINUE-01: finish the existing local setup

State: **PENDING OWNER APPROVAL**. B-PILOT-SETUP-01 was explicitly approved, but installation is incomplete. The latest "continue" request is not a grant for this correction or time extension.

The read-only recheck at 2026-10-29T22:14:08Z confirmed the approved FFmpeg archive/model hashes and a successful decode of the existing 1080x1920 H.264/AAC test MP4. All 16 queried OpenMontage/Piper dependency distributions are absent from the project venv; `piper.exe`, the dependency lock and final Horror MP4 are absent. No package install or external request was made by that check.

## One bounded approval requested

1. Approve the existing B-PILOT-UV-FIX-01 correction: remove **only** `--no-build`, keeping binary-only resolution and all input constraints.
2. Approve **one additional window of at most 20 minutes**, starting when the approved continuation executes. The original session ends 2026-10-29T22:17:56Z; it is not silently extended. The approval must be received before 2026-11-02T00:00:00Z.
3. Finish the originally approved wheel manifest/staging/hash-pinned offline installation, then the local Piper sample and registry preflight. Reuse the verified source, venv, FFmpeg and voice; no reinstall/re-download of completed components.

Exact corrected resolution command, from `C:\Projects\Manas_Flow\SocialStudio`:

```powershell
uv --no-config --no-cache --no-python-downloads pip compile setup/openmontage-pilot.requirements.in --python-version 3.11.9 --python-platform x86_64-pc-windows-msvc --only-binary :all: --generate-hashes --output-file .runtime/openmontage-pilot/requirements.lock
```

Then use the unchanged PyPI wheel-download and hash-pinned offline-install commands in [the frozen original packet](OPENMONTAGE_INSTALL_APPROVAL.md). Input SHA-256 remains `decee478ec624073e22d8061190b3adddff8b132f8103d43e190476bc8e2a284`; original packet SHA-256 remains `eff54d5d35aa8515df023e5a7a84eac4564136117107fbc20056d73ce4209dbe`.

The new window changes time authorization only. All other limits remain **cumulative**: no more than 100 wheels, **750 MiB total downloads** (170.04 MiB verified payload already used), **3 GiB new storage** (680.43 MiB observed), USD 0 paid APIs. Same Windows/Python target, core requirement constraints plus Piper **1.8.0**, public PyPI sources and existing `.runtime/openmontage-pilot` paths. No source builds, other root packages/models/providers, credentials, system-wide changes, services or publishing.

Use the already documented cleared child environment and record fresh receipts while retaining failures. Stop for input/hash/source/version/limit changes. Reversal: stop processes and retain the inactive project-local files; deletion remains a separate approval. No existing data is overwritten or removed.

## Separate production prerequisite

This continuation does **not** authorize additional footage/music downloads or external-service access. The brand input/asset directories currently have no approved production media. After tool tests pass, use owner-supplied cleared local clips or prepare a separate bounded media permission request. Do not call the test-pattern MP4 the Horror pilot, manufacture a narration pass or replace required moving footage with a slideshow.
