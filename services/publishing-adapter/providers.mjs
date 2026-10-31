import {demand,hash,StudioError} from '../studio-runtime/contracts.mjs';
export const platforms=['youtube','instagram','facebook'];
export function validateDestination(destination,brandId){
  demand(destination&&platforms.includes(destination.platform),'INVALID_DESTINATION');
  demand(destination.brand_id===brandId,'DESTINATION_BRAND_MISMATCH',403);
  demand(destination.connection_status==='mock'&&destination.external_account_id?.startsWith('mock:'),'LIVE_PUBLISHING_NOT_APPROVED',403);
  return true;
}
class MockPlatform {
  constructor(platform){this.platform=platform;}
  validateDestination(d,brandId){return validateDestination(d,brandId);}
  async publish(job,destination){
    this.validateDestination(destination,job.brand_id);demand(job.mode==='mock','LIVE_PUBLISHING_NOT_APPROVED',403);
    const base='mock-'+this.platform+'-'+hash(job.idempotency_key).slice(0,24);
    const stages=this.platform==='instagram'?['container_created','processing_finished','published']:this.platform==='facebook'?['upload_started','transfer_completed','published']:['resumable_session_created','upload_completed','published'];
    return {platform:this.platform,post_id:base,status:'published',stages,url:null,publicly_published:false,charges_usd:0};
  }
  async getStatus(receipt){return {status:receipt?'published':'unknown',post_id:receipt?.post_id??null};}
  async reconcile(receipt){return receipt?{status:'published',receipt}:{status:'manual_review',reason:'UNKNOWN_OUTCOME_DO_NOT_REUPLOAD'};}
}
export const adapters=Object.fromEntries(platforms.map(p=>[p,new MockPlatform(p)]));
export function liveAdapter(){throw new StudioError('LIVE_PUBLISHING_NOT_APPROVED',403);}
