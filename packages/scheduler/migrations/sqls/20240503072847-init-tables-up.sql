create table scheduled_events(
    id uuid not null default gen_random_uuid() primary key,
    webhook_url text not null,
    webhoob_auth text,
    execute_at timestamptz not null,
    event_status text not null default 'pending',
    retries int default 0 check (retries >= 0),
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create table event_config(
    batch_size int not null check (batch_size > 0),
    base_interval int not null check(base_interval > 0)
);

create table event_logs(
    event_id uuid not null,
    status_code text not null,
    created_at timestamptz not null default now()
);

create table config (
    base_interval_ms int not null check(base_interval_ms > 0),
    select_size int not null check(select_size > 0)
);