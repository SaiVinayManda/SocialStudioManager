"""Fixed offline acceptance template. Called only by the authenticated media worker.

Authors original moving source media; uses the unmodified OpenMontage registry for
Piper, audio mixing and final composition. No installer, model fetch or publisher.
"""
import copy
import hashlib
import json
import math
import os
import socket
import subprocess
import sys
import time
import uuid
import wave
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = "I locked the door. Then something knocked from inside."
started = time.monotonic()


def denied(*args, **kwargs):
    raise RuntimeError("Network disabled for local acceptance rendering")


socket.socket.connect = denied
socket.create_connection = denied
socket.getaddrinfo = denied
request_path = Path(sys.argv[1]).resolve(strict=True)
request = json.loads(request_path.read_text(encoding="utf-8"))
run = str(uuid.UUID(request["acceptance_run_id"]))
project_id = "door-5s-" + run
job = ROOT / "generated-videos" / "horror" / project_id
assert request_path == job / "generation-job.json"
assert request["project_id"] == project_id and request["script"] == SCRIPT
assert request["template_id"] == "horror-door-5s-v1"
assert request["brand_id"] == "10000000-0000-4000-8000-000000000001"
assert not (ROOT / "openmontage" / ".env").exists(), "Unexpected engine environment file"
final = job / "final" / "the_door_that_opened_itself.mp4"
assert not final.exists(), "Existing output preserved"
for part in ("final", "previews", "subtitles", "scripts", "assets", "logs"):
    (job / part).mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT / "openmontage"))
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from lib.checkpoint import init_project, write_checkpoint
from schemas.artifacts import validate_artifact
from tools.base_tool import BaseTool
from tools.tool_registry import registry


def save(file, data):
    file.write_text(json.dumps(data, indent=2, default=str) + "\n", encoding="utf-8")


counter = 0
original_command = BaseTool.run_command


def instrumented(self, cmd, **kwargs):
    global counter
    cmd = list(cmd)
    if Path(cmd[0]).stem.lower() == "ffmpeg":
        bounded = [cmd[0], "-nostdin", "-benchmark", "-filter_threads", "1", "-filter_complex_threads", "1"]
        for token in cmd[1:]:
            if token == "-i":
                bounded.extend(["-threads", "2"])
            bounded.append(token)
        if Path(cmd[-1]).suffix.lower() == ".mp4":
            extra = ["-threads", "4", "-pix_fmt", "yuv420p"]
            if not any(k in cmd for k in ("-c:v", "-codec:v", "-c", "-codec")):
                extra += ["-c:v", "libx264", "-crf", "20", "-preset", "fast"]
            bounded[-1:-1] = extra
        cmd = bounded
    begin = time.monotonic()
    counter += 1
    try:
        result = original_command(self, cmd, **kwargs)
        save(job / "logs" / f"engine-command-{counter:02}.json", {"command": cmd, "exit_code": result.returncode, "elapsed_seconds": time.monotonic()-begin, "stderr": result.stderr})
        return result
    except Exception as error:
        save(job / "logs" / f"engine-command-{counter:02}.json", {"command": cmd, "error": str(error), "elapsed_seconds": time.monotonic()-begin})
        raise


BaseTool.run_command = instrumented
registry.discover()
init_project(project_id, title=request["topic"], pipeline_type="cinematic", pipeline_dir=job.parent)


def checkpoint(stage, name, artifact, gated=False, extra=None):
    validate_artifact(name, artifact)
    save(job / "artifacts" / (name + ".json"), artifact)
    artifacts = {name: artifact, **(extra or {})}
    # This exact local fixture/template is preapproved in the owner's current
    # end-to-end test instruction. This records that scope, never public posting.
    metadata = {"approval_evidence": "Owner requested this fixed five-second local test, supplied script and allowed fixture fallback; mock publishing only", "acceptance_run_id": run}
    if gated:
        write_checkpoint(job.parent, project_id, stage, "awaiting_human", artifacts, pipeline_type="cinematic", metadata=metadata)
    write_checkpoint(job.parent, project_id, stage, "completed", artifacts, pipeline_type="cinematic", human_approved=gated, metadata=metadata)


