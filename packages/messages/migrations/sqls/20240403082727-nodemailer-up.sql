create table email_providers(
    id uuid not null default gen_random_uuid(),
    provider_name text not null unique,
    smtp_host text not null,
    username text not null,
    pw text not null,
    created_at timestamptz not null default now(),
    primary key(id)
);