BEGIN;

ALTER TABLE payment_providers
DROP CONSTRAINT unique_provider_name;

COMMIT;