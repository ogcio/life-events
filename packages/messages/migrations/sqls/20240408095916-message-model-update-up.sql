/* Replace with your SQL commands */

drop table email_template_translations;
drop table email_templates;


create table messages (
    id uuid not null default gen_random_uuid(),
    organisation_id uuid not null,
    user_id uuid not null,
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
    preferred_transports text[], -- email, sms.
    payment_request_id uuid, 
    updated_at timestamptz,
    created_at timestamptz not null default now(),
    primary key(id)
);

create table message_logs(
    message_id uuid not null,
    event_type text not null, -- 
    created_at timestamptz not null default now()
);

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
    primary key(template_meta_id, lang)
);

create table message_template_variables (
    template_meta_id uuid not null,
    field_name text not null,
    field_type text not null,
    primary key(template_meta_id, field_name)
);