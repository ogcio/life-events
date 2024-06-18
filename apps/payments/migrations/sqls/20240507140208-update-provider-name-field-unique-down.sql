BEGIN;

ALTER TABLE payment_providers
DROP CONSTRAINT IF EXISTS unique_provider_name;

COMMIT;
