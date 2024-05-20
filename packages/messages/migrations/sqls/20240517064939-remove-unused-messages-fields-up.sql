ALTER TABLE messages
    DROP COLUMN IF EXISTS message_type,
    DROP COLUMN IF EXISTS payment_request_id,
    DROP COLUMN IF EXISTS links;

ALTER TABLE scheduled_message_by_templates
    DROP COLUMN IF EXISTS message_type;