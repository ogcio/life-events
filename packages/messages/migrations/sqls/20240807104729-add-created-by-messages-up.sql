ALTER TABLE messages
ADD COLUMN sender_user_profile_id varchar(12) NOT NULL DEFAULT 'not found';
