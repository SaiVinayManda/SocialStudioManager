BEGIN;
SELECT pg_advisory_xact_lock(70630101);
CREATE TABLE IF NOT EXISTS studio.schema_migrations (
  version integer PRIMARY KEY, name text NOT NULL, checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE studio.brands (
  id uuid PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE CHECK(slug ~ '^[a-z][a-z0-9-]{1,47}$'),
  content_category text NOT NULL, default_language text NOT NULL DEFAULT 'en',
  configuration jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(configuration)='object'),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE studio.social_accounts (
  id uuid PRIMARY KEY, brand_id uuid NOT NULL REFERENCES studio.brands(id),
  platform text NOT NULL CHECK(platform IN ('youtube','instagram','facebook')), account_label text NOT NULL,
  external_account_id text NOT NULL, connection_status text NOT NULL CHECK(connection_status IN ('mock','disconnected','connected','expired')),
  credential_reference text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id,brand_id), UNIQUE(brand_id,platform,external_account_id),
  CHECK(connection_status <> 'mock' OR (external_account_id LIKE 'mock:%' AND credential_reference IS NULL))
);
CREATE TABLE studio.content_jobs (
  id uuid PRIMARY KEY, brand_id uuid NOT NULL REFERENCES studio.brands(id),
  source_type text NOT NULL CHECK(source_type IN ('existing_file','approved_openmontage')),
  source_reference jsonb NOT NULL CHECK(jsonb_typeof(source_reference)='object'), topic text,
  script_reference jsonb, production_settings jsonb NOT NULL DEFAULT '{}', content_metadata jsonb NOT NULL DEFAULT '{}',
  content_version integer NOT NULL DEFAULT 1 CHECK(content_version>0),
  status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','produced','validated','awaiting_approval','approved','rejected','scheduled','published','failed','cancelled','manual_review')),
  idempotency_key text NOT NULL CHECK(length(idempotency_key) BETWEEN 8 AND 180), source_fingerprint text NOT NULL CHECK(source_fingerprint ~ '^[a-f0-9]{64}$'), request_checksum text NOT NULL CHECK(request_checksum ~ '^[a-f0-9]{64}$'),
  retry_count integer NOT NULL DEFAULT 0 CHECK(retry_count BETWEEN 0 AND 3), error_details jsonb,
  engine_job_id text, production_seconds double precision CHECK(production_seconds>=0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id,brand_id), UNIQUE(brand_id,idempotency_key), UNIQUE(brand_id,source_fingerprint)
);
CREATE TABLE studio.media_assets (
  id uuid PRIMARY KEY, job_id uuid NOT NULL, brand_id uuid NOT NULL,
  file_reference jsonb NOT NULL, media_type text NOT NULL CHECK(media_type IN ('video','audio','subtitle','image')),
  checksum text NOT NULL CHECK(checksum ~ '^[a-f0-9]{64}$'), duration double precision CHECK(duration>0),
  width integer CHECK(width>0), height integer CHECK(height>0), byte_size bigint CHECK(byte_size>0),
  licence_metadata jsonb NOT NULL DEFAULT '{}', validation_report jsonb NOT NULL,
  validation_status text NOT NULL CHECK(validation_status IN ('passed','failed','changed','missing')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(job_id,brand_id) REFERENCES studio.content_jobs(id,brand_id),
  UNIQUE(job_id,media_type), UNIQUE(id,job_id,brand_id)
);
CREATE TABLE studio.approvals (
  id uuid PRIMARY KEY, job_id uuid NOT NULL, brand_id uuid NOT NULL,
  content_checksum text NOT NULL CHECK(content_checksum ~ '^[a-f0-9]{64}$'), content_version integer NOT NULL CHECK(content_version>0),
  reviewer_identity text, decision text NOT NULL DEFAULT 'pending' CHECK(decision IN ('pending','approved','rejected')),
  decision_timestamp timestamptz, comments text CHECK(length(comments)<=2000),
  expires_at timestamptz NOT NULL, invalidated_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(job_id,brand_id) REFERENCES studio.content_jobs(id,brand_id),
  UNIQUE(job_id,content_checksum,content_version),
  UNIQUE(id,job_id,brand_id),
  CHECK((decision='pending' AND decision_timestamp IS NULL AND reviewer_identity IS NULL) OR (decision<>'pending' AND decision_timestamp IS NOT NULL AND reviewer_identity IS NOT NULL))
);
CREATE TABLE studio.publishing_jobs (
  id uuid PRIMARY KEY, content_job_id uuid NOT NULL, social_account_id uuid NOT NULL, brand_id uuid NOT NULL,
  approval_id uuid NOT NULL, media_asset_id uuid NOT NULL,
  approved_checksum text NOT NULL CHECK(approved_checksum ~ '^[a-f0-9]{64}$'), content_version integer NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','verifying','ready','dispatching','published','retry_wait','failed','cancelled','outcome_unknown','manual_review')),
  idempotency_key text NOT NULL UNIQUE, platform_post_id text,
  attempt_count integer NOT NULL DEFAULT 0 CHECK(attempt_count BETWEEN 0 AND 3), last_error jsonb,
  lease_token uuid, lease_until timestamptz, verified_checksum text, verified_at timestamptz,
  next_attempt_at timestamptz, mode text NOT NULL DEFAULT 'mock' CHECK(mode='mock'),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(content_job_id,brand_id) REFERENCES studio.content_jobs(id,brand_id),
  FOREIGN KEY(social_account_id,brand_id) REFERENCES studio.social_accounts(id,brand_id),
  FOREIGN KEY(media_asset_id,content_job_id,brand_id) REFERENCES studio.media_assets(id,job_id,brand_id),
  FOREIGN KEY(approval_id,content_job_id,brand_id) REFERENCES studio.approvals(id,job_id,brand_id),
  UNIQUE(id,content_job_id),
  UNIQUE(content_job_id,social_account_id,content_version)
);
CREATE INDEX publishing_due ON studio.publishing_jobs(scheduled_at,next_attempt_at) WHERE status IN ('scheduled','retry_wait');
CREATE TABLE studio.job_events (
  id bigserial PRIMARY KEY, job_id uuid REFERENCES studio.content_jobs(id), event_type text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
  event_key text UNIQUE
);
CREATE INDEX events_by_job ON studio.job_events(job_id,id);
CREATE TABLE studio.production_tasks (
  id uuid PRIMARY KEY, job_id uuid NOT NULL REFERENCES studio.content_jobs(id), publishing_job_id uuid,
  kind text NOT NULL CHECK(kind IN ('validate','render','verify_publish')),
  status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','completed','failed','cancelled','interrupted')),
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3), lease_token uuid, lease_until timestamptz,
  result jsonb, bounded_logs text CHECK(length(bounded_logs)<=65536), cancel_requested boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id,kind,publishing_job_id), FOREIGN KEY(publishing_job_id,job_id) REFERENCES studio.publishing_jobs(id,content_job_id)
);
CREATE UNIQUE INDEX one_initial_task ON studio.production_tasks(job_id,kind) WHERE publishing_job_id IS NULL;
CREATE UNIQUE INDEX one_render_at_once ON studio.production_tasks(kind) WHERE kind='render' AND status='running';
CREATE TABLE studio.ai_tasks (
  id uuid PRIMARY KEY, brand_id uuid NOT NULL, job_id uuid NOT NULL,
  task_type text NOT NULL CHECK(task_type IN ('script_generation','title_generation','caption_generation','hashtag_generation','storyboard_generation','content_review')),
  input jsonb NOT NULL, provider_policy jsonb NOT NULL,
  maximum_cost numeric NOT NULL CHECK(maximum_cost=0), timeout_ms integer NOT NULL CHECK(timeout_ms BETWEEN 100 AND 120000),
  status text NOT NULL CHECK(status IN ('queued','completed','failed')), output jsonb, error_details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(job_id,brand_id) REFERENCES studio.content_jobs(id,brand_id)
);
CREATE TABLE studio.notifications (
  id uuid PRIMARY KEY, job_id uuid REFERENCES studio.content_jobs(id), event_type text NOT NULL,
  payload jsonb NOT NULL, idempotency_key text NOT NULL UNIQUE, delivered_at timestamptz NOT NULL DEFAULT now(), sink text NOT NULL DEFAULT 'local' CHECK(sink='local')
);
CREATE TABLE studio.mock_receipts (
  idempotency_key text PRIMARY KEY, platform text NOT NULL, post_id text NOT NULL, receipt jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE studio.webhook_receipts (
  nonce uuid PRIMARY KEY, body_checksum text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION studio.touch_updated() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN NEW.updated_at=now(); RETURN NEW; END$$;
DO $$DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['brands','social_accounts','content_jobs','media_assets','publishing_jobs','production_tasks','ai_tasks'] LOOP
  EXECUTE format('CREATE TRIGGER touch_row BEFORE UPDATE ON studio.%I FOR EACH ROW EXECUTE FUNCTION studio.touch_updated()',t);
 END LOOP;
END$$;
CREATE FUNCTION studio.invalidate_media_approvals() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.checksum IS DISTINCT FROM OLD.checksum OR NEW.validation_status <> 'passed' THEN
  UPDATE studio.approvals SET invalidated_at=now() WHERE job_id=NEW.job_id AND invalidated_at IS NULL;
  UPDATE studio.publishing_jobs SET status='manual_review',last_error='{"code":"MEDIA_CHANGED_OR_MISSING"}' WHERE content_job_id=NEW.job_id AND status NOT IN ('published','cancelled','failed');
  INSERT INTO studio.job_events(job_id,event_type,event_payload) VALUES(NEW.job_id,'approval.invalidated',jsonb_build_object('reason','media_changed_or_missing'));
 END IF;
 RETURN NEW;
END$$;
CREATE TRIGGER media_approval_guard AFTER UPDATE ON studio.media_assets FOR EACH ROW EXECUTE FUNCTION studio.invalidate_media_approvals();
CREATE FUNCTION studio.invalidate_version_approvals() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.content_version IS DISTINCT FROM OLD.content_version THEN
  UPDATE studio.approvals SET invalidated_at=now() WHERE job_id=NEW.id AND invalidated_at IS NULL;
  UPDATE studio.publishing_jobs SET status='manual_review',last_error='{"code":"CONTENT_VERSION_CHANGED"}' WHERE content_job_id=NEW.id AND status NOT IN ('published','cancelled','failed');
 END IF;
 RETURN NEW;
END$$;
CREATE TRIGGER version_approval_guard AFTER UPDATE ON studio.content_jobs FOR EACH ROW EXECUTE FUNCTION studio.invalidate_version_approvals();
GRANT USAGE ON SCHEMA studio TO studio_app;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA studio TO studio_app;
REVOKE UPDATE ON studio.job_events,studio.schema_migrations,studio.mock_receipts,studio.webhook_receipts FROM studio_app;
REVOKE INSERT ON studio.schema_migrations FROM studio_app;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA studio TO studio_app;
INSERT INTO studio.schema_migrations(version,name,checksum) VALUES(1,'foundation',:'migration_checksum');
COMMIT;
