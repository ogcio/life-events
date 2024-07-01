/* Replace with your SQL commands */

create table messaging_event_logs(
		id uuid default gen_random_uuid() primary key,
		message_id uuid not null,
        event_status text not null,
        event_type text not null,
        data jsonb,
        created_at timestamptz default now()
);

alter table messages add created_at timestamptz;