import {demand} from '../studio-runtime/contracts.mjs';
import {rejectCredentialMaterial} from './safety.mjs';

export const SCHEMA_VERSION='social-studio.ai.v2';
const text=(max=12000)=>({type:'string',minLength:1,maxLength:max});
const list=(items,min=1,max=24)=>({type:'array',items,minItems:min,maxItems:max});
const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const platform={type:'string',enum:['youtube','instagram','facebook','all']};
const scene=object({scene_number:{type:'integer',minimum:1,maximum:24},duration_seconds:{type:'number',minimum:1,maximum:120},narration:text(3000),visual_direction:text(2000),footage_keywords:list(text(100),1,8),transition:text(200),sound_design:text(1000)});
const script=object({opening_hook:text(500),original_script:text(),narration_text:text(),closing_line:text(500),pacing:text(2000),scenes:list(scene)});
const titles=object({titles:list(object({title:text(150),platform}),5,5)});
const captions=object({youtube_description:text(5000),instagram_caption:text(2200),facebook_caption:text(5000)});
const hashtags=object(Object.fromEntries(['youtube','instagram','facebook'].map(p=>[p,list({type:'string',pattern:'^#[A-Za-z0-9_]{1,60}$'},1,20)])));
const storyboard=object({scenes:list(scene)});
export const outputSchemas={
  script_generation:script,title_generation:titles,caption_generation:captions,hashtag_generation:hashtags,storyboard_generation:storyboard,
  content_review:object({scores:object(Object.fromEntries(['hook_strength','narrative_consistency','clarity','brand_alignment'].map(x=>[x,{type:'number',minimum:0,maximum:10}]))),findings:list(text(1500),0,20),policy_notes:list(text(1500),0,20),advisory:{type:'boolean',const:true}}),
  content_rewriting:object({revised_text:text(),change_notes:list(text(1500)),preserved_facts:list(text(1000),0,30)}),
  content_package:object({script,titles,captions,hashtags,storyboard})
};
// Intentionally implements only the closed schema vocabulary above. Unknown schema
// keywords cannot be supplied by callers. No eval, URL refs or coercion.
export function matchesSchema(schema,value){
  if(schema.const!==undefined&&value!==schema.const)return false;
  if(schema.enum&&!schema.enum.includes(value))return false;
  if(schema.type==='object')return value!==null&&typeof value==='object'&&!Array.isArray(value)&&schema.required.every(k=>Object.hasOwn(value,k))&&Object.keys(value).every(k=>Object.hasOwn(schema.properties,k)&&matchesSchema(schema.properties[k],value[k]));
  if(schema.type==='array')return Array.isArray(value)&&value.length>=schema.minItems&&value.length<=schema.maxItems&&value.every(v=>matchesSchema(schema.items,v));
  if(schema.type==='string')return typeof value==='string'&&value.length>=(schema.minLength??0)&&value.length<=(schema.maxLength??Infinity)&&(!schema.pattern||new RegExp(schema.pattern).test(value));
  if(schema.type==='boolean')return typeof value==='boolean';
  if(['number','integer'].includes(schema.type))return Number.isFinite(value)&&(schema.type!=='integer'||Number.isInteger(value))&&value>=(schema.minimum??-Infinity)&&value<=(schema.maximum??Infinity);
  return false;
}
export function validateOutput(taskType,output,input={}){
  demand(Buffer.byteLength(JSON.stringify(output)??'')<=131072,'AI_OUTPUT_TOO_LARGE');
  rejectCredentialMaterial(output);
  demand(outputSchemas[taskType]&&matchesSchema(outputSchemas[taskType],output),'AI_OUTPUT_SCHEMA_INVALID');
  const boards=taskType==='content_package'?[output.script.scenes,output.storyboard.scenes]:['script_generation','storyboard_generation'].includes(taskType)?[output.scenes]:[];
  for(const scenes of boards){
    demand(scenes.every((s,i)=>s.scene_number===i+1),'AI_SCENE_ORDER_INVALID');
    if(input.duration_seconds)demand(Math.abs(scenes.reduce((a,s)=>a+s.duration_seconds,0)-input.duration_seconds)<=2,'AI_DURATION_MISMATCH');
    if(input.scene_count)demand(scenes.length===input.scene_count,'AI_SCENE_COUNT_MISMATCH');
  }
  if(taskType==='content_package')demand(JSON.stringify(output.script.scenes)===JSON.stringify(output.storyboard.scenes),'AI_STORYBOARD_INCONSISTENT');
  if(['script_generation','content_package'].includes(taskType)){
    const script=taskType==='content_package'?output.script:output,normalize=s=>s.replace(/\s+/g,' ').trim();
    demand(normalize(script.narration_text)===normalize(script.scenes.map(s=>s.narration).join(' ')),'AI_NARRATION_INCONSISTENT');
  }
  return output;
}
