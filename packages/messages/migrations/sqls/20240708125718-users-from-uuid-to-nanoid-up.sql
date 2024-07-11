BEGIN;

ALTER TABLE users_imports
ALTER COLUMN organisation_id SET DATA TYPE varchar(21) USING SUBSTRING(organisation_id::text, 0, 21);

ALTER TABLE users
ALTER COLUMN user_profile_id SET DATA TYPE varchar(12) USING SUBSTRING(user_profile_id::text, 0, 12),
ALTER COLUMN importer_organisation_id SET DATA TYPE varchar(21) USING SUBSTRING(importer_organisation_id::text, 0, 21);

ALTER TABLE email_providers
ALTER COLUMN organisation_id SET DATA TYPE varchar(21) USING SUBSTRING(organisation_id::text, 0, 21);

ALTER TABLE form_errors
-- can both be a uuid or a nanoid
ALTER COLUMN user_id SET DATA TYPE varchar(128) USING SUBSTRING(user_id::text, 0, 128);

ALTER TABLE jobs
-- can both be a uuid or a nanoid
ALTER COLUMN user_id SET DATA TYPE varchar(128) USING SUBSTRING(user_id::text, 0, 128);

ALTER TABLE message_states
-- can both be a uuid or a nanoid
ALTER COLUMN user_id SET DATA TYPE varchar(128) USING SUBSTRING(user_id::text, 0, 128);

ALTER TABLE message_template_meta
-- can both be a uuid or a nanoid
ALTER COLUMN created_by_user_id SET DATA TYPE varchar(128) USING SUBSTRING(created_by_user_id::text, 0, 128),
ALTER COLUMN organisation_id SET DATA TYPE varchar(21) USING SUBSTRING(organisation_id::text, 0, 21);

ALTER TABLE message_template_states
-- can both be a uuid or a nanoid
ALTER COLUMN user_id SET DATA TYPE varchar(128) USING SUBSTRING(user_id::text, 0, 128);

ALTER TABLE messages
ALTER COLUMN user_id SET DATA TYPE varchar(128) USING SUBSTRING(user_id::text, 0, 128),
ALTER COLUMN organisation_id SET DATA TYPE varchar(21) USING SUBSTRING(organisation_id::text, 0, 21);

ALTER TABLE organisation_user_configurations
ALTER COLUMN organisation_id SET DATA TYPE varchar(21) USING SUBSTRING(organisation_id::text, 0, 21);

ALTER TABLE sms_provider_states
ALTER COLUMN user_id SET DATA TYPE varchar(128) USING SUBSTRING(user_id::text, 0, 128);

ALTER TABLE sms_providers
ALTER COLUMN organisation_id SET DATA TYPE varchar(21) USING SUBSTRING(organisation_id::text, 0, 21);

COMMIT;
