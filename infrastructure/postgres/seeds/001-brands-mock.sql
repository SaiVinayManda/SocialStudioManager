BEGIN;
INSERT INTO studio.brands(id,name,slug,content_category,configuration) VALUES
 ('10000000-0000-4000-8000-000000000001','Horror','horror','horror','{"approval_required":true,"language":"en","mode":"mock"}'),
 ('10000000-0000-4000-8000-000000000002','Storytelling','storytelling','storytelling','{"approval_required":true,"mode":"mock"}'),
 ('10000000-0000-4000-8000-000000000003','Motivation','motivation','motivation','{"approval_required":true,"mode":"mock"}'),
 ('10000000-0000-4000-8000-000000000004','Travel','travel','travel','{"approval_required":true,"mode":"mock"}'),
 ('10000000-0000-4000-8000-000000000005','Business Insights','business-insights','business','{"approval_required":true,"mode":"mock"}'),
 ('10000000-0000-4000-8000-000000000006','Company','company','company','{"approval_required":true,"mode":"mock"}')
ON CONFLICT(id) DO NOTHING;
INSERT INTO studio.social_accounts(id,brand_id,platform,account_label,external_account_id,connection_status)
SELECT ('20000000-0000-4000-8000-'||lpad((row_number() OVER(ORDER BY b.slug,p.platform))::text,12,'0'))::uuid,b.id,p.platform,b.name||' / mock '||p.platform,'mock:'||b.slug||':'||p.platform,'mock'
FROM studio.brands b CROSS JOIN (VALUES('youtube'),('instagram'),('facebook')) p(platform)
ON CONFLICT(brand_id,platform,external_account_id) DO NOTHING;
COMMIT;
