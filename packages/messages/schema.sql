CREATE SCHEMA IF NOT EXISTS messages;

CREATE TABLE messages.templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE messages.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    fromEmail TEXT NOT NULL,
    toEmail TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    PRIMARY KEY (id)
);

