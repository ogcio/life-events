/* Replace with your SQL commands */
create table sms_providers(
    id uuid not null default gen_random_uuid() primary key,
    organisation_id uuid not null,
    provider_name text not null,
    config jsonb
);

alter table email_providers
	add column throttle_ms int,
	add column from_address text not null default 'example@domain';

create table message_template_states(
    user_id uuid not null primary key,
    state jsonb
);

create table sms_provider_states(
    user_id uuid not null primary key,
    state jsonb
);