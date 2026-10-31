// Static installed program text only. Never imports/executes 9Router modules or
// reads its account database/configuration/authentication files.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {redactStaticSource} from './e4-source-redaction.mjs';
const base='C:/Users/Vinay/AppData/Roaming/npm/node_modules/9router/app/.next-cli-build/server/chunks';
const needles=['allow_fallbacks','max_price','requireApiKey','cloudcode-pa.googleapis.com','id:"antigravity"','providerPreferences','isActive:!0','isActive===','response_format','delete a.provider','delete b.provider'];
const records=[];for(const file of fs.readdirSync(base).filter(f=>/^\d+\.js$/.test(f))){const bytes=fs.readFileSync(path.join(base,file)),source=bytes.toString('utf8');for(const needle of needles){const at=source.indexOf(needle);if(at<0)continue;records.push({file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),needle,offset:at,excerpt:redactStaticSource(source.slice(Math.max(0,at-240),at+900))});}}
const dir=path.join(process.cwd(),'docs/test-evidence/milestone-e4/connections'),file=path.join(dir,'installed-routing-source.json');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(file,JSON.stringify({at:new Date().toISOString(),static_source_only:true,model_calls:0,credential_access:false,records},null,2)+'\n');console.log(JSON.stringify({file,matches:records.length,records:records.filter(r=>!['response_format','isActive:!0'].includes(r.needle)).slice(0,14)}));
