create table email_providers(
    id uuid not null default gen_random_uuid(),
    provider_name text not null unique,
    smtp_host text not null,
    smtp_port smallint not null,
    username text not null,
    pw text not null,
    created_at timestamptz not null default now(),
    primary key(id)
);

alter table form_errors alter column state_id type text;