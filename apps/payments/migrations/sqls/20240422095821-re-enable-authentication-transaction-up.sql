BEGIN;

ALTER TABLE payment_transactions DROP COLUMN user_data;

ALTER TABLE payment_transactions ADD COLUMN user_id UUID; 

COMMIT;
