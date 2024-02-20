-- Main
-- CREATE DATABASE my_database;

-- Setup Extensions
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pgcrypto";

CREATE TABLE IF NOT EXISTS govid_sessions(
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    PRIMARY KEY(id) -- maybe user_id is the PK actually?
);

CREATE TABLE IF NOT EXISTS users(
    id UUID NOT NULL DEFAULT gen_random_uuid(), -- might not need?
    govid_email TEXT NOT NULL, -- At least in testing/mocking phase, we want to use this for fake "logging in" since id wont be very exiting to use
    govid TEXT NOT NULL,
    user_name TEXT NOT NULL,
    PRIMARY KEY(govid_email)
);
