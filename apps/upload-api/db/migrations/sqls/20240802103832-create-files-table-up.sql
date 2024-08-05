CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    owner INTEGER NOT NULL,
    lastScan DATE,
    createdAt DATE NOT NULL DEFAULT CURRENT_DATE,
    infected BOOLEAN NOT NULL DEFAULT FALSE,
    infection_description TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    fileSize INTEGER,
    mimetype VARCHAR(255)
);

CREATE INDEX idx_files_key ON files (key);
CREATE INDEX idx_files_owner ON files (owner);