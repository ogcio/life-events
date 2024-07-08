BEGIN;

ALTER TABLE users_imports
ALTER COLUMN organisation_id SET DATA TYPE text;

ALTER TABLE organisation_user_configurations
DROP CONSTRAINT organisations_users_user_id_fkey;

ALTER TABLE tags_users
DROP CONSTRAINT tags_users_user_id_fkey;

ALTER TABLE users
ALTER COLUMN user_profile_id SET DATA TYPE text,
ALTER COLUMN id SET DATA TYPE text,
ALTER COLUMN importer_organisation_id SET DATA TYPE text;

ALTER TABLE email_providers
ALTER COLUMN organisation_id SET DATA TYPE text;

ALTER TABLE form_errors
ALTER COLUMN user_id SET DATA TYPE text;

ALTER TABLE jobs
ALTER COLUMN user_id SET DATA TYPE text;

ALTER TABLE message_states
ALTER COLUMN user_id SET DATA TYPE text;

ALTER TABLE message_template_meta
ALTER COLUMN created_by_user_id SET DATA TYPE text,
ALTER COLUMN organisation_id SET DATA TYPE text;

ALTER TABLE message_template_states
ALTER COLUMN user_id SET DATA TYPE text;

ALTER TABLE messages
ALTER COLUMN user_id SET DATA TYPE text,
ALTER COLUMN organisation_id SET DATA TYPE text;

ALTER TABLE organisation_user_configurations
ALTER COLUMN user_id SET DATA TYPE text,
ALTER COLUMN organisation_id SET DATA TYPE text,
ADD CONSTRAINT organisations_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE sms_provider_states
ALTER COLUMN user_id SET DATA TYPE text;

ALTER TABLE sms_providers
ALTER COLUMN organisation_id SET DATA TYPE text;

ALTER TABLE tags_users
ALTER COLUMN user_id SET DATA TYPE text,
ADD CONSTRAINT tags_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);

COMMIT;