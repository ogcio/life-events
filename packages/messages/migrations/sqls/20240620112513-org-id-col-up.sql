/* Replace with your SQL commands */

alter table email_providers add organisation_id uuid;
alter table email_providers add unique (organisation_id, from_address);