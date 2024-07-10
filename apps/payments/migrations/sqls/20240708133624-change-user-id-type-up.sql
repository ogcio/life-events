BEGIN;

TRUNCATE TABLE payment_transactions, payment_requests_providers, payment_requests, payment_providers CASCADE;

ALTER TABLE payment_providers ALTER COLUMN user_id TYPE varchar (12);
ALTER TABLE payment_requests ALTER COLUMN user_id TYPE varchar (12);
ALTER TABLE payment_transactions ALTER COLUMN user_id TYPE varchar (12);

COMMIT;
