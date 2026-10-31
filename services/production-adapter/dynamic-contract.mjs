import {demand,exact,uuid,hash} from '../studio-runtime/contracts.mjs';
import {brandSlugs,brandProfile} from '../ai-agent-manager/prompts.mjs';
import {validateOutput} from '../ai-agent-manager/schemas.mjs';
export const DYNAMIC_TEMPLATE='storyboard-v1';
export const PRODUCTION_PROMPT_VERSION='studio-production-prompts-v1';
export const defaultProfiles=Object.fromEntries(brandSlugs.map((slug,i)=>[slug,{version:1,slug,language:'en',voice:'en_US-ljspeech-medium',visual_style:['atmospheric','illustrated','energetic','travel','editorial','professional'][i],palette:[['#122029','#967b54'],['#18263c','#d5a06b'],['#18343a','#f2b84b'],['#183c43','#76d4c5'],['#15253c','#5fa8ed'],['#202d42','#a5bee6']][i],subtitle:{font:'Arial',font_size:14,margin_v:35,color:'#ffffff'},music:{policy:'original_math',gain:0.20},default_duration_seconds:30,prompt_template_version:PRODUCTION_PROMPT_VERSION}]));
export function validateProductionProfile(p,slug){
 exact(p,['version','slug','language','voice','visual_style','palette','subtitle','music','default_duration_seconds','prompt_template_version'],['version','slug','language','voice','palette','subtitle','music']);
 demand(p.version===1&&p.slug===slug&&brandSlugs.includes(slug)&&p.language==='en'&&p.voice==='en_US-ljspeech-medium','UNSUPPORTED_LOCAL_VOICE_OR_PROFILE');
 if(p.visual_style!==undefined)demand(['atmospheric','illustrated','energetic','travel','editorial','professional'].includes(p.visual_style),'INVALID_VISUAL_STYLE');
 if(p.default_duration_seconds!==undefined)demand(Number.isInteger(p.default_duration_seconds)&&p.default_duration_seconds>=3&&p.default_duration_seconds<=60,'INVALID_DEFAULT_DURATION');
 if(p.prompt_template_version!==undefined)demand(p.prompt_template_version===PRODUCTION_PROMPT_VERSION,'INVALID_PRODUCTION_PROMPT_VERSION');
 demand(Array.isArray(p.palette)&&p.palette.length===2&&p.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c)),'INVALID_PALETTE');
 exact(p.subtitle,['font','font_size','margin_v','color'],['font','font_size','margin_v','color']);demand(p.subtitle.font==='Arial'&&Number.isInteger(p.subtitle.font_size)&&p.subtitle.font_size>=10&&p.subtitle.font_size<=22&&Number.isInteger(p.subtitle.margin_v)&&p.subtitle.margin_v>=10&&p.subtitle.margin_v<=65&&/^#[0-9a-f]{6}$/i.test(p.subtitle.color),'INVALID_SUBTITLE_STYLE');
 exact(p.music,['policy','gain'],['policy','gain']);demand(['original_math','none'].includes(p.music.policy)&&Number.isFinite(p.music.gain)&&p.music.gain>=0&&p.music.gain<=0.3,'INVALID_MUSIC_POLICY');return p;
}
export function topicRequest(body,brand){
 exact(body,['source_type','brand_id','topic','duration_seconds','idempotency_key','provider_mode','acceptance_run_id','script','production'],['source_type','brand_id','topic','duration_seconds','idempotency_key','provider_mode']);
 demand(body.source_type==='topic'&&body.brand_id===brand.id&&brandSlugs.includes(brand.slug),'UNKNOWN_BRAND');
 demand(typeof body.topic==='string'&&body.topic.trim().length>=5&&body.topic.length<=500,'INVALID_TOPIC');
 demand(Number.isInteger(body.duration_seconds)&&body.duration_seconds>=3&&body.duration_seconds<=60,'DYNAMIC_DURATION_LIMIT');
 demand(['fixture','live'].includes(body.provider_mode),'INVALID_PROVIDER_MODE');
 demand(typeof body.idempotency_key==='string'&&/^[A-Za-z0-9:_-]{8,180}$/.test(body.idempotency_key),'INVALID_IDEMPOTENCY_KEY');
 if(body.acceptance_run_id!==undefined)demand(uuid(body.acceptance_run_id),'INVALID_ACCEPTANCE_RUN');
 if(body.script!==undefined)demand(typeof body.script==='string'&&body.script.length>0&&body.script.length<=3000,'INVALID_SCRIPT');
 const profile={...defaultProfiles[brand.slug],...(body.production??{})};validateProductionProfile(profile,brand.slug);
 // Folder is derived from brand + idempotency key; callers cannot inject a path.
 const project='topic-'+hash([brand.id,body.idempotency_key]).slice(0,32);
 return {brand_id:brand.id,source_type:'approved_openmontage',source:{root_id:'generated',relative_path:`${brand.slug}/${project}/final/video.mp4`,engine_project:project},topic:body.topic,idempotency_key:body.idempotency_key,production_settings:{generation_template:DYNAMIC_TEMPLATE,requires_ai:true,expected_width:1080,expected_height:1920,min_duration:body.duration_seconds-0.15,max_duration:body.duration_seconds+0.15,require_audio:true,timeout_ms:300000,platforms:['youtube','instagram','facebook'],...(body.acceptance_run_id?{acceptance_run_id:body.acceptance_run_id}:{}),dynamic:{duration_seconds:body.duration_seconds,profile},ai_request:{task_type:'production_package',input:{topic:body.topic,duration_seconds:body.duration_seconds,language:profile.language,audience:brandProfile(brand.slug).audience,tone:brandProfile(brand.slug).tone,...(body.script?{script:body.script}:{})},output_schema_version:'social-studio.ai.v2',provider_policy:body.provider_mode==='fixture'?{mode:'mock',providers:['mock']}:{mode:'live',providers:['codex','agy','9router']},maximum_cost:0,timeout_ms:60000,retry_policy:{max_attempts_per_provider:1,initial_backoff_ms:100}}},metadata:{title:body.topic.slice(0,150)}};
}
export function validateStoryboard(value,duration){return validateOutput('production_package',value,{duration_seconds:duration});}
