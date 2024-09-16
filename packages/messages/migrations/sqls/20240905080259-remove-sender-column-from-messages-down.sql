ALTER TABLE messages
ADD COLUMN sender_application_id varchar(21),
ADD COLUMN sender_user_profile_id varchar(12);