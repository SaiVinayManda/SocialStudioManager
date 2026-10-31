// Repair only the exact newly generated source receipt; never reads credentials.
import fs from 'node:fs';import path from 'node:path';
import {redactStaticSource} from './e4-source-redaction.mjs';
const file=path.join(process.cwd(),'docs/test-evidence/milestone-e4/connections/installed-routing-source.json');
const r=JSON.parse(fs.readFileSync(file,'utf8'));let changed=0;
for(const entry of r.records){const text=entry.excerpt;entry.excerpt=redactStaticSource(text);if(entry.excerpt!==text)changed++;}
r.static_oauth_constant_redacted=true;r.live_account_tokens_read=false;
fs.writeFileSync(file,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({sanitized:true,records_redacted:changed,account_tokens_accessed:false}));
