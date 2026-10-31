BEGIN;
SELECT pg_advisory_xact_lock(70630101);
-- Extends only the allowed AI task types. Preserves every existing row/table.
ALTER TABLE studio.ai_tasks DROP CONSTRAINT ai_tasks_task_type_check;
ALTER TABLE studio.ai_tasks ADD CONSTRAINT ai_tasks_task_type_check CHECK(task_type IN ('script_generation','title_generation','caption_generation','hashtag_generation','storyboard_generation','content_review','content_rewriting','content_package','production_package'));
INSERT INTO studio.schema_migrations(version,name,checksum) VALUES(3,'dynamic-production',:'migration_checksum');
COMMIT;
