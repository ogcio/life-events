/* Replace with your SQL commands */

alter table email_providers
	add column throttle_ms int,
	add column from_address text not null default 'example@domain';
