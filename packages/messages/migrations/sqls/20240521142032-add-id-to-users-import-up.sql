ALTER TABLE users_imports
    ADD COLUMN IF NOT EXISTS import_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;