BEGIN;

ALTER TABLE payment_transactions DROP COLUMN user_id;
ALTER TABLE payment_transactions DROP COLUMN user_ppsn;
ALTER TABLE payment_transactions ADD COLUMN user_data JSONB NOT NULL;

COMMIT;
