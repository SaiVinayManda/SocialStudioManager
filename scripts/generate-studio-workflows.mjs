// Generates exports only. Importing/publishing them is a separately approved operation.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=process.cwd(),directory=path.join(root,'infrastructure/n8n/workflows');
export const workflowIds=Object.fromEntries(Array.from({length:12},(_,i)=>[i+1,'socialstudio'+String(i+1).padStart(4,'0')]));
const type=x=>'n8n-nodes-base.'+x;
const credential={httpHeaderAuth:{id:'socialstudioauth',name:'Social Studio internal API'}};
function workflow(number,title){return {id:workflowIds[number],name:`Social Studio ${String(number).padStart(2,'0')} - ${title}`,active:false,nodes:[],connections:{},settings:{executionOrder:'v1',timezone:'Europe/Berlin',saveDataErrorExecution:'none',saveDataSuccessExecution:'all',saveManualExecutions:false,...(number!==11?{errorWorkflow:workflowIds[11]}:{})},tags:[],pinData:{}};}
function node(w,name,kind,parameters,version=1){const n={id:crypto.createHash('sha256').update(w.id+name).digest('hex').slice(0,32),name,type:type(kind),typeVersion:version,position:[w.nodes.length*220,0],parameters};w.nodes.push(n);return n;}
function link(w,a,b,output=0){const from=typeof a==='string'?a:a.name,to=typeof b==='string'?b:b.name;const c=w.connections[from]??={main:[]};c.main[output]??=[];c.main[output].push({node:to,type:'main',index:0});}
function api(w,name,route,method='POST',json='={{ {} }}'){
  const n=node(w,name,'httpRequest',{method,url:route.startsWith('=')?route:'http://studio-api:8780'+route,authentication:'genericCredentialType',genericAuthType:'httpHeaderAuth',...(method==='GET'?{}:{sendBody:true,specifyBody:'json',jsonBody:json}),options:{timeout:15000}},4.2);n.credentials=credential;return n;
}
function trigger(w){return node(w,'Subworkflow input','executeWorkflowTrigger',{inputSource:'passthrough'},1.1);}
function call(w,name,number){return node(w,name,'executeWorkflow',{source:'database',workflowId:{__rl:true,value:workflowIds[number],mode:'id'},mode:'each',options:{waitForSubWorkflow:false}},1.2);}
function wait(w,name,seconds){return node(w,name,'wait',{resume:'timeInterval',amount:seconds,unit:'seconds'},1.1);}
function eq(w,name,value,expected){return node(w,name,'if',{conditions:{string:[{value1:value,operation:'equal',value2:expected}]}},1);}
function notify(w,from,event,suffix){const set=node(w,'Notification '+suffix,'set',{keepOnlySet:true,values:{string:[{name:'job_id',value:'={{ $json.job_id || $json.content_job_id }}'},{name:'event_type',value:event},{name:'idempotency_key',value:`={{ '${event}:' + ($json.job_id || $json.content_job_id) + ':' + ($json.id || $json.content_version || '1') }}`}]}},2);link(w,from,set);link(w,set,call(w,'Deliver '+suffix,10));}
const flows=[];
{
  const w=workflow(1,'Content Intake'),entry=node(w,'Signed intake webhook','webhook',{httpMethod:'POST',path:'social-studio/intake',responseMode:'responseNode',options:{}},2);entry.webhookId='socialstudio-intake';
  const verify=api(w,'Verify signed envelope','/webhooks/verify','POST','={{ $json.body }}'),intake=api(w,'Register and deduplicate','/intake','POST','={{ $json.payload }}');
  const respond=node(w,'Acknowledge durable job','respondToWebhook',{respondWith:'json',responseBody:'={{ {job_id: $json.job_id, status: $json.status, deduplicated: $json.deduplicated} }}',options:{responseCode:202}},1.4);
  const ai=eq(w,'AI requested','={{ String($json.production_settings.requires_ai === true) }}','true');
  const queued=eq(w,'Job still queued','={{ $json.status }}','queued');
  link(w,entry,verify);link(w,verify,intake);link(w,intake,respond);link(w,respond,queued);link(w,queued,ai);link(w,ai,call(w,'Prepare AI content',2),0);link(w,ai,call(w,'Start production',3),1);notify(w,intake,'job.accepted','accepted');flows.push(w);
}
{
  const w=workflow(2,'AI Content Preparation'),entry=trigger(w);
  const ai=api(w,'Submit configured AI task','/ai/tasks','POST',`={{ $json.production_settings?.ai_request ? {...$json.production_settings.ai_request,brand_id:$json.brand_id,content_job_id:$json.job_id,idempotency_key:'ai:'+$json.job_id+':v'+$json.content_version,content_version:$json.content_version} : {brand_id:$json.brand_id,job_id:$json.job_id,task_type:'title_generation',input:{topic:$json.topic || 'Local video'},provider_policy:{providers:['mock-unavailable','mock']},maximum_cost:0,timeout_ms:5000} }}`);
  const ok=eq(w,'AI completed','={{ $json.status }}','completed');
  const pending=eq(w,'AI still active','={{ String(["queued","running","retry_wait"].includes($json.status)) }}','true'),pause=wait(w,'Await AI task',1),read=api(w,'Read AI task status',"={{ 'http://studio-api:8780/ai/tasks/' + ($json.task_id || $json.id) }}",'GET');
  const save=api(w,'Store structured result',"={{ 'http://studio-api:8780/jobs/' + $('Subworkflow input').first().json.job_id + '/ai-result' }}",'POST','={{ {task_id:$json.id} }}');
  const render=eq(w,'Video production requested','={{ String($json.source_type !== "ai_only") }}','true');
  const failure=node(w,'AI failure notification','set',{keepOnlySet:true,values:{string:[{name:'job_id',value:"={{ $('Subworkflow input').first().json.job_id }}"},{name:'event_type',value:'production.failed'},{name:'idempotency_key',value:"={{ 'ai.failure:' + $json.id }}"}]}},2);
  link(w,entry,ai);link(w,ai,ok);link(w,ok,pending,1);link(w,pending,pause);link(w,pause,read);link(w,read,ok);link(w,ok,save);link(w,save,render);link(w,render,call(w,'Continue production',3));link(w,pending,failure,1);link(w,failure,call(w,'Report AI failure',10));
  flows.push(w);
}
{
  const w=workflow(3,'OpenMontage Production'),entry=trigger(w),start=api(w,'Queue production','/jobs','POST','={{ {job_id:$json.job_id} }}'),pause=wait(w,'Await native worker',2),status=api(w,'Read production status',"={{ 'http://studio-api:8780/jobs/' + $json.job_id }}",'GET');
  const done=eq(w,'Output produced','={{ $json.status }}','produced'),busy=eq(w,'Still processing','={{ $json.status }}','processing');
  link(w,entry,start);link(w,start,pause);link(w,pause,status);link(w,status,done);link(w,done,call(w,'Validate output',4));link(w,done,busy,1);link(w,busy,pause);
  const failed=eq(w,'Production failed','={{ $json.status }}','failed');link(w,busy,failed,1);notify(w,failed,'production.failed','production-failure');
  flows.push(w);
}
{
  const w=workflow(4,'Media Quality Validation'),entry=trigger(w),quality=api(w,'Enforce worker validation',"={{ 'http://studio-api:8780/jobs/' + $json.job_id + '/quality' }}");link(w,entry,quality);link(w,quality,call(w,'Request review',5));flows.push(w);
}
{
  const w=workflow(5,'Human Approval'),entry=trigger(w),request=api(w,'Create checksum-bound request',"={{ 'http://studio-api:8780/jobs/' + $json.job_id + '/approvals' }}"),pause=wait(w,'Wait for explicit decision',5),read=api(w,'Read approval decision',"={{ 'http://studio-api:8780/approvals/' + $json.id }}",'GET');
  const approved=eq(w,'Explicitly approved','={{ $json.effective_decision }}','approved'),pending=eq(w,'Still pending','={{ $json.effective_decision }}','pending');
  link(w,entry,request);notify(w,request,'preview.ready','preview');notify(w,request,'approval.required','review');link(w,request,pause);link(w,pause,read);link(w,read,approved);link(w,approved,call(w,'Schedule approved content',6));link(w,approved,pending,1);link(w,pending,pause);flows.push(w);
}
{
  const w=workflow(6,'Publishing Scheduler'),entry=trigger(w),clock=node(w,'Scheduled dispatch tick','scheduleTrigger',{rule:{interval:[{field:'seconds',secondsInterval:5}]}},1.2),tick=api(w,'Atomically claim due work','/scheduler/tick','POST','={{ $json.job_id ? {job_id:$json.job_id} : {} }}');
  const work=eq(w,'Work claimed','={{ String($json.idle === false) }}','true'),pause=wait(w,'Await fresh checksum',2),read=api(w,'Read dispatch status',"={{ 'http://studio-api:8780/publishing/' + $json.id }}",'GET'),ready=eq(w,'Fresh media verified','={{ $json.status }}','ready'),verifying=eq(w,'Still verifying','={{ $json.status }}','verifying');
  link(w,entry,tick);link(w,clock,tick);link(w,tick,work);link(w,work,pause);link(w,pause,read);link(w,read,ready);link(w,ready,verifying,1);link(w,verifying,pause);
  let from=ready,branch=0;
  for(const [platform,no]of [['youtube',7],['instagram',8],['facebook',9]]){const check=eq(w,'Destination '+platform,'={{ $json.platform }}',platform);link(w,from,check,branch);link(w,check,call(w,'Dispatch '+platform,no));from=check;branch=1;}
  flows.push(w);
}
for(const [no,platform]of [[7,'youtube'],[8,'instagram'],[9,'facebook']]){
  const w=workflow(no,platform[0].toUpperCase()+platform.slice(1)+' Mock Publishing'),entry=trigger(w),publish=api(w,'Publish mock '+platform,`={{ 'http://studio-api:8780/publishing/' + $json.id + '/publish/${platform}' }}`);link(w,entry,publish);notify(w,publish,'publishing.succeeded',platform);flows.push(w);
  // The Instagram API route retains mock behavior unless an exact one-use pilot
  // approval exists. Allow its bounded upload/processing call to finish.
  if(platform==='instagram')publish.parameters.options.timeout=360000;
}
{
  const w=workflow(10,'Local Notifications'),entry=trigger(w),sink=api(w,'Persist operator notification','/notifications','POST','={{ {job_id:$json.job_id,event_type:$json.event_type,idempotency_key:$json.idempotency_key} }}');link(w,entry,sink);flows.push(w);
}
{
  const w=workflow(11,'Failure Recovery'),errors=node(w,'Workflow error','errorTrigger',{}),clock=node(w,'Recovery tick','scheduleTrigger',{rule:{interval:[{field:'seconds',secondsInterval:30}]}},1.2),manual=trigger(w),recovery=api(w,'Recover durable state','/recovery');link(w,errors,recovery);link(w,clock,recovery);link(w,manual,recovery);flows.push(w);
}
{
  const w=workflow(12,'Reporting'),entry=node(w,'Signed reporting webhook','webhook',{httpMethod:'POST',path:'social-studio/reports',responseMode:'responseNode',options:{}},2);entry.webhookId='socialstudio-reports';
  const verify=api(w,'Verify report request','/webhooks/verify','POST','={{ $json.body }}'),report=api(w,'Read durable report','/reports','GET'),respond=node(w,'Return report','respondToWebhook',{respondWith:'json',responseBody:'={{ $json }}',options:{}},1.4);link(w,entry,verify);link(w,verify,report);link(w,report,respond);flows.push(w);
}
fs.mkdirSync(directory,{recursive:true});for(const w of flows)fs.writeFileSync(path.join(directory,`${w.id.slice(-2)}-${w.name.split(' - ')[1].toLowerCase().replaceAll(' ','-')}.json`),JSON.stringify(w,null,2)+'\n');
console.log(JSON.stringify({exports:flows.length,imported:false,published:false}));
