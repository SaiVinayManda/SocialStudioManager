// Deployed local checks only. No Meta requests, tokens printed, upload or dispatch.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
const root=process.cwd(),env={SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,PATH:process.env.PATH,DOCKER_CONFIG:path.join(root,'.runtime/orchestrator-inspection/docker-empty')};
function docker(args,input){const r=spawnSync('docker',['-H','npipe:////./pipe/dockerDesktopLinuxEngine',...args],{cwd:root,env,input,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576});assert.equal(r.status,0,'Scoped deployed check failed; no raw service diagnostics');return r.stdout.trim();}
const sql=q=>docker(['exec','-i','socialstudio-postgres-1','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d','social_studio','-At'],q);
const tests=[];
const migrations=JSON.parse(sql("SELECT json_agg(t) FROM (SELECT version,name FROM studio.schema_migrations ORDER BY version)t"));assert.deepEqual(migrations.map(x=>[x.version,x.name]),[[1,'foundation'],[2,'ai-brain'],[3,'dynamic-production'],[4,'instagram-pilot']]);tests.push('Existing migrations preserved; Instagram is additive version 004');
assert.equal(sql("SELECT count(*) FROM studio.instagram_pilot"),'0');tests.push('No exact-post approval or consumed live pilot');
assert.equal(sql("SELECT count(*) FROM studio.publishing_jobs WHERE mode='instagram_live'"),'0');tests.push('No live publishing job has been scheduled');
const content=JSON.parse(sql("SELECT row_to_json(t) FROM (SELECT j.id,j.content_metadata->>'caption' AS caption,m.checksum,m.file_reference,m.validation_status,m.duration,m.width,m.height FROM studio.content_jobs j JOIN studio.media_assets m ON m.job_id=j.id AND m.media_type='video' WHERE j.id='ede518d3-e3c3-42b2-9eb9-b4af0965b536')t"));assert.equal(content.checksum,'499b3adda87757b164423a77ce5cd3071c5bd5b05cb8f823ac4b85b0736cc335');assert.equal(content.validation_status,'passed');assert.equal(content.caption,'The Last Message. An original fictional short.');tests.push('Existing validated MP4 and caption match PostgreSQL');
const fixture=`BEGIN;
DO $$
DECLARE source_job studio.content_jobs; asset studio.media_assets; approval_id uuid; pub_id uuid; account_id uuid := gen_random_uuid();
BEGIN
 SELECT * INTO STRICT source_job FROM studio.content_jobs WHERE id='ede518d3-e3c3-42b2-9eb9-b4af0965b536';
 SELECT * INTO STRICT asset FROM studio.media_assets WHERE job_id=source_job.id AND media_type='video';
 SELECT id INTO STRICT approval_id FROM studio.approvals WHERE job_id=source_job.id AND content_checksum=asset.checksum AND content_version=source_job.content_version;
 INSERT INTO studio.social_accounts(id,brand_id,platform,account_label,external_account_id,connection_status,credential_reference) VALUES(account_id,source_job.brand_id,'instagram','OFFLINE_ROLLBACK_FIXTURE','999000111222','connected','fixture-no-token');
 pub_id := gen_random_uuid();
 INSERT INTO studio.publishing_jobs(id,content_job_id,social_account_id,brand_id,approval_id,media_asset_id,approved_checksum,content_version,scheduled_at,idempotency_key,mode) VALUES(pub_id,source_job.id,account_id,source_job.brand_id,approval_id,asset.id,asset.checksum,source_job.content_version,now()+interval '1 day','instagram-rollback-'||pub_id,'instagram_live');
 INSERT INTO studio.instagram_pilot(id,publishing_job_id,account_id,caption,caption_checksum,media_checksum,reviewer_identity,owner_reference,expires_at) VALUES('horror-existing-reel-01',pub_id,'999000111222','OFFLINE FIXTURE',repeat('a',64),asset.checksum,'offline-fixture','NOT AN OWNER APPROVAL; TRANSACTION ROLLED BACK',now()+interval '1 minute');
 BEGIN
  INSERT INTO studio.instagram_pilot SELECT * FROM studio.instagram_pilot;
  RAISE EXCEPTION 'Singleton constraint failed';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
  UPDATE studio.instagram_pilot SET media_checksum=repeat('b',64);
  RAISE EXCEPTION 'Exact media checksum constraint failed';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  UPDATE studio.publishing_jobs SET mode='youtube_live' WHERE id=pub_id;
  RAISE EXCEPTION 'Other platform live mode unexpectedly allowed';
 EXCEPTION WHEN check_violation THEN NULL; END;
 IF NOT has_table_privilege('studio_app','studio.instagram_pilot','SELECT,INSERT,UPDATE') THEN RAISE EXCEPTION 'Application table grants missing'; END IF;
END $$;
ROLLBACK;`;
sql(fixture);assert.equal(sql('SELECT count(*) FROM studio.instagram_pilot'),'0');assert.equal(sql("SELECT count(*) FROM studio.publishing_jobs WHERE mode='instagram_live'"),'0');tests.push('Rollback fixture: one-use grant, exact video digest, live-mode restriction and application grants');
const apiScript=`import fs from 'node:fs';const key=fs.readFileSync(process.env.CONTROL_TOKEN_FILE,'utf8').trim();const a=await fetch('http://127.0.0.1:8780/instagram/preview');const b=await fetch('http://127.0.0.1:8780/instagram/preview',{headers:{authorization:'Bearer '+key}});console.log(JSON.stringify({unauthenticated:a.status,authenticated:b.status,result:await b.json()}));`;
const api=JSON.parse(docker(['exec','-i','socialstudio-studio-api-1','node','--input-type=module'],apiScript));assert.equal(api.unauthenticated,401);assert.equal(api.authenticated,503);assert.equal(api.result.error.code,'INSTAGRAM_NOT_CONFIGURED');tests.push('Unauthenticated API refused; live configuration remains disabled until OAuth');
const workflow=JSON.parse(docker(['exec','socialstudio-postgres-1','psql','-v','ON_ERROR_STOP=1','-U','studio_bootstrap','-d','n8n_internal','-At','-c',`SELECT nodes::text FROM n8n.workflow_entity WHERE id='socialstudio0008'`]));const node=workflow.find(x=>x.type==='n8n-nodes-base.httpRequest');assert.equal(node.parameters.options.timeout,360000);assert.equal(node.retryOnFail,undefined);tests.push('Deployed workflow 08 retains internal authenticated route and no retry-on-fail');
const report={at:new Date().toISOString(),passed:true,checks:tests,content,live_configuration_enabled:false,oauth_complete:false,meta_requests:0,uploads:0,publications:0,fixture_rolled_back:true};
const directory=path.join(root,'docs/test-evidence/instagram-pilot');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'deployed-setup-'+report.at.replaceAll(/[:.]/g,'-')+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
