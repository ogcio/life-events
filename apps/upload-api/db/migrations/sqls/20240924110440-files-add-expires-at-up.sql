ALTER TABLE files
ADD COLUMN expires_at TIMESTAMPTZ DEFAULT NULL;
