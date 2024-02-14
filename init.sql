-- Main
-- CREATE DATABASE my_database;

-- Setup Extensions
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pgcrypto";

CREATE TABLE IF NOT EXISTS govid_sessions(
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    PRIMARY KEY(id)
)