ALTER TABLE messages
ADD COLUMN created_by_user_profile_id varchar(12) NOT NULL DEFAULT 'not found';