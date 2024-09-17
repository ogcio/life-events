BEGIN;

-- Drop the unique constraint on the single column provider name
ALTER TABLE email_providers 
DROP CONSTRAINT IF EXISTS email_providers_provider_name_key,
ADD UNIQUE (organisation_id, provider_name);

ALTER TABLE sms_providers 
ADD UNIQUE (organisation_id, provider_name);

COMMIT;