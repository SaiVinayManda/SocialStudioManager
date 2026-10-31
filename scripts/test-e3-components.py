"""Supplemental component checks, not an n8n/video acceptance substitute."""
import hashlib
import json
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root/"services/production-adapter"))
from scene_components import illustration
checks=[];hashes=[]
for env in ("hallway","mirror","road","phone","forest","street","window","abstract","product","travel"):
    s={"environment":env,"component":"graphic" if env=="product" else "environment","text_overlay":"Local test" if env in ("travel","product") else "","visual_description":"Original component fixture"}
    image=illustration(s,.5,["#15253c","#5fa8ed"]);assert image.size==(540,960)
    hashes.append(hashlib.sha256(image.tobytes()).hexdigest());checks.append({"component":env,"passed":True,"frame_sha256":hashes[-1]})
assert len(set(hashes))>=9  # road/street intentionally share the same layout.
s={"environment":"forest","component":"typography","text_overlay":"A changing title","visual_description":"Typography overlay"}
assert illustration(s,.2,["#15253c","#5fa8ed"]).tobytes()!=illustration(s,.8,["#15253c","#5fa8ed"]).tobytes()
checks.append({"component":"progressive text overlay on environment","passed":True})
print(json.dumps({"passed":True,"scope":"Actual PIL component frames; not video renders","checks":checks}))
