"""Executes a validated storyboard using installed local tools. No creative model,
network acquisition, arbitrary commands, downloads or publishing operations."""
import hashlib
import json
import math
import os
import re
import socket
import subprocess
import sys
import time
import wave
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
def denied(*a,**kw):raise RuntimeError("Network disabled for local storyboard render")
socket.socket.connect=denied;socket.create_connection=denied;socket.getaddrinfo=denied
assert not (ROOT/"openmontage/.env").exists(),"Unexpected engine environment file"
request_file=Path(sys.argv[1]).resolve(strict=True);r=json.loads(request_file.read_text(encoding="utf-8"))
assert re.fullmatch(r"topic-[a-f0-9]{32}",r["project_id"])
assert r["brand_slug"] in ("horror","storytelling","motivation","travel","business-insights","company")
job=ROOT/"generated-videos"/r["brand_slug"]/r["project_id"]
assert request_file==job/"generation-job.json" and r["local_render_preapproved"] is True
assert 3<=r["duration_seconds"]<=60 and not (job/"final/video.mp4").exists()
sys.path.insert(0,str(ROOT/"openmontage"));sys.path.insert(0,str(Path(__file__).parent))
import numpy as np
from scene_components import render_scene, motion_metrics
from pipeline_support import Pipeline
from lib.checkpoint import write_checkpoint

started=time.monotonic();pipeline=Pipeline(job,ROOT,r);proposal=pipeline.prepare()
scenes=r["package"]["storyboard"]["scenes"];profile=r["profile"];duration=r["duration_seconds"]
timings={"storyboard_preparation_seconds":time.monotonic()-started,"asset_selection_seconds":r["asset_selection_seconds"]}


def command(args, timeout=40):
    begin=time.monotonic();result=subprocess.run(args,stdin=subprocess.DEVNULL,capture_output=True,timeout=timeout)
    pipeline.counter+=1;pipeline.save(f"logs/local-command-{pipeline.counter:02}.json",{"command":args,"elapsed_seconds":time.monotonic()-begin,"exit_code":result.returncode,"stderr":result.stderr.decode("utf-8",errors="replace")[-16000:]})
    if result.returncode:raise RuntimeError("Fixed local media command failed")
    return result


def stamp(seconds):
    millis=round(seconds*1000);return f"{millis//3600000:02}:{millis//60000%60:02}:{millis//1000%60:02},{millis%1000:03}"


def samples(file):
    with wave.open(str(file)) as audio:
        assert audio.getsampwidth()==2 and audio.getnchannels()==1
        return np.frombuffer(audio.readframes(audio.getnframes()),dtype="<i2").copy(),audio.getframerate()


voice=ROOT/".runtime/openmontage-pilot/voices/en_US-ljspeech-medium.onnx"
audio_start=time.monotonic();rate=48000;narration=np.zeros(round(duration*rate),dtype=np.float64);cues=[];voice_records=[]
for s in scenes:
    # Phrase timing is measured from real Piper WAV files, not a guessed word
    # clock. Long phrases split at at most eight words; no ASR model required.
    phrases=[]
    for sentence in re.findall(r"[^.!?]+[.!?]*",s["narration"]):
        words=sentence.strip().split()
        phrases.extend(" ".join(words[i:i+8]) for i in range(0,len(words),8))
    raw=[]
    for i,phrase in enumerate(phrases):
        file=job/f"assets/audio/s{s['scene_number']}-p{i+1}.wav"
        pipeline.tool("piper_tts",{"text":phrase,"model":str(voice),"length_scale":1.0,"sentence_silence":0.12,"output_path":str(file)},f"piper-s{s['scene_number']}-p{i+1}")
        data,sr=samples(file);raw.append((phrase,file,len(data)/sr))
    available=s["duration_seconds"]-.16-.06*max(0,len(raw)-1)
    total=sum(v[2] for v in raw);speed=max(.85,total/available)
    if speed>1.35:raise RuntimeError("NARRATION_TOO_LONG: requested speech cannot fit safely at <=1.35x; revise script/duration")
    clock=s["start_seconds"]+.08
    for i,(phrase,file,raw_duration) in enumerate(raw):
        fitted=file.with_name(file.stem+"-fit.wav")
        command(["ffmpeg","-nostdin","-n","-i",str(file),"-af",f"atempo={speed:.7f}","-ar",str(rate),"-ac","1","-c:a","pcm_s16le",str(fitted)])
        data,sr=samples(fitted);end=clock+len(data)/sr
        if end>s["start_seconds"]+s["duration_seconds"]+.025:raise RuntimeError("Fitted narration exceeds scene")
        first=round(clock*rate);last=first+len(data);narration[first:last]+=data[:len(narration[first:last])]
        cues.append({"start":clock,"end":end,"text":phrase,"scene":s["scene_number"]});voice_records.append({"scene":s["scene_number"],"text":phrase,"raw_duration_seconds":raw_duration,"fitted_duration_seconds":len(data)/sr,"speed_factor":speed});clock=end+.06
