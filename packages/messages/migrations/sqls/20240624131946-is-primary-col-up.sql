/**
Unique constraints by default don't regard null as value thus we use a nullable boolean. 
If set to true (or theoretically false) it will be counted as the unique value for the orgnaisation id,
thus we only allow null and true as insertion values to keep the data "clean"
*/
alter table email_providers add is_primary BOOLEAN;
alter TABLE email_providers add UNIQUE (organisation_id, is_primary);
alter TABLE email_providers add check(is_primary is null or is_primary is true);

alter table sms_providers add is_primary BOOLEAN;
alter TABLE sms_providers add UNIQUE (is_primary,organisation_id);
alter TABLE sms_providers add check(is_primary is null or is_primary is true);