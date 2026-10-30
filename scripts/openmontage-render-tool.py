"""Job-local instrumentation around unmodified upstream render tools."""
import json
import os
import socket
import sys
import time
from pathlib import Path

root = Path(__file__).resolve().parents[1]
job = root / "generated-videos" / "horror" / "pilot-001"
if (root / "openmontage" / ".env").exists():
    raise RuntimeError("Unexpected environment file")
def denied(*args, **kwargs):
    raise RuntimeError("Network disabled for local rendering")
socket.socket.connect = denied
socket.create_connection = denied
socket.getaddrinfo = denied
os.environ["OPENMONTAGE_PROJECTS_DIR"] = str(job.parent)
sys.path.insert(0, str(root / "openmontage"))
request = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
if request.get("action") != "tool" or request.get("tool") not in {"video_stitch", "video_compose"}:
    raise RuntimeError("Only approved local picture tools allowed")
from tools.base_tool import BaseTool
from tools.tool_registry import registry

original = BaseTool.run_command
counter = 0
def instrumented(self, cmd, **kwargs):
    global counter
    cmd = list(cmd)
    is_ffmpeg = Path(cmd[0]).stem.lower() == "ffmpeg"
    if is_ffmpeg:
        # Per-process resource settings; no global Windows or upstream changes.
        bounded = [cmd[0], "-nostdin", "-benchmark", "-filter_threads", "1", "-filter_complex_threads", "1"]
        for token in cmd[1:]:
            if token == "-i":
                bounded.extend(["-threads", "2"])
            bounded.append(token)
        if Path(cmd[-1]).suffix.lower() == ".mp4":
            extra = ["-threads", "4", "-pix_fmt", "yuv420p"]
            if not any(flag in cmd for flag in ("-c:v", "-codec:v", "-c", "-codec")):
                extra.extend(["-c:v", "libx264", "-crf", "20", "-preset", "fast"])
            bounded[-1:-1] = extra
        cmd = bounded
    started = time.time()
    try:
        result = original(self, cmd, **kwargs)
    except Exception as exc:
        record = {"command": cmd, "elapsed_seconds": time.time()-started, "error": str(exc), "success": False}
        counter += 1
        (job / "logs" / f"{Path(sys.argv[1]).stem}-command-{counter:02d}.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
        raise
    counter += 1
    record = {"command": cmd, "elapsed_seconds": time.time()-started, "exit_code": result.returncode, "success": True, "stderr": result.stderr}
    (job / "logs" / f"{Path(sys.argv[1]).stem}-command-{counter:02d}.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
    return result
BaseTool.run_command = instrumented
registry.discover()
tool = registry.get(request["tool"])
if tool is None:
    raise RuntimeError("Required upstream tool unavailable")
result = tool.execute(request["params"])
print(json.dumps({"success": result.success, "data": result.data, "error": result.error}, ensure_ascii=True, default=str))
if not result.success:
    sys.exit(2)
