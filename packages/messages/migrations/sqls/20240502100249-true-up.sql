drop table message_interpolation_accessors;

create table message_template_interpolations(
    message_by_template_id uuid not null,
    interpolation_key text not null,
    interpolation_value text not null
);

create table scheduled_message_by_templates(
    id uuid not null default gen_random_uuid() primary key,
    template_meta_id uuid not null,
    preferred_transports text[],
    message_security text default 'high',
    message_type text not null
);

create table jobs(
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    job_id uuid not null,
    job_type text not null,
    delivery_status text, -- 
    create_at timestamptz not null default now()
);