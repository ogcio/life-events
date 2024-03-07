CREATE SCHEMA IF NOT EXISTS messages;

CREATE TABLE messages.email_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    PRIMARY KEY (id)
);

CREATE TABLE messages.email_template_translations (
    template_id UUID NOT NULL,
    language CHAR(2) NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    PRIMARY KEY (template_id, language),
    FOREIGN KEY (template_id) REFERENCES messages.email_templates(id) ON DELETE CASCADE
);

CREATE TYPE language_enum AS ENUM ('EN', 'GA');


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
