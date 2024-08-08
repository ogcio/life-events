BEGIN;
-- Add the filename column with a default value of NULL
ALTER TABLE files ADD COLUMN filename VARCHAR(255) DEFAULT NULL;

-- Update existing records to set filename to the extracted value from the key field
UPDATE files
SET filename = substring(key from '([^/]+)$');

COMMIT;