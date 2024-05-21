CREATE TABLE
  IF NOT EXISTS form_errors (
    user_id UUID NOT NULL,
    state_id UUID NOT NULL, -- eg. email send form
    field TEXT NOT NULL,
    error_value TEXT,
    error_message TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS message_states (
    state_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL,
    state JSONB
  );

create table
  message_interpolation_accessors (
    message_id uuid not null,
    value_accessor text not null,
    key_accessor text not null
  );