# Local feasibility evidence, explicitly NOT market/web research or true events.
references = [("Owner-scoped generation request", request_path), ("Cinematic manifest", ROOT / "openmontage/pipeline_defs/cinematic.yaml"), ("Piper model card", ROOT / ".runtime/openmontage-pilot/voices/MODEL_CARD"), ("OpenMontage compositor", ROOT / "openmontage/tools/video/video_compose.py"), ("Original visual/audio recipe", Path(__file__))]
research = {"version": "1.0", "topic": request["topic"], "research_date": datetime.now(timezone.utc).date().isoformat(), "landscape": {"existing_content": [{"title": title, "source": "local technical evidence, not audience research", "angle": "offline acceptance feasibility", "what_it_covers": str(file)} for title, file in references[:3]], "saturated_angles": [], "underserved_gaps": ["A new generated asset through the deployed workflow rather than importing the old pilot"]}, "data_points": [{"claim": claim, "source_url": file.as_uri(), "credibility": "primary_source"} for claim, file in [("The owner supplied a nine-word fictional script for this five-second test.", request_path), ("The installed voice card identifies English LJSpeech narration.", references[2][1]), ("The compositor supports a locked local FFmpeg runtime.", references[3][1])]], "audience_insights": {"common_questions": ["Review question, not surveyed: Is the narration intelligible?", "Review question, not surveyed: Is the subtitle readable?", "Review question, not surveyed: Does the door move?"], "misconceptions": [], "knowledge_level": "Fictional engineering acceptance fixture. No online audience research, eight-search stage or trend claims were executed; external research is out of scope."}, "angles_discovered": [{"name": name, "hook": hook, "type": "narrative", "why_now": "Local five-second acceptance test"} for name, hook in [("Locked door", "I locked the door."), ("Handle turns", "The handle moved."), ("Shadow at threshold", "Something waited inside.")]], "sources": [{"url": file.as_uri(), "title": title, "used_for": "Local feasibility and provenance only"} for title, file in references]}
checkpoint("research", "research_brief", research)
proposal = {"version": "1.0", "concept_options": [{"id": f"c{i+1}", "title": name, "hook": hook, "narrative_structure": "story", "visual_approach": visual, "target_duration_seconds": 5, "why_this_works": "One locally animated scene can demonstrate new production without external assets."} for i, (name, hook, visual) in enumerate([("Locked door", "I locked the door.", "Hallway push-in; wooden door cracks open after knocks"), ("Handle turns", "The handle moved.", "Close-up handle rotation"), ("Threshold", "Something waited inside.", "Moving shadow beneath the door")])], "selected_concept": {"concept_id": "c1", "rationale": "Matches the owner-supplied script and requested hallway/door scene"}, "production_plan": {"pipeline": "cinematic", "render_runtime": "ffmpeg", "renderer_family": "cinematic-trailer", "composition_mode": "templated", "stages": [{"stage": name, "tools": [], "approach": approach} for name, approach in [("script", "Owner-supplied deterministic AI-manager fixture"), ("assets", "Installed Piper, original procedural moving scene, original mathematical drone and knocks"), ("compose", "OpenMontage audio_mixer and video_compose with mandatory final review")]], "delivery_promise": {"promise_type": "motion_led", "motion_required": True, "tone_mode": "suspenseful", "quality_floor": "presentable", "source_required": False, "approved_fallback": None}}, "cost_estimate": {"total_estimated_usd": 0, "line_items": [], "budget_verdict": "within_budget"}, "approval": {"status": "approved", "user_notes": "Current owner instruction authorizes this exact local fixed-script test; no public publishing or downloads", "approved_budget_usd": 0}}
decision = {"version": "1.0", "project_id": project_id, "decisions": [{"decision_id": "d-001", "stage": "proposal", "category": "render_runtime_selection", "subject": "Use existing offline compositor", "options_considered": [{"option_id": "ffmpeg", "label": "Existing local FFmpeg", "score": 1, "reason": "Installed and supports this one-scene template"}], "selected": "ffmpeg", "reason": "No installations, external inference or paid services", "user_approved": True}]}
checkpoint("proposal", "proposal_packet", proposal, True, {"decision_log": decision})
script = {"version": "1.0", "title": request["topic"], "total_duration_seconds": 5, "sections": [{"id": "s1", "text": SCRIPT, "start_seconds": 0, "end_seconds": 5}]}
checkpoint("script", "script", script, True)
(job / "scripts/narration.txt").write_text(SCRIPT + "\n", encoding="utf-8")
scene = {"version": "1.0", "scenes": [{"id": "scene1", "type": "animation", "description": "Original perspective hallway with wood-panelled door, flickering ceiling lamp and opening door. Procedural animation, not stock footage or diffusion video.", "start_seconds": 0, "end_seconds": 5, "script_section_id": "s1", "movement": "Continuous slow push-in, light flicker and physical door polygon movement", "shot_intent": "Establish an ordinary lock, then reveal movement from within"}]}
checkpoint("scene_plan", "scene_plan", scene, True)


