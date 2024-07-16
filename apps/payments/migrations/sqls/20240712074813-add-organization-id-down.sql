ALTER TABLE payment_providers
DROP COLUMN organization_id;

ALTER TABLE payment_requests
DROP COLUMN organization_id;
