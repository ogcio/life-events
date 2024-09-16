BEGIN;

ALTER TABLE sms_providers
ADD COLUMN deleted_at timestamptz;

ALTER TABLE email_providers
ADD COLUMN deleted_at timestamptz;

ALTER TABLE message_template_meta
ADD COLUMN deleted_at timestamptz;

COMMIT;