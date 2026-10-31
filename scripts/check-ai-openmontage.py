"""Validate mapped editorial artifacts with the existing upstream schemas. No network."""
import json, sys
from pathlib import Path
import jsonschema
root = Path.cwd()
job_dir = Path(sys.argv[1]).resolve()
allowed = (root / "brands" / "horror" / "projects").resolve()
if not job_dir.is_relative_to(allowed):
    raise RuntimeError("Unapproved fixture directory")
results = []
for artifact in ("script", "scene_plan"):
    schema = json.loads((root / "openmontage" / "schemas" / "artifacts" / f"{artifact}.schema.json").read_text(encoding="utf-8"))
    value = json.loads((job_dir / f"{artifact}.json").read_text(encoding="utf-8"))
    jsonschema.Draft202012Validator(schema).validate(value)
    results.append({"artifact": artifact, "upstream_schema_valid": True})
print(json.dumps({"passed": True, "checks": results, "rendered": False}))
