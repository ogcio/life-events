BEGIN;

ALTER TABLE messages
DROP COLUMN sender_application_id;

ALTER TABLE messages 
ALTER COLUMN sender_user_profile_id SET DEFAULT 'not found';

ALTER TABLE messages 
ALTER COLUMN sender_user_profile_id SET NOT NULL;

COMMIT;