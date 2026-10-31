"""Compare raw visual sources without subtitles, so text changes cannot fake it."""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]
run=json.loads((root/".runtime/orchestrator/e3-session.json").read_text())
folder=root/"docs/test-evidence/milestone-e3"/run["id"]
rows=[]
for case in run["cases"]:
    data=json.loads((folder/f"{case['key']}-attempt-{case['attempt']}.json").read_text())
    assert not data.get("error")
    job=Path(data["asset"]["windows_path"]).parents[1]
    image=job/"assets/video/scene-01-raw-mid.png"
    rows.append({"case":case["key"],"frame":str(image),"environment":data["asset"]["validation_report"]["scenes"][0]["environment"],"component":data["asset"]["validation_report"]["scenes"][0]["component"],"pixels":np.asarray(Image.open(image).convert("RGB").resize((135,240))).astype(float),"script":data["script"],"checksum":data["asset"]["checksum"]})
comparisons=[]
for i,a in enumerate(rows):
    for b in rows[i+1:]:
        mae=float(np.mean(np.abs(a["pixels"]-b["pixels"])))
        comparisons.append({"a":a["case"],"b":b["case"],"mean_absolute_pixel_difference_0_to_255":mae,"different":mae>4})
report={"passed":len(rows)==3 and all(p["different"] for p in comparisons) and len({r["script"] for r in rows})==3 and len({r["checksum"] for r in rows})==3 and len({r["environment"] for r in rows})==3,"method":"Pairwise mean absolute RGB difference of actual raw source midpoint frames, before captions; threshold >4/255. Confirms changed imagery, not artistic quality.","comparisons":comparisons,"scenes":[{k:v for k,v in r.items() if k not in ("pixels","script")} for r in rows]}
(folder/"visual-comparison.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps(report));sys.exit(0 if report["passed"] else 1)
