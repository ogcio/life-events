BEGIN;

ALTER TABLE messages
ADD COLUMN sender_application_id varchar(21);

ALTER TABLE messages 
ALTER COLUMN sender_user_profile_id DROP NOT NULL;

ALTER TABLE messages 
ALTER COLUMN sender_user_profile_id DROP DEFAULT;

COMMIT;