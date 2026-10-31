import {demand,uuid} from '../studio-runtime/contracts.mjs';
import {validateOutput} from './schemas.mjs';
import {brandProfile} from './prompts.mjs';

// Editorial translation only. No network acquisition, provider selection, render
// invocation, OpenMontage source edits, or implicit approval of generated assets.
export function toOpenMontage(task,slug){
  demand(uuid(task.id??task.task_id)&&uuid(task.content_job_id)&&uuid(task.brand_id),'INVALID_AI_IDENTITY');
  demand(['script_generation','content_package','production_package'].includes(task.task_type),'AI_SCRIPT_REQUIRED');
  const profile=brandProfile(slug),output=task.validated_output??task.output;
  validateOutput(task.task_type,output,task.input??{});
  if(task.task_type==='production_package')return {schema_version:'social-studio.openmontage-input.v2',job_id:task.content_job_id,brand_id:task.brand_id,brand_slug:slug,topic:task.input.topic,script:output.script.narration_text,duration_seconds:output.script.estimated_duration_seconds,concept:output.concept,storyboard:output.storyboard,platform_metadata:output.metadata,brand_settings:profile,source_ai_task_id:task.id??task.task_id,source_output_checksum:task.output_checksum??null,external_acquisition_approved:false,publishing_allowed:false};
  const script=task.task_type==='content_package'?output.script:output;
  const duration=script.scenes.reduce((a,s)=>a+s.duration_seconds,0);
  let clock=0;
  const sections=script.scenes.map(s=>{const start=clock;clock+=s.duration_seconds;return {id:`section_${String(s.scene_number).padStart(3,'0')}`,text:s.narration,start_seconds:start,end_seconds:clock};});
  const artifacts={script:{version:'1.0',title:task.input?.topic??script.opening_hook,total_duration_seconds:duration,sections},scene_plan:{version:'1.0',scenes:script.scenes.map((s,i)=>({id:`scene_${String(s.scene_number).padStart(3,'0')}`,type:'broll',description:s.visual_direction,start_seconds:sections[i].start_seconds,end_seconds:sections[i].end_seconds,script_section_id:sections[i].id,transition_out:s.transition,overlay_notes:'Sound direction: '+s.sound_design}))}};
  return {schema_version:'social-studio.openmontage-input.v1',job_id:task.content_job_id,brand_id:task.brand_id,brand_slug:slug,source_type:'topic',topic:task.input?.topic??'',script:script.original_script,narration_text:script.narration_text,opening_hook:script.opening_hook,closing_line:script.closing_line,duration_seconds:duration,language:task.input?.language??profile.language,aspect_ratio:'9:16',resolution:{width:1080,height:1920},brand_settings:profile,
    storyboard:{scenes:script.scenes.map(s=>({scene_id:`scene_${String(s.scene_number).padStart(3,'0')}`,duration:s.duration_seconds,description:s.visual_direction,narration:s.narration,footage_search_terms:s.footage_keywords,transition:s.transition,sound_design:s.sound_design}))},
    openmontage_artifacts:artifacts,source_ai_task_id:task.id??task.task_id,source_output_checksum:task.output_checksum??null,approval_status:'draft_requires_operator_review',external_acquisition_approved:false,render_requested:false,publishing_allowed:false};
}
