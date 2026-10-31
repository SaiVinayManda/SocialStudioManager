"""Narrow compose-stage adapter; accepts only an operator-digest-approved project."""
import json
import socket
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
def denied(*args, **kwargs):
    raise RuntimeError("Network disabled for approved local render")
socket.socket.connect = denied
socket.create_connection = denied
socket.getaddrinfo = denied
if (root / "openmontage" / ".env").exists():
    raise RuntimeError("Unexpected environment file")
sys.path.insert(0, str(root / "openmontage"))
request = Path(sys.argv[1])
params = json.loads(request.read_text(encoding="utf-8"))["params"]
if params.get("operation") != "render" or params.get("edit_decisions", {}).get("render_runtime") != "ffmpeg":
    raise RuntimeError("Only the approved local FFmpeg composition is supported")
from tools.tool_registry import registry
from lib.checkpoint import write_checkpoint
directory = request.parent
write_checkpoint(directory.parent, directory.name, "compose", "in_progress", {}, pipeline_type="cinematic")
registry.discover()
# Canonical subtitle mode is a string; upstream renderer expects a style mapping.
subs = params.get("edit_decisions", {}).get("subtitles", {})
if isinstance(subs.get("style"), str):
    subs.pop("style")
result = registry.get("video_compose").execute(params)
print(json.dumps({"success": result.success, "error": result.error}, ensure_ascii=True))
if not result.success:
    sys.exit(2)
