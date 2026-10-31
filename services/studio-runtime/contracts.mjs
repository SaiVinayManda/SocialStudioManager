import crypto from 'node:crypto';
export class StudioError extends Error {
  constructor(code,status=400){super(code);this.code=code;this.status=status;}
}
export const demand=(condition,code,status=400)=>{if(!condition)throw new StudioError(code,status);};
export const uuid=(value)=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const checksum=(value)=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
export const hash=(value)=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
export function exact(value,allowed,required=[]){
  demand(value&&typeof value==='object'&&!Array.isArray(value),'OBJECT_REQUIRED');
  demand(Object.keys(value).every(k=>allowed.includes(k)),'UNKNOWN_FIELD');
  demand(required.every(k=>Object.hasOwn(value,k)),'MISSING_FIELD');return value;
}
export function reference(value,brandSlug){
  exact(value,['root_id','relative_path','engine_project','expected_checksum'],['root_id','relative_path']);
  demand(['generated','brands'].includes(value.root_id),'UNREGISTERED_ROOT');
  demand(typeof value.relative_path==='string'&&value.relative_path.length<=240,'INVALID_PATH');
  const parts=value.relative_path.split('/');
  demand(parts.length>=2&&parts.every(p=>p!=='.'&&p!=='..'&&/^[a-zA-Z0-9][a-zA-Z0-9 ._-]*$/.test(p)&&!p.endsWith('.')&&!p.endsWith(' ')&&!/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(p)),'UNSAFE_PATH');
  demand(parts[0]===brandSlug,'BRAND_PATH_MISMATCH',403);
  if(value.root_id==='brands')demand(parts[1]==='inputs','INPUT_FOLDER_REQUIRED');
  demand(/\.mp4$/i.test(value.relative_path),'MP4_REQUIRED');
  if(value.engine_project!==undefined)demand(/^[a-z0-9-]{1,80}$/.test(value.engine_project),'INVALID_ENGINE_PROJECT');
  if(value.expected_checksum!==undefined)demand(checksum(value.expected_checksum),'INVALID_CHECKSUM');
  return {...value};
}
export function jobInput(body,brand){
  exact(body,['brand_id','source_type','source','topic','script_reference','production_settings','metadata','idempotency_key'],['brand_id','source_type','source','idempotency_key']);
  demand(uuid(body.brand_id)&&body.brand_id===brand.id,'UNKNOWN_BRAND');
  demand(['existing_file','approved_openmontage'].includes(body.source_type),'UNSUPPORTED_SOURCE');
  demand(typeof body.idempotency_key==='string'&&/^[a-zA-Z0-9:_-]{8,180}$/.test(body.idempotency_key),'INVALID_IDEMPOTENCY_KEY');
  demand(body.topic===undefined||(typeof body.topic==='string'&&body.topic.length<=2000),'INVALID_TOPIC');
  if(body.script_reference!==undefined){exact(body.script_reference,['root_id','relative_path'],['root_id','relative_path']);demand(/\.txt$/i.test(body.script_reference.relative_path),'TEXT_SCRIPT_REQUIRED');reference({...body.script_reference,relative_path:body.script_reference.relative_path.replace(/\.txt$/i,'.mp4')},brand.slug);}
  const settings=body.production_settings??{};
  exact(settings,['expected_width','expected_height','min_duration','max_duration','require_audio','subtitle_reference','licence_reference','platforms','scheduled_at','acceptance_run_id','timeout_ms','requires_ai','ai_request','generation_template','dynamic']);
  if(settings.generation_template!==undefined)demand(body.source_type==='approved_openmontage'&&['horror-door-5s-v1','storyboard-v1'].includes(settings.generation_template)&&(settings.generation_template==='storyboard-v1'||uuid(settings.acceptance_run_id))&&settings.requires_ai===true,'UNAPPROVED_GENERATION_TEMPLATE',403);
  if(settings.dynamic!==undefined)demand(settings.generation_template==='storyboard-v1'&&settings.dynamic&&typeof settings.dynamic==='object'&&!Array.isArray(settings.dynamic),'INVALID_DYNAMIC_SETTINGS');
  if(settings.ai_request!==undefined)demand(settings.requires_ai===true&&settings.ai_request&&typeof settings.ai_request==='object'&&!Array.isArray(settings.ai_request),'INVALID_AI_SETTINGS');
  for(const key of ['expected_width','expected_height'])if(settings[key]!==undefined)demand(Number.isInteger(settings[key])&&settings[key]>=240&&settings[key]<=3840,'INVALID_RESOLUTION');
  for(const key of ['min_duration','max_duration'])if(settings[key]!==undefined)demand(Number.isFinite(settings[key])&&settings[key]>0&&settings[key]<=3600,'INVALID_DURATION');
  demand((settings.min_duration??1)<=(settings.max_duration??3600),'INVALID_DURATION_RANGE');
  if(settings.timeout_ms!==undefined)demand(Number.isInteger(settings.timeout_ms)&&settings.timeout_ms>=1000&&settings.timeout_ms<=900000,'INVALID_TIMEOUT');
  for(const key of ['require_audio','requires_ai'])if(settings[key]!==undefined)demand(typeof settings[key]==='boolean','INVALID_BOOLEAN');
  if(settings.platforms!==undefined)demand(Array.isArray(settings.platforms)&&settings.platforms.length>0&&settings.platforms.length<=3&&new Set(settings.platforms).size===settings.platforms.length&&settings.platforms.every(p=>['youtube','instagram','facebook'].includes(p)),'INVALID_PLATFORMS');
  if(settings.scheduled_at!==undefined)demand(Number.isFinite(Date.parse(settings.scheduled_at))&&Date.parse(settings.scheduled_at)<Date.now()+366*86400000,'INVALID_SCHEDULE');
  if(settings.acceptance_run_id!==undefined)demand(uuid(settings.acceptance_run_id),'INVALID_ACCEPTANCE_RUN');
  if(settings.subtitle_reference!==undefined){const s=settings.subtitle_reference;exact(s,['root_id','relative_path'],['root_id','relative_path']);const fake={...s,relative_path:s.relative_path?.replace(/\.srt$/i,'.mp4')};reference(fake,brand.slug);demand(/\.srt$/i.test(s.relative_path),'SRT_REQUIRED');}
  if(settings.licence_reference!==undefined){const s=settings.licence_reference;exact(s,['root_id','relative_path','checksum'],['root_id','relative_path','checksum']);demand(typeof s.relative_path==='string'&&/\.(md|json)$/i.test(s.relative_path)&&checksum(s.checksum),'INVALID_LICENCE_REFERENCE');reference({root_id:s.root_id,relative_path:s.relative_path.replace(/\.(md|json)$/i,'.mp4')},brand.slug);}
  const metadata=body.metadata??{};exact(metadata,['title','description','caption','hashtags']);
  for(const [key,value]of Object.entries(metadata))if(key==='hashtags')demand(Array.isArray(value)&&value.length<=30&&value.every(t=>typeof t==='string'&&t.length<=100),'INVALID_HASHTAGS');else demand(typeof value==='string'&&value.length<=5000,'INVALID_METADATA');
  const source=reference(body.source,brand.slug);if(body.source_type==='approved_openmontage')demand(source.root_id==='generated'&&source.engine_project,'PREAPPROVED_PROJECT_REQUIRED');
  if(body.source_type==='existing_file')demand(checksum(source.expected_checksum),'EXISTING_FILE_CHECKSUM_REQUIRED');
  return {...body,source,production_settings:settings,metadata};
}
export function authenticate(header,secrets){
  demand(typeof header==='string'&&header.startsWith('Bearer ')&&header.length<=200,'UNAUTHORIZED',401);
  const candidate=crypto.createHash('sha256').update(header.slice(7)).digest();
  for(const [role,value]of Object.entries(secrets)){if(crypto.timingSafeEqual(candidate,crypto.createHash('sha256').update(value).digest()))return role;}
  throw new StudioError('UNAUTHORIZED',401);
}
export function signWebhook(body,key,nonce=crypto.randomUUID(),timestamp=new Date().toISOString()){
  const message=JSON.stringify({nonce,timestamp,body});return {nonce,timestamp,body,signature:crypto.createHmac('sha256',key).update(message).digest('hex')};
}
export function verifyWebhook(envelope,key,now=Date.now()){
  exact(envelope,['nonce','timestamp','body','signature'],['nonce','timestamp','body','signature']);
  demand(uuid(envelope.nonce)&&checksum(envelope.signature),'INVALID_WEBHOOK',401);
  const age=now-Date.parse(envelope.timestamp);demand(Number.isFinite(age)&&age>=-5000&&age<=60000,'STALE_WEBHOOK',401);
  const expected=signWebhook(envelope.body,key,envelope.nonce,envelope.timestamp).signature;
  demand(crypto.timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(envelope.signature,'hex')),'INVALID_SIGNATURE',401);
  return envelope.body;
}
export const retryDelay=(attempt,retryAfter=0)=>Math.min(300,Math.max(retryAfter,2**Math.min(attempt,8)));
