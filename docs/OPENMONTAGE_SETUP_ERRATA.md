# B-PILOT-UV-FIX-01: one command correction

State: **APPROVED through B-PILOT-CONTINUE-01 and executed successfully**. Original failure evidence is retained; the original B-PILOT-SETUP-01 packet/hash stays unchanged. The text below preserves the correction requested, not a new grant.

Actual installed uv 0.9.6 rejected the approved compile command before resolution: `--only-binary :all:` cannot be combined with `--no-build`. Exit 2; no dependency lock/package download or installation was produced. Evidence: `.runtime/openmontage-pilot/logs/resolve.stderr` and `resolve.receipt.json`.

Requested correction: remove only the redundant `--no-build`, retaining `--only-binary :all:`, which excludes source distributions/builds. All requirement inputs, PyPI sources, Windows/Python target, output path, hashes and B-PILOT-SETUP-01 caps/deadline remain unchanged.

```powershell
uv --no-config --no-cache --no-python-downloads pip compile setup/openmontage-pilot.requirements.in --python-version 3.11.9 --python-platform x86_64-pc-windows-msvc --only-binary :all: --generate-hashes --output-file .runtime/openmontage-pilot/requirements.lock
```

No new package/provider/model, credential access, paid call or system change is requested. Logs from the failed attempt remain retained; corrected attempts use fresh receipt names. Existing source extraction/venv/portable-binary/voice actions remain within their original grant. This correction does not extend the 60-minute setup window ending 2026-10-29T22:17:56Z. Reversal remains retaining the inactive project-local files; no automatic deletion.
