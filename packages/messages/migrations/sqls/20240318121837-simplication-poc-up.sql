DROP TABLE notifications;
  DROP TABLE messages;

  CREATE TABLE IF NOT EXISTS form_errors(
    user_id UUID NOT NULL,
    state_id UUID NOT NULL, -- eg. email send form
    field TEXT NOT NULL,
    error_value TEXT,
    error_message TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS message_states(
    state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    state JSONB
  );

  CREATE TABLE IF NOT EXISTS messages (
    message_id uuid default gen_random_uuid(),
    for_email text not null,
    subject text not null,
    abstract text,
    content text,
    action_url text,
    is_unseen boolean default true,
    message_type text not null,
    created_at timestamptz default now()
  );

  create table message_interpolation_accessors(
    message_id uuid not null,
    value_accessor text not null, 
    key_accessor text not null
  );