"""Read pinned Git objects as data; create a static review catalog, never install.

Run only with the approved existing interpreter in isolated mode (-I -S).
This is an audit helper, not an engine runner or a dependency resolver.
"""

import hashlib
import json
import pathlib
import re
import subprocess
import sys
import tomllib
import urllib.parse


def git_bytes(repo, file):
    result = subprocess.run(
        [
            "git", "-c", "credential.helper=", "-c",
            "safe.directory=" + repo["local_path"],
            "-C", repo["local_path"],
            "show", repo["head"] + ":" + file,
        ],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout


def wheel_candidate(url):
    filename = urllib.parse.unquote(url.rsplit("/", 1)[-1])
    parts = filename[:-4].rsplit("-", 3)
    if not filename.endswith(".whl") or len(parts) != 4:
        raise ValueError("Unrecognized wheel name: " + filename)
    _, python_tag, abi, platform = parts
    generic_python = abi == "none" and any(
        tag in {"py3", "py311"} for tag in python_tag.split(".")
    )
    abi3 = (
        abi == "abi3"
        and re.fullmatch(r"cp3\d+", python_tag) is not None
        and int(python_tag[3:]) <= 11
    )
    generic = platform == "any" and generic_python
    native = platform == "win_amd64" and (
        python_tag == "cp311" or abi3 or generic_python
    )
    return filename, generic or native


def platform_candidate(values, target):
    positives = [value for value in values if not value.startswith("!")]
    return "!" + target not in values and (not positives or target in positives)


def wheel_preference(wheel):
    filename = wheel["filename"]
    if filename.endswith("-cp311-cp311-win_amd64.whl"):
        rank = 0
    elif filename.endswith("-abi3-win_amd64.whl"):
        rank = 1
    elif filename.endswith("-win_amd64.whl"):
        rank = 2
    else:
        rank = 3
    return rank, filename


root = pathlib.Path(__file__).resolve().parents[2]
evidence = json.loads(
    (root / "docs/research/video-engine-audit-20261029.json").read_text("utf-8")
)
repos = {repo["name"]: repo for repo in evidence["repositories"]}
lock_bytes = git_bytes(repos["MoneyPrinterTurbo"], "uv.lock")
lock = tomllib.loads(lock_bytes.decode("utf-8"))
npm_bytes = git_bytes(repos["OpenMontage"], "remotion-composer/package-lock.json")
npm = json.loads(npm_bytes)

python_packages = []
for package in lock["package"]:
    candidates = []
    for wheel in package.get("wheels", []):
        filename, compatible = wheel_candidate(wheel["url"])
        if compatible:
            candidates.append(dict(wheel, filename=filename))
    python_packages.append({
        "name": package["name"],
        "version": package["version"],
        "source": package.get("source"),
        "resolution_markers": package.get("resolution-markers", []),
        "dependencies": package.get("dependencies", []),
        "optional_dependencies": package.get("optional-dependencies", {}),
        "dev_dependencies": package.get("dev-dependencies", {}),
        "windows_cp311_wheel_candidates": candidates,
        "sdist_fallback_forbidden": True,
    })

npm_packages = []
for name, package in npm["packages"].items():
    if not name:
        continue
    eligible = (
        platform_candidate(package.get("os", []), "win32")
        and platform_candidate(package.get("cpu", []), "x64")
    )
    npm_packages.append({
        "path": name,
        "version": package.get("version"),
        "resolved": package.get("resolved"),
        "integrity": package.get("integrity"),
        "license": package.get("license"),
        "has_install_script": package.get("hasInstallScript", False),
        "os": package.get("os", []),
        "cpu": package.get("cpu", []),
        "optional": package.get("optional", False),
        "windows_x64_platform_candidate": eligible,
        "dependencies": package.get("dependencies", {}),
        "optional_dependencies": package.get("optionalDependencies", {}),
        "engines": package.get("engines", {}),
    })

report = {
    "status": "STATIC_CATALOG_NOT_INSTALL_MANIFEST",
    "target": {
        "os": "Windows", "arch": "x86_64",
        "python": "CPython 3.11 standard GIL",
    },
    "parser_runtime": {
        "version": sys.version,
        "executable": sys.executable,
        "isolated": sys.flags.isolated,
        "site_disabled": sys.flags.no_site,
    },
    "source_commits": {name: repo["head"] for name, repo in repos.items()},
    "source_sha256": {
        "mpt_uv_lock": hashlib.sha256(lock_bytes).hexdigest(),
        "openmontage_npm_lock": hashlib.sha256(npm_bytes).hexdigest(),
    },
    "limitations": [
        "No package download, installation, build, import or network use.",
        "Python candidates use wheel tags only; marker/dependency graph is unresolved.",
        "All lock variants and optional/dev packages remain data, not an install list.",
        "npm platform eligibility does not resolve peer/optional graph or review scripts.",
        "Lock metadata hashes do not verify actual downloaded artifact bytes.",
    ],
    "python_packages": python_packages,
    "npm_packages": npm_packages,
}
output = root / "docs/research/video-engine-dependency-catalog-20261029.json"
output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

# These are the complete marker expressions in this pinned, offline export.
# An unfamiliar expression stops review instead of guessing or evaluating code.
target_markers = {
    "": True,
    "implementation_name != 'PyPy' and platform_python_implementation != 'PyPy'": True,
    "platform_machine == 'AMD64' or platform_machine == 'aarch64' or platform_machine == 'amd64' or platform_machine == 'arm64' or platform_machine == 'x86_64'": True,
    "platform_python_implementation != 'PyPy'": True,
    "python_full_version < '3.11.3'": False,
    "python_full_version >= '3.13'": False,
    "sys_platform != 'darwin'": True,
    "sys_platform == 'win32'": True,
}
export_path = root / "docs/research/mpt-production.pylock.toml"
export_bytes = export_path.read_bytes()
exported = tomllib.loads(export_bytes.decode("utf-8"))
artifacts = []
excluded = []
for package in exported["packages"]:
    marker = package.get("marker", "")
    if marker not in target_markers:
        raise ValueError("Unreviewed environment marker: " + marker)
    if not target_markers[marker]:
        excluded.append({"name": package["name"], "marker": marker})
        continue
    choices = []
    for wheel in package.get("wheels", []):
        filename, compatible = wheel_candidate(wheel["url"])
        if compatible:
            choices.append(dict(wheel, filename=filename))
    if not choices:
        raise ValueError("No reviewed target wheel for " + package["name"])
    choices.sort(key=wheel_preference)
    wheel = choices[0]
    if urllib.parse.urlsplit(wheel["url"]).netloc != "files.pythonhosted.org":
        raise ValueError("Unexpected artifact host")
    digest = wheel["hashes"]["sha256"]
    if not re.fullmatch("[a-f0-9]{64}", digest):
        raise ValueError("Invalid SHA-256 for " + package["name"])
    if not isinstance(wheel["size"], int) or wheel["size"] <= 0:
        raise ValueError("Missing byte limit for " + package["name"])
    artifacts.append({
        "name": package["name"], "version": package["version"],
        "filename": wheel["filename"], "url": wheel["url"],
        "sha256": digest, "size_bytes": wheel["size"],
        "other_compatible_candidates_not_selected": [
            choice["filename"] for choice in choices[1:]
        ],
    })

manifest = {
    "manifest_version": "mpt-artifact-review/1",
    "status": "PROPOSED_ARTIFACT_STAGING_ONLY",
    "authorized": False,
    "source_commit": repos["MoneyPrinterTurbo"]["head"],
    "source_uv_lock_sha256": hashlib.sha256(lock_bytes).hexdigest(),
    "offline_export_sha256": hashlib.sha256(export_bytes).hexdigest(),
    "target": {"os": "win32", "machine": "AMD64", "python": "CPython 3.11.9"},
    "target_note": "Compatibility filter only; no production interpreter approval.",
    "selection": "Offline uv export; no dev, extras or local project; known markers only.",
    "wheel_preference": "CP311 native, then ABI3 Windows, then generic Windows, then generic any; filename breaks ties.",
    "artifact_count": len(artifacts),
    "expected_total_bytes": sum(artifact["size_bytes"] for artifact in artifacts),
    "models_included": False,
    "install_or_execute_included": False,
    "excluded_by_environment": excluded,
    "artifacts": artifacts,
}
manifest_path = root / "docs/research/mpt-win311-artifact-manifest.json"
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

summary = {
    "python_version": sys.version.split()[0],
    "isolated": sys.flags.isolated,
    "site_disabled": sys.flags.no_site,
    "python_lock_entries": len(python_packages),
    "python_entries_without_target_wheel": [
        package["name"] + "==" + package["version"]
        for package in python_packages
        if not package["windows_cp311_wheel_candidates"]
    ],
    "npm_entries": len(npm_packages),
    "npm_platform_candidates": sum(
        package["windows_x64_platform_candidate"] for package in npm_packages
    ),
    "npm_install_script_entries": [
        package["path"] for package in npm_packages if package["has_install_script"]
    ],
    "output": str(output),
    "mpt_staging_artifact_count": manifest["artifact_count"],
    "mpt_staging_expected_bytes": manifest["expected_total_bytes"],
    "mpt_staging_manifest": str(manifest_path),
}
print(json.dumps(summary, indent=2))
