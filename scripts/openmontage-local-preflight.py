"""Approved local-only registry preflight; no generation or provider request."""
import json
import os
from pathlib import Path
import socket
import sys

root = Path(__file__).resolve().parents[1]
source = root / "openmontage"
if (source / ".env").exists():
    raise RuntimeError("Unexpected environment file; do not read credentials")

def denied(*args, **kwargs):
    raise RuntimeError("Network disabled for local preflight")

socket.socket.connect = denied
socket.create_connection = denied
socket.getaddrinfo = denied
sys.path.insert(0, str(source))
from tools.tool_registry import registry

registry.discover()
result = {
    "scope": "Local registry; Python network denied, optional Node runtimes excluded from child PATH",
    "summary": registry.provider_menu_summary(),
    "selected_tools": {name: registry.get(name).get_info() for name in ("piper_tts", "video_compose", "video_stitch", "audio_mixer", "subtitle_gen")},
    "credentials_configured": False,
    "generation_executed": False,
}
print(json.dumps(result, ensure_ascii=True, indent=2))
