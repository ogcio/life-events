ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS message_type text not null,
    ADD COLUMN IF NOT EXISTS links text[],
    ADD COLUMN IF NOT EXISTS payment_request_id uuid;

ALTER TABLE scheduled_message_by_templates
    ADD COLUMN IF NOT EXISTS message_type text not null;