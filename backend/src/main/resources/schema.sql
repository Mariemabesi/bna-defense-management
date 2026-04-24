ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_check;
ALTER TABLE audiences ALTER COLUMN date_audience DROP NOT NULL;
ALTER TABLE audiences DROP CONSTRAINT IF EXISTS audiences_statut_check;
