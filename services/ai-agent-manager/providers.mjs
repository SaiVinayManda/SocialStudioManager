import {demand,exact,uuid,StudioError} from '../studio-runtime/contracts.mjs';
export const taskTypes=['script_generation','title_generation','caption_generation','hashtag_generation','storyboard_generation','content_review'];
export function validateTask(task){
  exact(task,['brand_id','job_id','task_type','input','provider_policy','maximum_cost','timeout_ms'],['brand_id','job_id','task_type','input','provider_policy','maximum_cost','timeout_ms']);
  demand(uuid(task.brand_id)&&uuid(task.job_id),'INVALID_JOB_REFERENCE');demand(taskTypes.includes(task.task_type),'UNSUPPORTED_AI_TASK');
  exact(task.input,['topic','script','metadata']);demand(JSON.stringify(task.input).length<=20000,'AI_INPUT_TOO_LARGE');
  for(const key of ['topic','script'])if(task.input[key]!==undefined)demand(typeof task.input[key]==='string','INVALID_AI_INPUT');
  if(task.input.metadata!==undefined)demand(task.input.metadata&&typeof task.input.metadata==='object'&&!Array.isArray(task.input.metadata),'INVALID_AI_INPUT');
  demand(task.maximum_cost===0,'PAID_AI_NOT_APPROVED',403);demand(Number.isInteger(task.timeout_ms)&&task.timeout_ms>=100&&task.timeout_ms<=120000,'INVALID_TIMEOUT');
  exact(task.provider_policy,['providers'],['providers']);demand(Array.isArray(task.provider_policy.providers)&&task.provider_policy.providers.length>=1&&task.provider_policy.providers.length<=3&&task.provider_policy.providers.every(x=>['mock','mock-unavailable'].includes(x)),'UNAPPROVED_AI_PROVIDER',403);
  return task;
}
export async function performMockTask(task){
  validateTask(task);const attempts=[];
  for(const provider of task.provider_policy.providers){
    if(provider==='mock-unavailable'){attempts.push({provider,status:'temporary_failure',cost:0});continue;}
    const topic=task.input.topic??'Untitled local content';let output;
    switch(task.task_type){
      case 'script_generation':output={script:`Original mock draft about ${topic}. Review before production.`,language:'en'};break;
      case 'title_generation':output={title:topic.slice(0,90)};break;
      case 'caption_generation':output={caption:`${topic} — local review draft.`};break;
      case 'hashtag_generation':output={hashtags:['#SocialStudio','#OriginalStory']};break;
      case 'storyboard_generation':output={scenes:[{id:'hook',intent:'Introduce the approved topic'},{id:'ending',intent:'Resolve the approved story'}]};break;
      case 'content_review':output={review_required:true,findings:['Human review required before publishing.']};break;
    }
    attempts.push({provider,status:'completed',cost:0});return {output,provider,attempts,cost:0,mock:true};
  }
  throw new StudioError('MOCK_PROVIDERS_UNAVAILABLE',503);
}
export const providerHealth=()=>({mock:'available','mock-unavailable':'deterministic_failure',nine_router:'disabled; installation/authentication not approved',codex_cli:'development agent only; not an API provider'});
export class NineRouterBoundary {
  createRequest(task){validateTask(task);return {method:'POST',path:'/v1/chat/completions',body:{model:'operator-configured-only',messages:[{role:'user',content:JSON.stringify(task.input)}],response_format:{type:'json_object'}},enabled:false};}
  async execute(){throw new StudioError('NINE_ROUTER_AUTH_NOT_APPROVED',403);}
}
