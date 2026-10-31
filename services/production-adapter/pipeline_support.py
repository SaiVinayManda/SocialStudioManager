"""OpenMontage artifact/checkpoint and fixed local tool boundary for a supplied plan."""
import json
import time
from pathlib import Path
from datetime import datetime, timezone
from tools.base_tool import BaseTool
from tools.tool_registry import registry
from lib.checkpoint import init_project, write_checkpoint
from schemas.artifacts import validate_artifact


class Pipeline:
    def __init__(self, job, root, request):
        self.job,self.root,self.request,self.counter=job,root,request,0
        for sub in ("logs","scripts","subtitles","previews","final"):(job/sub).mkdir(parents=True,exist_ok=True)
        init_project(job.name,title=request["topic"],pipeline_type="cinematic",pipeline_dir=job.parent)
        original=BaseTool.run_command
        def command(tool,cmd,**kwargs):
            cmd=list(cmd)
            if Path(cmd[0]).stem.lower()=="ffmpeg":
                bounded=[cmd[0],"-nostdin","-benchmark","-filter_threads","1","-filter_complex_threads","1"]
                for token in cmd[1:]:
                    if token=="-i":bounded.extend(["-threads","2"])
                    bounded.append(token)
                if Path(cmd[-1]).suffix.lower()==".mp4":
                    extra=["-threads","4","-pix_fmt","yuv420p"]
                    if not any(k in cmd for k in ("-c:v","-codec:v","-c","-codec")):extra.extend(["-c:v","libx264","-preset","fast","-crf","20"])
                    bounded[-1:-1]=extra
                cmd=bounded
            start=time.monotonic();self.counter+=1
            try:
                r=original(tool,cmd,**kwargs)
                self.save(f"logs/command-{self.counter:02}.json",{"command":cmd,"elapsed_seconds":time.monotonic()-start,"exit_code":r.returncode,"stderr":r.stderr})
                return r
            except Exception as e:
                self.save(f"logs/command-{self.counter:02}.json",{"command":cmd,"elapsed_seconds":time.monotonic()-start,"error":str(e)});raise
        BaseTool.run_command=command
        registry.discover()

    def save(self, name, data):
        file=self.job/name;file.parent.mkdir(parents=True,exist_ok=True)
        file.write_text(json.dumps(data,indent=2,default=str)+"\n",encoding="utf-8")

    def stage(self,stage,name,artifact,gated=False,extra=None):
        validate_artifact(name,artifact);self.save("artifacts/"+name+".json",artifact)
        for k,v in (extra or {}).items():validate_artifact(k,v);self.save("artifacts/"+k+".json",v)
        data={name:artifact,**(extra or {})};meta={"approval_evidence":self.request["approval_evidence"],"public_publishing_approved":False}
        if gated:write_checkpoint(self.job.parent,self.job.name,stage,"awaiting_human",data,pipeline_type="cinematic",metadata=meta)
        write_checkpoint(self.job.parent,self.job.name,stage,"completed",data,pipeline_type="cinematic",human_approved=gated,metadata=meta)

    def tool(self,name,params,label=None):
        start=time.monotonic();result=registry.get(name).execute(params)
        self.save("logs/"+(label or name)+".json",{"success":result.success,"data":result.data,"error":result.error,"elapsed_seconds":time.monotonic()-start})
        if not result.success:raise RuntimeError(name+" failed: "+str(result.error))
        return result

    def prepare(self):
        r=self.request;p=r["package"];duration=r["duration_seconds"]
        refs=[("Structured job",self.job/"generation-job.json"),("Storyboard",self.job/"scripts/production-package.json"),("Cinematic manifest",self.root/"openmontage/pipeline_defs/cinematic.yaml"),("Voice licence",self.root/".runtime/openmontage-pilot/voices/MODEL_CARD"),("Local scene components",self.root/"services/production-adapter/scene_components.py")]
        self.save("scripts/production-package.json",p)
        research={"version":"1.0","topic":r["topic"],"research_date":datetime.now(timezone.utc).date().isoformat(),"landscape":{"existing_content":[{"title":title,"source":"Local production evidence, not market research","angle":"Offline engineering preflight","what_it_covers":str(file)} for title,file in refs[:3]],"saturated_angles":[],"underserved_gaps":["Dynamic storyboard-directed production instead of one fixed template"]},"data_points":[{"claim":claim,"source_url":file.as_uri(),"credibility":"primary_source"} for claim,file in [("The submitted plan sets duration, narration and scene components.",refs[0][1]),("The installed voice is English LJSpeech.",refs[3][1]),("Scene components are local original artwork.",refs[4][1])]],"audience_insights":{"common_questions":["Review question, not surveyed: Is narration clear?","Review question, not surveyed: Do visuals follow the storyboard?","Review question, not surveyed: Are captions readable?"],"misconceptions":[],"knowledge_level":"Offline feasibility only. External research/eight web searches omitted under the owner's no-download/no-service fixture test scope."},"angles_discovered":[{"name":name,"hook":p["concept"]["opening_hook"],"type":"narrative","why_now":"Local acceptance test"} for name in ("Environment-led","Illustration with camera motion","Animated typography")],"sources":[{"title":title,"url":file.as_uri(),"used_for":"Technical feasibility/provenance"} for title,file in refs]}
        self.stage("research","research_brief",research)
        concept=p["concept"]
        proposal={"version":"1.0","concept_options":[{"id":f"c{i}","title":name,"hook":concept["opening_hook"],"narrative_structure":"story","visual_approach":name,"target_duration_seconds":duration,"why_this_works":"Realizes the supplied storyboard using existing local tools"} for i,name in enumerate((concept["angle"],"Camera-led illustration","Graphic/text-led treatment"),1)],"selected_concept":{"concept_id":"c1","rationale":"Use the validated supplied storyboard without substituting topic-specific hardcoded logic"},"production_plan":{"pipeline":"cinematic","stages":[{"stage":"assets","tools":[{"tool_name":"piper_tts","role":"Local narration","available":True,"estimated_cost_usd":0}],"approach":"Per-phrase narration and original/approved local visual assets"},{"stage":"compose","tools":[{"tool_name":"video_compose","role":"Final FFmpeg composition and review","available":True,"estimated_cost_usd":0}],"approach":"Render the supplied scene timeline and burn measured subtitles"}],"render_runtime":"ffmpeg","renderer_family":"cinematic-trailer","composition_mode":"templated","delivery_promise":{"promise_type":"hybrid","motion_required":True,"tone_mode":concept["emotional_tone"],"quality_floor":"presentable","source_required":False,"approved_fallback":"original procedural illustration/animation if licensed stock unavailable"}},"cost_estimate":{"total_estimated_usd":0,"line_items":[],"budget_verdict":"within_budget"},"approval":{"status":"approved","approved_budget_usd":0,"user_notes":r["approval_evidence"]}}
        decision={"version":"1.0","project_id":self.job.name,"decisions":[{"decision_id":"d-001","stage":"proposal","category":"render_runtime_selection","subject":"Local storyboard composition runtime","options_considered":[{"option_id":"ffmpeg","label":"Existing offline FFmpeg","score":1,"reason":"Existing verified runtime; no installation or model service required"}],"selected":"ffmpeg","reason":"Owner requests efficient reuse of the current installed pipeline","user_approved":True}]}
        self.stage("proposal","proposal_packet",proposal,True,{"decision_log":decision})
        script={"version":"1.0","title":r["topic"],"total_duration_seconds":duration,"sections":[{"id":f"s{s['scene_number']}","text":s["narration"],"start_seconds":s["start_seconds"],"end_seconds":s["start_seconds"]+s["duration_seconds"]} for s in p["storyboard"]["scenes"]]}
        self.stage("script","script",script,True)
        (self.job/"scripts/narration.txt").write_text(p["script"]["narration_text"]+"\n",encoding="utf-8")
        scenes={"version":"1.0","scenes":[{"id":f"scene{s['scene_number']}","type":"animation","description":s["visual_description"],"movement":s["camera_movement"],"start_seconds":s["start_seconds"],"end_seconds":s["start_seconds"]+s["duration_seconds"],"script_section_id":f"s{s['scene_number']}","transition_in":s["transition"],"overlay_notes":s["text_overlay"]} for s in p["storyboard"]["scenes"]]}
        self.stage("scene_plan","scene_plan",scenes,True)
        return proposal
