// Local operator commands; keys stay in the approved protected files, never argv.
import path from 'node:path';import {fileURLToPath} from 'node:url';import {control} from './studio-test-client.mjs';import {demand,uuid,checksum} from '../services/studio-runtime/contracts.mjs';
export async function operate(args){const [operation,id,digest,version]=args;
  if(operation==='status')return {mode:'mock',...(await control('/reports'))};
  if(operation==='brands')return control('/brands');
  if(operation==='queue'){if(id)demand(uuid(id),'INVALID_BRAND');return control('/jobs'+(id?'?brand_id='+id:''));}
  if(operation==='review'){demand(uuid(id),'INVALID_JOB_ID');return {output:await control('/jobs/'+id+'/output'),...(await control('/approvals?job_id='+id))};}
  if(operation==='logs'){demand(uuid(id),'INVALID_JOB_ID');return control('/jobs/'+id+'/logs');}
  if(operation==='cancel'){demand(uuid(id),'INVALID_JOB_ID');return control('/jobs/'+id+'/cancel',{method:'POST',body:{}});}
  if(['approve','reject'].includes(operation)){demand(uuid(id)&&checksum(digest)&&Number.isInteger(Number(version))&&Number(version)>0,'EXACT_APPROVAL_CHECKSUM_VERSION_REQUIRED');return control('/approvals/'+id+'/decision',{method:'POST',body:{decision:operation==='approve'?'approved':'rejected',checksum:digest,content_version:Number(version),comments:'Explicit authenticated local operator decision; platform mode remains mock.'}});}
  throw Error('Use status, brands, queue [brand UUID], review/logs/cancel <job UUID>, approve/reject <approval UUID> <SHA256> <version>.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))operate(process.argv.slice(2)).then(x=>console.log(JSON.stringify(x,null,2))).catch(e=>{console.error(JSON.stringify({error:e.code??e.message}));process.exitCode=1;});
