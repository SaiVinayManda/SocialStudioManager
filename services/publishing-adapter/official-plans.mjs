// Credential-free operation plans. No network executor is enabled by these plans.
import {demand,StudioError} from '../studio-runtime/contracts.mjs';
export function youtubePlan({title,description='',tags=[],bytes,scheduled_at}){
  demand(typeof title==='string'&&title.length>0&&title.length<=100&&typeof description==='string'&&description.length<=5000&&Array.isArray(tags),'INVALID_YOUTUBE_METADATA');demand(Number.isSafeInteger(bytes)&&bytes>0,'INVALID_MEDIA_SIZE');
  if(scheduled_at)demand(Date.parse(scheduled_at)>Date.now(),'YOUTUBE_FUTURE_SCHEDULE_REQUIRED');
  return {enabled:false,scope:'https://www.googleapis.com/auth/youtube.upload',steps:[
    {operation:'start_resumable_upload',method:'POST',url:'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',headers:{'X-Upload-Content-Type':'video/mp4','X-Upload-Content-Length':String(bytes)},body:{snippet:{title,description,tags},status:{privacyStatus:'private',...(scheduled_at?{publishAt:scheduled_at}:{})}}},
    {operation:'upload_to_validated_session',method:'PUT',uri_reference:'persisted_response_location',preserve_session:true},
    {operation:'reconcile_before_retry',method:'PUT',content_range:'bytes */'+bytes},
    {operation:'poll_video_processing',method:'GET',path:'/youtube/v3/videos',query:{part:'status,processingDetails',id_reference:'persisted_video_id'}}],requires:['separate OAuth grant','exact per-post operator approval','new network-egress deployment review']};
}
export function instagramPlan({account_id,api_version,caption='',media_url}){
  demand(/^\d+$/.test(account_id)&&/^v\d+\.\d+$/.test(api_version),'VERIFIED_INSTAGRAM_CONFIGURATION_REQUIRED');const url=new URL(media_url);demand(url.protocol==='https:'&&!url.username&&!url.password,'APPROVED_PUBLIC_MEDIA_HOST_REQUIRED');demand(typeof caption==='string'&&caption.length<=2200,'INVALID_INSTAGRAM_CAPTION');
  return {enabled:false,login_mode:'Facebook Login; Professional account linked to Page',steps:[
    {operation:'create_reel_container',method:'POST',url:`https://graph.facebook.com/${api_version}/${account_id}/media`,body:{media_type:'REELS',video_url:media_url,caption}},
    {operation:'poll_container',method:'GET',path:'/{container_id}',query:{fields:'status_code,status'},required_state:'FINISHED'},
    {operation:'publish_container',method:'POST',path:`/${account_id}/media_publish`,body:{creation_id_reference:'persisted_container_id'}},
    {operation:'record_media_id',reconcile_before_retry:true}],requires:['version-specific Meta documentation recheck','separate OAuth/app-review grant','approved media-host exposure','exact per-post approval']};
}
export function facebookPlan({page_id,api_version}){
  demand(/^\d+$/.test(page_id)&&/^v\d+\.\d+$/.test(api_version),'VERIFIED_FACEBOOK_CONFIGURATION_REQUIRED');
  return {enabled:false,transport_verified:false,steps:[{operation:'start_page_reel_upload',method:'POST',path:`/${page_id}/video_reels`,upload_phase:'start'},{operation:'transfer_binary_to_validated_official_upload_uri',method:'POST',uri_reference:'persisted_upload_url'},{operation:'finish_page_reel',method:'POST',path:`/${page_id}/video_reels`,upload_phase:'finish'},{operation:'poll_processing_and_record_ids'}],requires:['recheck current official Video/Reels API (documentation fetch returned HTTP 429)','Page task/permission verification','separate OAuth and live-post grants']};
}
export async function executeOfficialPlan(){throw new StudioError('OFFICIAL_TRANSPORT_NOT_ENABLED',403);}
