import json
import subprocess
import sys
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1]
ffmpeg=root/".runtime/openmontage-pilot/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe"
p=subprocess.run([str(ffmpeg),"-nostdin","-v","error","-i",sys.argv[1],"-vf","scale=135:240","-pix_fmt","gray","-f","rawvideo","pipe:1"],capture_output=True,timeout=30,check=True)
frames=np.frombuffer(p.stdout,dtype=np.uint8).reshape((-1,240,135)).astype(float)
d=np.abs(np.diff(frames,axis=0)).mean(axis=(1,2));same=0;longest=0
for v in d:
    same=same+1 if v==0 else 0;longest=max(longest,same)
print(json.dumps({"frames":len(frames),"min_frame_difference":float(d.min()),"mean_frame_difference":float(d.mean()),"max_frame_difference":float(d.max()),"longest_exact_duplicate_run":longest,"one_second_differences":[float(np.abs(frames[i]-frames[i-30]).mean()) for i in range(30,len(frames),30)]}))
