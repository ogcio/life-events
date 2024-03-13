-- Main
CREATE DATABASE life_events;
CREATE DATABASE messaging;
CREATE DATABASE payments;
CREATE DATABASE shared;

-- Setup Extensions
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pgcrypto";

\connect shared

-- TODO: Setup migrations also for shared database
CREATE TABLE IF NOT EXISTS govid_sessions(
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    PRIMARY KEY(id) -- maybe user_id is the PK actually?
);

CREATE TABLE IF NOT EXISTS users(
    id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE, -- might not need?
    govid_email TEXT NOT NULL, -- At least in testing/mocking phase, we want to use this for fake "logging in" since id wont be very exiting to use
    govid TEXT NOT NULL,
    user_name TEXT NOT NULL,
    is_public_servant BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY(govid_email)
);


CREATE TABLE IF NOT EXISTS feature_flags(
    application TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY(application, slug)
);
