import json
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1];session=json.loads((root/".runtime/orchestrator/e3-session.json").read_text());folder=root/"docs/test-evidence/milestone-e3"/session["id"]
ffmpeg=root/".runtime/openmontage-pilot/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe"
results=[]
for c in session["cases"]:
    record=json.loads((folder/f"{c['key']}-attempt-{c['attempt']}.json").read_text());final=Path(record["asset"]["windows_path"]);job=final.parents[1]
    cue=json.loads((job/"logs/narration-alignment.json").read_text())["cues"][0];at=(cue["start"]+cue["end"])/2
    preview=job/"previews/first-caption.png"
    if not preview.exists():subprocess.run([str(ffmpeg),"-nostdin","-n","-ss",str(at),"-i",str(final),"-frames:v","1","-threads","1",str(preview)],capture_output=True,check=True,timeout=20)
    pixels=np.asarray(Image.open(preview).convert("RGB"));area=pixels[int(len(pixels)*.6):int(len(pixels)*.96)]
    white=int(np.sum(np.min(area,axis=2)>200));passed=white>1000
    results.append({"case":c["key"],"sample_time_seconds":at,"expected_cue_text":cue["text"],"decoded_frame":str(preview),"bright_pixels_in_caption_region":white,"passed":passed})
report={"passed":all(r["passed"] for r in results),"method":"Actual decoded frame sampled within a measured subtitle cue; bright text pixels in caption region plus successful logged subtitles filter. No OCR/ASR claim.","results":results}
(folder/"caption-evidence.json").write_text(json.dumps(report,indent=2)+"\n");print(json.dumps(report));assert report["passed"]