file=job/"assets/audio/narration.wav"
with wave.open(str(file),"wb") as audio:
    audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(rate);audio.writeframes(np.clip(narration,-32767,32767).astype("<i2").tobytes())
timings["voice_generation_seconds"]=time.monotonic()-audio_start
pipeline.save("logs/narration-alignment.json",{"method":"Measured Piper phrases and measured atempo outputs; known text, no ASR","phrases":voice_records,"cues":cues})
srt=job/"subtitles/captions.srt"
srt.write_text("\n\n".join(f"{i+1}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}" for i,c in enumerate(cues))+"\n",encoding="utf-8")
assert all(a["end"]<=b["start"] for a,b in zip(cues,cues[1:])),"Overlapping subtitles"

visual_start=time.monotonic();sources=[];previous=None
for s,row in zip(scenes,r["selections"]):
    target=job/f"assets/video/scene-{s['scene_number']:02}.mp4"
    previous=render_scene(s,target,profile,job/"logs",row["selected"],previous)
    sources.append(target)
timings["visual_render_seconds"]=time.monotonic()-visual_start

audio_start=time.monotonic();t=np.arange(round(duration*rate))/rate
drone=(.10*np.sin(2*np.pi*55*t)+.035*np.sin(2*np.pi*82.7*t))*np.minimum(t/.25,1)*np.minimum((duration-t)/.18,1)
effects=np.zeros_like(t)
for s in scenes:
    at=s["start_seconds"]+s["duration_seconds"]*.72
    for cue in s["audio_cues"]:
        dt=np.maximum(t-at,0)
        if cue in ("notification","pulse"):effects+=(t>=at)*.24*np.exp(-dt*8)*np.sin(2*np.pi*(740 if cue=="notification" else 90)*dt)
        elif cue=="knock":effects+=(t>=at)*.35*np.exp(-dt*30)*np.sin(2*np.pi*140*dt)
        elif cue in ("whisper","wind"):effects+=np.random.default_rng(78).normal(0,.012,len(t))*np.minimum(np.maximum(t-s["start_seconds"],0),1)*np.maximum(0,np.minimum(s["start_seconds"]+s["duration_seconds"]-t,1))
for name,data in (("drone",drone),("effects",effects)):
    with wave.open(str(job/f"assets/audio/{name}.wav"),"wb") as audio:
        audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(rate);audio.writeframes((np.clip(data,-1,1)*32767).astype("<i2").tobytes())