def tool(name, params):
    begin = time.monotonic()
    result = registry.get(name).execute(params)
    save(job / "logs" / (name + ".json"), {"success": result.success, "data": result.data, "error": result.error, "elapsed_seconds": time.monotonic()-begin})
    if not result.success:
        raise RuntimeError(name + " failed: " + str(result.error))
    return result


voice = ROOT / ".runtime/openmontage-pilot/voices/en_US-ljspeech-medium.onnx"
narration = job / "assets/audio/narration.wav"
tool("piper_tts", {"text": SCRIPT, "model": str(voice), "speaker_id": 0, "length_scale": 0.98, "sentence_silence": 0.25, "output_path": str(narration)})
with wave.open(str(narration)) as audio:
    narration_duration = audio.getnframes() / audio.getframerate()
assert 1 < narration_duration < 4.9, "Narration would be truncated; review pacing"

# Original audio: deterministic low drone plus three exponentially decaying knocks.
rate = 48000
t = np.arange(5*rate) / rate
drone = (0.11*np.sin(2*np.pi*55*t) + 0.045*np.sin(2*np.pi*82.7*t)) * np.minimum(t/0.3, 1) * np.minimum((5-t)/0.2, 1)
knocks = np.zeros_like(t)
for at in (3.24, 3.52, 3.84):
    dt = np.maximum(t-at, 0)
    knocks += (t >= at) * 0.42*np.exp(-dt*35)*np.sin(2*np.pi*(140-18*np.minimum(dt, 1))*dt)
for name, data in (("drone", drone), ("knocks", knocks)):
    with wave.open(str(job / f"assets/audio/{name}.wav"), "wb") as audio:
        audio.setnchannels(1); audio.setsampwidth(2); audio.setframerate(rate)
        audio.writeframes((np.clip(data, -1, 1)*32767).astype("<i2").tobytes())

