BEGIN;
SELECT pg_advisory_xact_lock(70630101);
-- Additive extension of the applied foundation. Existing v1 mock rows survive.
ALTER TABLE studio.content_jobs DROP CONSTRAINT content_jobs_source_type_check;
ALTER TABLE studio.content_jobs ADD CONSTRAINT content_jobs_source_type_check CHECK(source_type IN ('existing_file','approved_openmontage','ai_only'));
ALTER TABLE studio.ai_tasks DROP CONSTRAINT ai_tasks_task_type_check;
ALTER TABLE studio.ai_tasks ADD CONSTRAINT ai_tasks_task_type_check CHECK(task_type IN ('script_generation','title_generation','caption_generation','hashtag_generation','storyboard_generation','content_review','content_rewriting','content_package'));
ALTER TABLE studio.ai_tasks DROP CONSTRAINT ai_tasks_status_check;
ALTER TABLE studio.ai_tasks ADD CONSTRAINT ai_tasks_status_check CHECK(status IN ('queued','running','retry_wait','completed','failed','cancelled','manual_review'));
ALTER TABLE studio.ai_tasks DROP CONSTRAINT ai_tasks_maximum_cost_check;
ALTER TABLE studio.ai_tasks ADD CONSTRAINT ai_tasks_maximum_cost_check CHECK(maximum_cost BETWEEN 0 AND 10);
ALTER TABLE studio.ai_tasks DROP CONSTRAINT ai_tasks_timeout_ms_check;
ALTER TABLE studio.ai_tasks ADD CONSTRAINT ai_tasks_timeout_ms_check CHECK(timeout_ms BETWEEN 100 AND 300000);
ALTER TABLE studio.ai_tasks
 ADD COLUMN idempotency_key text CHECK(length(idempotency_key) BETWEEN 8 AND 180),
 ADD COLUMN request_checksum text CHECK(request_checksum ~ '^[a-f0-9]{64}$'),
 ADD COLUMN output_schema_version text NOT NULL DEFAULT 'legacy.v1',
 ADD COLUMN content_version integer CHECK(content_version>0),
 ADD COLUMN retry_policy jsonb NOT NULL DEFAULT '{"max_attempts_per_provider":1,"initial_backoff_ms":1000}',
 ADD COLUMN deadline_at timestamptz,
 ADD COLUMN started_at timestamptz,
 ADD COLUMN completed_at timestamptz,
 ADD COLUMN cancel_requested boolean NOT NULL DEFAULT false,
 ADD COLUMN lease_token uuid,
 ADD COLUMN lease_until timestamptz,
 ADD COLUMN provider_used text,
 ADD COLUMN model_used text,
 ADD COLUMN token_usage jsonb,
 ADD COLUMN actual_cost numeric CHECK(actual_cost>=0),
 ADD COLUMN estimated_cost numeric CHECK(estimated_cost>=0),
 ADD COLUMN reserved_cost numeric NOT NULL DEFAULT 0 CHECK(reserved_cost>=0 AND reserved_cost<=maximum_cost),
 ADD COLUMN duration_ms bigint CHECK(duration_ms>=0),
 ADD COLUMN error_category text,
 ADD COLUMN output_checksum text CHECK(output_checksum ~ '^[a-f0-9]{64}$'),
 ADD COLUMN artifact_reference jsonb;
CREATE UNIQUE INDEX ai_task_idempotency ON studio.ai_tasks(brand_id,idempotency_key) WHERE idempotency_key IS NOT NULL;
ALTER TABLE studio.ai_tasks ADD CONSTRAINT ai_task_brand_identity UNIQUE(id,brand_id);
CREATE INDEX ai_task_queue ON studio.ai_tasks(created_at) WHERE status IN ('queued','retry_wait','running');
CREATE TABLE studio.ai_task_attempts (
 id uuid PRIMARY KEY, task_id uuid NOT NULL REFERENCES studio.ai_tasks(id),
 provider text NOT NULL CHECK(provider IN ('codex','agy','9router','mock','mock-unavailable','mock-invalid')),
 model text, attempt_number integer NOT NULL CHECK(attempt_number BETWEEN 1 AND 6),
 status text NOT NULL CHECK(status IN ('running','completed','failed','cancelled','interrupted')),
 error_category text, duration_ms bigint CHECK(duration_ms>=0), token_usage jsonb,
 actual_cost numeric CHECK(actual_cost>=0), estimated_cost numeric CHECK(estimated_cost>=0),
 reserved_cost numeric NOT NULL DEFAULT 0 CHECK(reserved_cost>=0),
 exit_code integer, simulated boolean NOT NULL,
 started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 UNIQUE(task_id,attempt_number), CHECK((status='running')=(completed_at IS NULL))
);
-- Laptop-wide AI concurrency: one active attempt, including both native and mock runners.
CREATE UNIQUE INDEX one_ai_attempt_at_once ON studio.ai_task_attempts((1)) WHERE status='running';
CREATE TABLE studio.ai_provider_health (
 provider text PRIMARY KEY CHECK(provider IN ('codex','agy','9router','mock')),
 status text NOT NULL CHECK(status IN ('available','unavailable','unsupported','approval_required','degraded')),
 last_checked timestamptz NOT NULL DEFAULT now(), last_success timestamptz,last_failure timestamptz,
 error_category text, capability_metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE studio.ai_outputs (
 id uuid PRIMARY KEY, task_id uuid NOT NULL UNIQUE, brand_id uuid NOT NULL,
 content_version integer NOT NULL CHECK(content_version>0), output_schema_version text NOT NULL,
 output_json jsonb NOT NULL CHECK(jsonb_typeof(output_json)='object'),
 checksum text NOT NULL CHECK(checksum ~ '^[a-f0-9]{64}$'), created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(task_id,brand_id) REFERENCES studio.ai_tasks(id,brand_id)
);
GRANT SELECT,INSERT,UPDATE ON studio.ai_task_attempts,studio.ai_provider_health TO studio_app;
GRANT SELECT,INSERT ON studio.ai_outputs TO studio_app;
INSERT INTO studio.ai_provider_health(provider,status,error_category) VALUES
 ('codex','approval_required','credential_policy'),('agy','approval_required','credential_policy'),('9router','approval_required','credential_policy'),('mock','available',NULL);
INSERT INTO studio.schema_migrations(version,name,checksum) VALUES(2,'ai-brain',:'migration_checksum');
COMMIT;
