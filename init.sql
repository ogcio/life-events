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
    is_public_servant BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY(govid_email)
);


CREATE TABLE IF NOT EXISTS user_flow_data(
    user_id UUID NOT NULL,
    flow TEXT NOT NULL,
    flow_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(flow, user_id)
);

CREATE TABLE IF NOT EXISTS payment_providers(
    user_id UUID NOT NULL,
    provider_id UUID NOT NULL DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    status TEXT NOT NULL,
    provider_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(provider_id)
);

CREATE TABLE IF NOT EXISTS feature_flags(
    application TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY(application, slug)
);

CREATE TABLE IF NOT EXISTS form_errors(
    user_id UUID NOT NULL,
    flow TEXT NOT NULL,
    slug TEXT NOT NULL,
    field TEXT NOT NULL,
    error_value TEXT,
    error_message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_requests(
    payment_request_id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reference TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(payment_request_id)
);

CREATE TABLE IF NOT EXISTS payment_requests_providers(
    payment_request_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    primary key(payment_request_id, provider_id)
);

CREATE TABLE IF NOT EXISTS payment_transactions(
    transaction_id SERIAL NOT NULL,
    payment_request_id UUID NOT NULL,
    user_id UUID NOT NULL,
    tl_payment_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(transaction_id)
);

CREATE TABLE IF NOT EXISTS file_meta(
    file_id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_type TEXT NOT NULL, -- proofOfAddress, fishingLicenceAddress, medicalDocument eg.
    file_name_i18key TEXT NOT NULL, -- let's double down on the locale
    file_extension TEXT NOT NULL, -- txt, pdf, csv, xlsx eg.
    upload_version INT DEFAULT 1, -- could be some composite serial
    primary key(file_id)
);