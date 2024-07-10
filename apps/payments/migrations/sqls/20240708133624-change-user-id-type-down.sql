ALTER TABLE payment_providers ALTER COLUMN user_id TYPE uuid;
ALTER TABLE payment_requests ALTER COLUMN user_id TYPE uuid;
ALTER TABLE payment_transactions ALTER COLUMN user_id TYPE uuid;
