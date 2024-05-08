BEGIN;

ALTER TABLE payment_providers
ADD CONSTRAINT unique_provider_name UNIQUE (user_id, provider_name);

COMMIT;
