/* Replace with your SQL commands */

drop table messages;

/*

    We omit any language stuff

*/
create table messages (
    id uuid not null default gen_random_uuid(),
    organisation_id uuid not null,
    user_id uuid not null,
    -- some is_sent/is_available eg. from a scheduler
    is_delivered boolean not null default false,
    thread_name text, 
    lang text not null,
    is_seen boolean default false,
    message_name text not null,
    message_type text not null,
    security_level text not null default 'high',
    subject text not null,
    excerpt text not null,
    rich_text text not null,
    plain_text text not null,
    links text[],
    preferred_transports text[], -- email, sms, blala define enum is fine? Im ok with text with constraints
    payment_request_id uuid, -- this may or may not be removed?
    updated_at timestamptz,
    created_at timestamptz not null default now(),
    primary key(id)
);

create table message_logs(
    message_id uuid not null,
    event_type text not null, -- 
    created_at timestamptz not null default now()
);

/*

    Template has multiple contents (for each lang)

*/

create table message_template_meta(
    id uuid not null default gen_random_uuid(),
    organisation_id uuid not null,
    created_by_user_id uuid not null
);

create table message_template_contents (
    template_meta_id uuid not null,
    template_name text not null,
    lang text not null,
    subject text not null,
    excerpt text not null,
    rich_text text not null,
    plain_text text not null,
    updated_at timestamptz,
    created_at timestamptz not null default now(),
    primary key(template_meta_id, lang) -- only one body per template and language
);

create table message_template_variables (
    template_meta_id uuid not null,
    field_name text not null,
    field_type text not null -- text or number ? 
);


/*

Message should be a meta header.
Each message should have an associated "content" row (we can support interpolations easier and multi languages)
What exactly does a template mean? It's basically a message content with interpolations? 
*/

