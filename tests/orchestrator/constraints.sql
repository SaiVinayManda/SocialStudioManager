-- Run only against the NEW approved Social Studio database. All fixture writes roll back.
BEGIN;
SET LOCAL ROLE studio_app;
DO $$
DECLARE j uuid := gen_random_uuid(); a uuid := gen_random_uuid(); caught boolean;
BEGIN
 INSERT INTO studio.content_jobs(id,brand_id,source_type,source_reference,idempotency_key,source_fingerprint,request_checksum)
 VALUES(j,'10000000-0000-4000-8000-000000000001','existing_file','{}','sql-fixture-'||j,repeat('a',64),repeat('b',64));
 caught:=false;
 BEGIN
  INSERT INTO studio.media_assets(id,job_id,brand_id,file_reference,media_type,checksum,validation_report,validation_status)
  VALUES(gen_random_uuid(),j,'10000000-0000-4000-8000-000000000002','{}','video',repeat('a',64),'{}','passed');
 EXCEPTION WHEN foreign_key_violation THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Cross-brand media accepted'; END IF;
 caught:=false;BEGIN UPDATE studio.content_jobs SET status='invented-success' WHERE id=j;EXCEPTION WHEN check_violation THEN caught:=true;END;
 IF NOT caught THEN RAISE EXCEPTION 'Invalid status accepted';END IF;
 caught:=false;BEGIN INSERT INTO studio.schema_migrations(version,name,checksum) VALUES(999,'forgery','bad');EXCEPTION WHEN insufficient_privilege THEN caught:=true;END;
 IF NOT caught THEN RAISE EXCEPTION 'App can forge migration history';END IF;
 INSERT INTO studio.media_assets(id,job_id,brand_id,file_reference,media_type,checksum,validation_report,validation_status)
 VALUES(gen_random_uuid(),j,'10000000-0000-4000-8000-000000000001','{}','video',repeat('a',64),'{}','passed');
 INSERT INTO studio.approvals(id,job_id,brand_id,content_checksum,content_version,expires_at)
 VALUES(a,j,'10000000-0000-4000-8000-000000000001',repeat('a',64),1,now()+interval '1 hour');
 UPDATE studio.media_assets SET checksum=repeat('c',64) WHERE job_id=j;
 IF NOT EXISTS(SELECT 1 FROM studio.approvals WHERE id=a AND invalidated_at IS NOT NULL) THEN RAISE EXCEPTION 'Changed checksum did not invalidate approval';END IF;
 RAISE NOTICE 'Four real SQL constraint/permission/invalidation assertions passed (fixture transaction rolled back).';
END$$;
ROLLBACK;
