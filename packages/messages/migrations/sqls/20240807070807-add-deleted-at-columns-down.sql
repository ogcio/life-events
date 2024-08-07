BEGIN;

ALTER TABLE sms_providers
DROP COLUMN deleted_at;

ALTER TABLE email_providers
DROP COLUMN deleted_at;

ALTER TABLE message_template_meta
DROP COLUMN deleted_at;

COMMIT;