// Secret-free templates only; preserve every existing profile.
import fs from 'node:fs';import path from 'node:path';
import {brandSlugs,brandProfile} from '../services/ai-agent-manager/prompts.mjs';
import {outputSchemas} from '../services/ai-agent-manager/schemas.mjs';
const root=process.cwd();let created=0,preserved=0;
for(const slug of brandSlugs){const dir=path.join(root,'brands',slug,'config');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'ai.json');if(fs.existsSync(file)){preserved++;continue;}fs.writeFileSync(file,JSON.stringify(brandProfile(slug),null,2)+'\n',{flag:'wx'});created++;}
const dir=path.join(root,'services/ai-agent-manager/schemas');fs.mkdirSync(dir,{recursive:true});
for(const [type,schema]of Object.entries(outputSchemas))fs.writeFileSync(path.join(dir,type+'.schema.json'),JSON.stringify(schema,null,2)+'\n');
console.log(JSON.stringify({brand_profiles_created:created,brand_profiles_preserved:preserved,schemas:Object.keys(outputSchemas).length,credentials_accessed:false}));
