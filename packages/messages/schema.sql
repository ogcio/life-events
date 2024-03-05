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

CREATE TABLE messages.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    action TEXT NOT NULL,
    action_url TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    user_id UUID NOT NULL,
    PRIMARY KEY (id)
);
