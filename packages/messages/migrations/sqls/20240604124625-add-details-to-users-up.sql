ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS details jsonb NOT NULL default '{}',
    ADD COLUMN IF NOT EXISTS users_import_id uuid REFERENCES users_imports(import_id)