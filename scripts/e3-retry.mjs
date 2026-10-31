// Preserves failed files and job evidence; changes only the idempotency key for
// a bounded new attempt of one of the three owner-requested acceptance cases.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {root,sessionFile,control,save} from './e3-common.mjs';
const key=process.argv.find(a=>a.startsWith('--case='))?.slice(7),run=JSON.parse(fs.readFileSync(sessionFile,'utf8')),c=run.cases.find(c=>c.key===key);assert(c&&c.attempt<3);
const file=path.join(root,'docs/test-evidence/milestone-e3',run.id,`${key}-attempt-${c.attempt}.json`),record=JSON.parse(fs.readFileSync(file,'utf8')),job=await control('/jobs/'+record.job_id);assert(['failed','rejected','manual_review'].includes(job.status),'Cannot create replacement for active/successful job');
c.attempt++;save(sessionFile,run);console.log(JSON.stringify({case:key,next_attempt:c.attempt,prior_job:job.id,prior_output_preserved:true}));