tracks=[{"path":str(file),"role":"speech","volume":.65},{"path":str(job/"assets/audio/effects.wav"),"role":"sfx","volume":.24}]
if profile["music"]["policy"]!="none":tracks.append({"path":str(job/"assets/audio/drone.wav"),"role":"music","volume":profile["music"]["gain"]})
mixed=job/"assets/audio/mixed.wav";delivery_audio=job/"assets/audio/delivery.wav"
pipeline.tool("audio_mixer",{"operation":"full_mix","tracks":tracks,"target_duration":duration,"ducking":{"enabled":True,"music_volume_during_speech":.12,"attack_ms":60,"release_ms":220},"normalize":False,"output_path":str(mixed)})
pipeline.tool("audio_enhance",{"input_path":str(mixed),"output_path":str(delivery_audio),"audio_codec":"pcm_s16le","custom_af":"loudnorm=I=-20:LRA=7:TP=-4,alimiter=limit=0.63:level=0,aresample=48000"})
timings["audio_mix_seconds"]=time.monotonic()-audio_start
card=(ROOT/".runtime/openmontage-pilot/voices/MODEL_CARD").read_text(encoding="utf-8")
attrib="# Local production provenance\n\nScript source: "+r["script_source"]+".\n\nOriginal procedural illustrations, animation and mathematical audio authored by the project. No external asset/model downloads. Windows Arial is used locally; font files are not redistributed. Piper uses the already installed voice; its model card follows.\n\n"+card+"\n\nSelected local assets (empty means procedural fallback):\n"+json.dumps(r["selections"],indent=2)
(job/"assets/ATTRIBUTION.md").write_text(attrib,encoding="utf-8")
asset_rows=[{"id":f"visual{i+1}","type":"video","path":str(source),"source_tool":"local scene component","scene_id":f"scene{i+1}","license":"Original project artwork or staged licensed asset; see ATTRIBUTION.md"} for i,source in enumerate(sources)]
asset_rows.extend({"id":name,"type":typ,"path":str(p),"source_tool":tool,"scene_id":"all","license":licence} for name,typ,p,tool,licence in [("narration","narration",file,"piper_tts","Existing LJ Speech public-domain dataset; model card saved"),("soundtrack","audio",delivery_audio,"audio_mixer/audio_enhance","Original mathematical score/effects plus documented narration"),("subtitles","subtitle",srt,"measured phrase alignment","Original script text")])
manifest={"version":"1.0","assets":asset_rows,"total_cost_usd":0}
pipeline.stage("assets","asset_manifest",manifest,True)
edit={"version":"1.0","renderer_family":"cinematic-trailer","render_runtime":"ffmpeg","composition_mode":"templated","cuts":[{"id":f"cut{i+1}","source":str(source),"in_seconds":0,"out_seconds":scenes[i]["duration_seconds"]} for i,source in enumerate(sources)],"subtitles":{"enabled":True,"source":str(srt),"style":"basic"},"metadata":{"compose_target":{"width":1080,"height":1920,"fit":"cover"},"target_duration_seconds":duration,"delivery_promise":proposal["production_plan"]["delivery_promise"]}}
pipeline.stage("edit","edit_decisions",edit)
write_checkpoint(job.parent,job.name,"compose","in_progress",{},pipeline_type="cinematic")
edit["subtitles"].pop("style")
compose_start=time.monotonic();final=job/"final/video.mp4"
rgb=profile["subtitle"]["color"].lstrip("#");subtitle_color="&H00"+rgb[4:6]+rgb[2:4]+rgb[0:2]
result=pipeline.tool("video_compose",{"operation":"render","edit_decisions":edit,"asset_manifest":manifest,"proposal_packet":proposal,"audio_path":str(delivery_audio),"subtitle_path":str(srt),"subtitle_style":{"font":"Arial","font_size":profile["subtitle"]["font_size"],"margin_v":profile["subtitle"]["margin_v"],"primary_color":subtitle_color,"outline_width":1.2,"bold":True},"output_path":str(final),"codec":"libx264","crf":20,"preset":"fast","script_text":r["package"]["script"]["narration_text"]})
timings["composition_seconds"]=time.monotonic()-compose_start
review=result.data["final_review"];assert review["status"]=="pass" and not review["checks"]["audio_spotcheck"].get("clipping_detected"),"Engine quality requires revision"
qc_start=time.monotonic()
q=command(["ffmpeg","-nostdin","-v","info","-threads","2","-i",str(final),"-vf","blackdetect=d=0.1:pix_th=0.10,freezedetect=n=-65dB:d=0.5","-af","volumedetect","-f","null","-"],40)
stderr=q.stderr.decode("utf-8",errors="replace");peak=float(re.search(r"max_volume:\s*(-?[\d.]+) dB",stderr)[1]);mean=float(re.search(r"mean_volume:\s*(-?[\d.]+) dB",stderr)[1])
motion=[motion_metrics(source) for source in sources]
quality={"passed":"black_start:" not in stderr and "freeze_start:" not in stderr and peak<=-1 and mean>-45 and all(m["passed"] for m in motion),"peak_dbfs":peak,"mean_dbfs":mean,"no_black_intervals":"black_start:" not in stderr,"no_frozen_intervals":"freeze_start:" not in stderr,"freeze_noise_db":-65,"source_motion_metrics":motion,"full_decode_exit_code":q.returncode,"subtitle_cues":len(cues),"subtitle_alignment":"Actual per-phrase waveform duration; no overlapping cues; no ASR","source_resolution":"540x960","final_resolution":"1080x1920"}
pipeline.save("logs/full-quality.json",quality);assert quality["passed"],"Full media QC failed"
command(["ffmpeg","-nostdin","-n","-ss",str(duration/2),"-i",str(final),"-frames:v","1","-threads","1",str(job/"previews/frame-mid.png")])
timings["qc_seconds"]=time.monotonic()-qc_start
report={"version":"1.0","outputs":[{"path":str(final),"format":"mp4","codec":"h264","audio_codec":"aac","resolution":"1080x1920","duration_seconds":duration,"file_size_bytes":final.stat().st_size}],"render_time_seconds":time.monotonic()-started,"warnings":["Original stylized 540x960 source artwork upscaled to 1080x1920; not photorealistic","No ASR; captions use measured phrase boundaries","Offline technical feasibility, not market/web research"]}
pipeline.stage("compose","render_report",report,extra={"final_review":review})
timings["worker_pipeline_seconds"]=time.monotonic()-started
pipeline.save("logs/generation-result.json",{"success":True,"job_id":r["job_id"],"new_render":True,"script_source":r["script_source"],"performance":timings,"quality":quality,"scenes":[{"number":s["scene_number"],"environment":s["environment"],"component":s["component"],"camera":s["camera_movement"],"source_sha256":hashlib.sha256(source.read_bytes()).hexdigest()} for s,source in zip(scenes,sources)],"narration":{"provider":"Piper 1.8.0","voice":profile["voice"],"text":r["package"]["script"]["narration_text"],"phrases":voice_records},"subtitle_burn_evidence":{"method":"Successful OpenMontage FFmpeg subtitles filter, saved decoded frame for visual review","preview":str(job/"previews/frame-mid.png")},"output_sha256":hashlib.sha256(final.read_bytes()).hexdigest()})
print(json.dumps({"success":True,"job_id":r["job_id"],"elapsed_seconds":time.monotonic()-started}))
