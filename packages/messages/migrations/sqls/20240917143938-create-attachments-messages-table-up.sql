BEGIN;

CREATE TABLE attachments_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
	message_id uuid NOT NULL,
	attachment_id uuid NOT NULL
);

ALTER TABLE attachments_messages 
    ADD CONSTRAINT attachments_messages_message_id_fkey FOREIGN KEY (message_id) REFERENCES messages(id);

COMMIT;