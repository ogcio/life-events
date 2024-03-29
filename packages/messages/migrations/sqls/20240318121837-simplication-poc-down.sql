  DROP TABLE form_errors;

  DROP TABLE message_states;

  DROP TABLE messages;

  DROP TABLE message_interpolation_accessors;

CREATE TABLE messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    fromEmail TEXT NOT NULL,
    toEmail TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE notifications (
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