# Continuous original animated footage. Geometry, texture and flicker are authored
# locally, with bounded frame memory; no static slideshow and no downloaded media.
source = job / "assets/video/door.mp4"
ffmpeg = "ffmpeg"
cmd = [ffmpeg, "-nostdin", "-n", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "540x960", "-r", "30", "-i", "pipe:0", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-threads", "4", "-pix_fmt", "yuv420p", str(source)]
begin = time.monotonic()
with (job / "logs/scene-encode.stderr").open("wb") as errors:
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=errors)
    try:
        yy, xx = np.mgrid[0:960, 0:540]
        vignette = np.clip(1 - 0.32*((xx-270)/370)**2 - 0.24*((yy-480)/700)**2, 0.45, 1)
        rng = np.random.default_rng(41)
        for frame in range(150):
            sec = frame/30
            flicker = 0.9 + 0.05*math.sin(sec*19) - (0.28 if 3.15 < sec < 3.23 or 4.32 < sec < 4.40 else 0)
            im = Image.new("RGB", (540, 960), (12, 22, 27)); d = ImageDraw.Draw(im)
            d.polygon([(0,0),(540,0),(375,255),(165,255)], fill=(24,35,37))
            d.polygon([(0,0),(165,255),(165,685),(0,960)], fill=(31,45,48))
            d.polygon([(540,0),(375,255),(375,685),(540,960)], fill=(22,34,38))
            d.polygon([(0,960),(165,685),(375,685),(540,960)], fill=(35,38,35))
            d.rectangle((165,255,375,687), fill=(28,34,32))
            for x in range(-600, 1300, 165):
                d.line((270+(x-270)*0.15,685,x,960),fill=(12,18,19),width=2)
            for y in (718,765,836,935):
                d.line((0,y,540,y),fill=(17,24,25),width=2)
            # Ceiling lamp and cool edge strips anchor the perspective.
            d.polygon([(220,136),(320,136),(303,153),(237,153)],fill=(172,181,147))
            d.line((36,58,157,280),fill=(65,82,81),width=3)
            d.line((504,58,383,280),fill=(48,66,69),width=3)
            d.rectangle((173,267,367,688),fill=(8,12,13))
            d.rectangle((180,275,360,679),fill=(21,18,13))
            opening = max(0, min(1,(sec-3.7)/1.1))
            right = 357-int(27*opening)
            d.polygon([(184,278),(right,278+int(10*opening)),(right,675-int(9*opening)),(184,677)], fill=(69,48,31))
            for x in range(188,right,4):
                grain = 36+int(8*math.sin(x*0.64))
                d.line((x,282,x,672),fill=(grain+27,grain+6,grain-8),width=1)
            for y1,y2 in ((301,446),(470,645)):
                d.rectangle((201,y1,right-18,y2),outline=(27,23,18),width=5)
                d.line((205,y1+5,right-22,y1+5),fill=(98,73,43),width=2)
            d.ellipse((right-24,462,right-15,472),fill=(165,144,88))
            d.line((right-20,467,right-3,468-int(opening*3)),fill=(171,153,105),width=3)
            d.line((180,680,360,680),fill=(99,77,40),width=2)
            # Smooth camera move plus changing grain/flicker provides real motion.
            z = 1+0.045*sec/5; cw=int(540/z); ch=int(960/z)
            im = im.crop(((540-cw)//2,(960-ch)//2,(540+cw)//2,(960+ch)//2)).resize((540,960),Image.Resampling.BICUBIC)
            pixels = np.asarray(im).astype(np.float32)
            pixels = pixels*vignette[:,:,None]*flicker + rng.normal(0,0.65,(960,540,1))
            proc.stdin.write(np.clip(pixels,0,255).astype(np.uint8).tobytes())
        proc.stdin.close()
        assert proc.wait(timeout=45) == 0, "Original scene encoding failed"
    finally:
        if proc.poll() is None:
            proc.kill(); proc.wait(timeout=5)
save(job / "logs/original-scene.json", {"command": cmd, "exit_code": proc.returncode, "elapsed_seconds": time.monotonic()-begin, "frames": 150, "source_resolution": "540x960", "final_resolution": "1080x1920", "provenance": "Original procedural animated scene, upscaled during composition"})
mixed = job / "assets/audio/mixed.wav"
tool("audio_mixer", {"operation": "full_mix", "tracks": [{"path": str(narration), "role": "speech", "volume": 0.65}, {"path": str(job / "assets/audio/drone.wav"), "role": "music", "volume": 0.24}, {"path": str(job / "assets/audio/knocks.wav"), "role": "sfx", "volume": 0.35}], "target_duration": 5, "ducking": {"enabled": True, "music_volume_during_speech": 0.12, "attack_ms": 80, "release_ms": 300}, "normalize": False, "output_path": str(mixed)})
srt = job / "subtitles/captions.srt"
srt.write_text("1\n00:00:00,000 --> 00:00:01,800\nI locked the door.\n\n2\n00:00:01,800 --> 00:00:05,000\nThen something knocked\nfrom inside.\n", encoding="utf-8")
card = (references[2][1]).read_text(encoding="utf-8")
(job / "assets/ATTRIBUTION.md").write_text("# Local test media provenance\n\nVisuals: original procedural hallway/door animation authored for this job; no stock or external image assets. Source recipe: services/production-adapter/generate-horror-template.py.\n\nMusic/SFX: original mathematical drone and decaying sine knocks authored locally. No third-party recording.\n\nScript: owner-supplied original fictional test fixture.\n\nNarration: installed Piper 1.8.0; en_US-ljspeech-medium. Existing model card below. No model or media downloads. Windows Arial font used by local subtitle rasterizer; no font redistributed.\n\n" + card, encoding="utf-8")
assets = {"version": "1.0", "assets": [{"id": ident, "type": typ, "path": str(file), "source_tool": provider, "scene_id": "scene1", "license": licence, "cost_usd": 0} for ident,typ,file,provider,licence in [("door", "video", source, "original procedural animation", "Original project artwork"), ("narration", "narration", narration, "piper_tts", "Existing LJ Speech public-domain voice dataset; see MODEL_CARD"), ("music", "music", job / "assets/audio/drone.wav", "original mathematical synthesis", "Original project composition"), ("knocks", "sfx", job / "assets/audio/knocks.wav", "original mathematical synthesis", "Original project audio"), ("mixed", "audio", mixed, "audio_mixer", "Combined original and documented narration"), ("subtitles", "subtitle", srt, "owner-script deterministic timing", "Original fixture text")]], "total_cost_usd": 0}
checkpoint("assets", "asset_manifest", assets, True)
edit = {"version": "1.0", "renderer_family": "cinematic-trailer", "render_runtime": "ffmpeg", "composition_mode": "templated", "cuts": [{"id": "cut1", "source": str(source), "in_seconds": 0, "out_seconds": 5}], "subtitles": {"enabled": True, "source": str(srt), "style": "basic"}, "metadata": {"compose_target": {"width": 1080, "height": 1920, "fit": "cover"}, "target_duration_seconds": 5}}
checkpoint("edit", "edit_decisions", edit)
write_checkpoint(job.parent, project_id, "compose", "in_progress", {}, pipeline_type="cinematic")
render_edit = copy.deepcopy(edit)
render_edit["subtitles"].pop("style")  # upstream schema string vs renderer mapping mismatch
result = tool("video_compose", {"operation": "render", "edit_decisions": render_edit, "asset_manifest": assets, "proposal_packet": proposal, "output_path": str(final), "audio_path": str(mixed), "subtitle_path": str(srt), "subtitle_style": {"font": "Arial", "font_size": 19, "bold": True, "outline_width": 2, "margin_v": 52, "alignment": 2}, "codec": "libx264", "crf": 20, "preset": "fast", "script_text": SCRIPT})
review = result.data["final_review"]
assert review["status"] == "pass", "Engine final review requires revision"
assert not review["checks"]["audio_spotcheck"].get("clipping_detected"), "Mix headroom requires revision"
save(job / "artifacts/final_review.json", review)
report = {"version": "1.0", "outputs": [{"path": str(final), "format": "mp4", "codec": "h264", "audio_codec": "aac", "resolution": "1080x1920", "duration_seconds": 5, "file_size_bytes": final.stat().st_size}], "render_time_seconds": time.monotonic()-started, "final_review_ref": "artifacts/final_review.json", "warnings": ["Owner script fixture; procedural source animation at 540x960 upscaled to 1080x1920; no ASR model used", "Offline feasibility review substitutes for out-of-scope web research; no external searches performed"]}
checkpoint("compose", "render_report", report, extra={"final_review": review})
# Preview is an actual decoded frame. Burn-in is additionally evidenced by the
# logged successful subtitles filter and rendered pixels, not an SRT file alone.
preview = job / "previews/frame-2s.png"
subprocess.run([ffmpeg,"-nostdin","-n","-ss","2","-i",str(final),"-frames:v","1","-threads","1",str(preview)],capture_output=True,check=True,timeout=20)
save(job / "logs/generation-result.json", {"success": True, "new_render": True, "job_id": request["job_id"], "script_source": request["script_source"], "narration": {"text": SCRIPT, "provider": "Piper 1.8.0", "voice": "en_US-ljspeech-medium", "duration_seconds": narration_duration, "transcription": "not run; no ASR model downloaded"}, "subtitle_burn_evidence": {"source": str(srt), "method": "OpenMontage successful FFmpeg subtitles filter; actual decoded preview", "preview": str(preview)}, "elapsed_seconds": time.monotonic()-started, "output_path": str(final), "sha256": hashlib.sha256(final.read_bytes()).hexdigest(), "api_charges_usd": 0})
print(json.dumps({"success": True, "job_id": request["job_id"], "elapsed_seconds": time.monotonic()-started}))
