// Existing approved native tools; reads the completed pilot without altering it.
import fs from 'node:fs';import path from 'node:path';import {validateVideo} from '../services/production-adapter/media.mjs';
const workspace=process.cwd(),out=path.join(workspace,'docs/test-evidence/milestone-e-local');fs.mkdirSync(out,{recursive:true});
const job={brand_slug:'horror',source_reference:{root_id:'generated',relative_path:'horror/pilot-001/final/horror_pilot_001.mp4'},production_settings:{expected_width:1080,expected_height:1920,min_duration:58,max_duration:62,require_audio:true,subtitle_reference:{root_id:'generated',relative_path:'horror/pilot-001/subtitles/horror_pilot_001.srt'}}};
const report=await validateVideo(job,{workspace,ffmpeg_bin:path.join(workspace,'.runtime/openmontage-pilot/ffmpeg/ffmpeg-9.0.2-essentials_build/bin')});
delete report.logs;report.captured_at_utc=new Date().toISOString();report.test='real-native-existing-pilot-validation';report.n8n_executed=false;report.postgres_executed=false;
fs.writeFileSync(path.join(out,'pilot-validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
