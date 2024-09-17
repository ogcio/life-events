BEGIN;

ALTER TABLE email_providers 
DROP CONSTRAINT IF EXISTS email_providers_organisation_id_provider_name_key1;

ALTER TABLE sms_providers 
DROP CONSTRAINT IF EXISTS sms_providers_organisation_id_provider_name_key1;

COMMIT;