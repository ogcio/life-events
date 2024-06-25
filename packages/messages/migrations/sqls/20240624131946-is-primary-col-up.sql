/* Replace with your SQL commands */
alter table email_providers add is_primary BOOLEAN;
alter TABLE email_providers add UNIQUE (organisation_id, is_primary);

alter table sms_providers add is_primary BOOLEAN;
alter TABLE sms_providers add UNIQUE (is_primary,organisation_id);