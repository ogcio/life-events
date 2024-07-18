ALTER TABLE payment_providers
ADD COLUMN organization_id VARCHAR(21);

ALTER TABLE payment_requests
ADD COLUMN organization_id VARCHAR(21);
