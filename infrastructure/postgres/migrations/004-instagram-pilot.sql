BEGIN;
SELECT pg_advisory_xact_lock(70630101);
ALTER TABLE studio.publishing_jobs DROP CONSTRAINT publishing_jobs_mode_check;
ALTER TABLE studio.publishing_jobs ADD CONSTRAINT publishing_jobs_mode_check CHECK(mode IN ('mock','instagram_live'));
CREATE TABLE studio.instagram_pilot (
 id text PRIMARY KEY CHECK(id='horror-existing-reel-01'),
 publishing_job_id uuid NOT NULL UNIQUE REFERENCES studio.publishing_jobs(id),
 account_id text NOT NULL CHECK(account_id ~ '^[0-9]+$'),
 caption text NOT NULL CHECK(length(caption)<=2200),
 caption_checksum text NOT NULL CHECK(caption_checksum ~ '^[a-f0-9]{64}$'),
 media_checksum text NOT NULL CHECK(media_checksum='499b3adda87757b164423a77ce5cd3071c5bd5b05cb8f823ac4b85b0736cc335'),
 reviewer_identity text NOT NULL, owner_reference text NOT NULL,
 approved_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 consumed_at timestamptz, container_id text, media_id text, permalink text,
 phase text NOT NULL DEFAULT 'approved' CHECK(phase IN ('approved','creating','uploading','processing','publishing','published','manual_review')),
 last_error text, updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON studio.instagram_pilot TO studio_app;
INSERT INTO studio.schema_migrations(version,name,checksum) VALUES(4,'instagram-pilot',:'migration_checksum');
COMMIT;
