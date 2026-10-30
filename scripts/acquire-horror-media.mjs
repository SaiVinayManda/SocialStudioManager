// B-PILOT-MEDIA-01: anonymous, bounded public media acquisition; no cookies/auth.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(), job=path.join(root,'generated-videos','horror','pilot-001'), assets=path.join(job,'assets');
const approval=JSON.parse(fs.readFileSync(path.join(job,'logs','media-approval.json'),'utf8'));
if(approval.approval_id!=='B-PILOT-MEDIA-01'||!approval.received_before_expiry)throw Error('Approval missing');
const sessionFile=path.join(job,'logs','media-acquisition-session.json');
if(!fs.existsSync(sessionFile))fs.writeFileSync(sessionFile,JSON.stringify({started_utc:'2026-10-30T17:32:20Z',deadline_utc:'2026-10-30T17:52:20Z',max_bytes:209715200,max_clips:8}),{flag:'wx'});
let session=JSON.parse(fs.readFileSync(sessionFile,'utf8'));
const continuing=process.argv[3]==='--continuation=B-PILOT-MEDIA-CONTINUE-01';
if(continuing){
 const grant=JSON.parse(fs.readFileSync(path.join(job,'logs','media-continuation-approval.json'),'utf8'));
 const digest=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'docs','HORROR_PILOT_MEDIA_CONTINUATION.md'))).digest('hex');
 if(grant.approval_id!=='B-PILOT-MEDIA-CONTINUE-01'||grant.packet_sha256!==digest||grant.owner_message!=='approve B-PILOT-MEDIA-CONTINUE-01'||!grant.received_before_expiry)throw Error('Continuation grant mismatch');
 const continuationFile=path.join(job,'logs','media-continuation-session.json');
 if(!fs.existsSync(continuationFile)){const now=Date.now();fs.writeFileSync(continuationFile,JSON.stringify({...session,started_utc:new Date(now).toISOString(),deadline_utc:new Date(now+20*60000).toISOString(),previous_video_bytes:191766238,max_additional_bytes:17*1024*1024}),{flag:'wx'});}
 session=JSON.parse(fs.readFileSync(continuationFile,'utf8'));
 session.max_bytes=Math.min(session.max_bytes,session.previous_video_bytes+session.max_additional_bytes);
}
const metadataDir=path.join(assets,'provenance');fs.mkdirSync(metadataDir,{recursive:true});
const allowed=new Set(['mixkit.co','assets.mixkit.co','videos.mixkit.co']);
function guard(url){const u=new URL(url);if(u.protocol!=='https:'||!allowed.has(u.hostname)||u.username||u.password)throw Error('Unapproved URL');if(Date.now()>Date.parse(session.deadline_utc))throw Error('Acquisition window expired');}
async function get(url){for(let i=0;i<5;i++){guard(url);const r=await fetch(url,{redirect:'manual',headers:{'User-Agent':'SocialStudio-OpenMontage-Evaluation/1.0'},signal:AbortSignal.timeout(45000)});if(r.status>=300&&r.status<400){url=new URL(r.headers.get('location'),url).href;continue;}if(!r.ok)throw Error('HTTP '+r.status);return {r,url};}throw Error('Redirect limit');}
async function getVideo(url,id){
 let result=await get(url);
 if((result.r.headers.get('content-type')||'').includes('text/html')){
  const modal=await result.r.text();
  const modalPath=path.join(metadataDir,id+'-download-modal.html');
  if(!fs.existsSync(modalPath))fs.writeFileSync(modalPath,modal,{flag:'wx'});
  const published=modal.match(/data-download--modal-url-value="([^"]+)"/)?.[1];
  if(!published)throw Error('No published media URL');
  result=await get(published);
 }
 if(!(result.r.headers.get('content-type')||'').includes('video/'))throw Error('Non-video response');
 return result;
}
const request=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(continuing&&(request.action!=='download'||request.items.some(x=>!['https://assets.mixkit.co/videos/3111/3111-720.mp4','https://assets.mixkit.co/videos/3094/3094-720.mp4','https://assets.mixkit.co/videos/3978/3978-720.mp4'].includes(x.download_url))))throw Error('Continuation scope mismatch');
if(request.action==='metadata'){
 for(const item of request.items){const file=path.join(metadataDir,item.id+'.html');if(fs.existsSync(file)){console.log(JSON.stringify({id:item.id,exists:true}));continue;}const {r,url}=await get(item.url);const text=await r.text();if(Buffer.byteLength(text)>3*1024*1024)throw Error('Metadata too large');fs.writeFileSync(file,text,{flag:'wx'});console.log(JSON.stringify({id:item.id,url,bytes:Buffer.byteLength(text),title:text.match(/<title>([\s\S]*?)<\/title>/i)?.[1],license_markers:[...new Set(text.match(/(?:videoFree|videoRestricted|Mixkit Stock Video Free License|Mixkit Restricted License)/g))],media:[...new Set((text.match(/https:\/\/(?:assets|videos)\.mixkit\.co\/[^\s"'<>]+/g)||[]).filter(x=>/\.mp4/.test(x)))].slice(0,15)}));}
}else if(request.action==='download'){
 const manifestFile=path.join(assets,'source-downloads.json');let entries=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):[];
 for(const item of request.items){if(entries.some(x=>x.id===item.id)){console.log(JSON.stringify({id:item.id,already_verified:true}));continue;}if(entries.length>=8)throw Error('Clip cap');const html=fs.readFileSync(path.join(metadataDir,item.id+'.html'),'utf8');if(!html.includes('videoFree')||html.includes('videoRestricted'))throw Error('Item commercial licence not established');const downloadPath=new URL(item.download_url).pathname+new URL(item.download_url).search; if(!html.includes(item.download_url)&&!html.includes(downloadPath.replaceAll('&','&amp;')))throw Error('Media URL not present on item page');const target=path.join(assets,item.id+'.mp4');if(fs.existsSync(target))throw Error('Existing asset preserved');let used=entries.reduce((s,x)=>s+x.bytes,0);const {r,url}=await getVideo(item.download_url,item.id);const expected=Number(r.headers.get('content-length'));if(expected&&expected+used>session.max_bytes)throw Error('Payload cap');const fd=fs.openSync(target,'wx');const hash=crypto.createHash('sha256');let bytes=0;try{for await(const chunk of r.body){guard(url);bytes+=chunk.length;if(bytes+used>session.max_bytes)throw Error('Payload cap');fs.writeSync(fd,chunk);hash.update(chunk);}}finally{fs.closeSync(fd);}if(expected&&bytes!==expected)throw Error('Truncated media');const entry={...item,path:target,final_url:url,bytes,sha256:hash.digest('hex'),downloaded_at_utc:new Date().toISOString(),license:'Mixkit Stock Video Free License',license_url:'https://mixkit.co/license/modal/videoFree/',creator:'Mixkit contributor (individual not identified on item page)',quarantine:true};entries.push(entry);fs.writeFileSync(manifestFile,JSON.stringify(entries,null,2));console.log(JSON.stringify(entry));}
}else throw Error('Unsupported acquisition action');
