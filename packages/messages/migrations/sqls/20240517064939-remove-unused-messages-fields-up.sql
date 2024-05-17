ALTER TABLE messages
    DROP COLUMN IF EXISTS message_type,
    DROP COLUMN IF EXISTS payment_request_id,
    DROP COLUMN IF EXISTS links;

