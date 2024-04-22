BEGIN;

ALTER TABLE payment_transactions ADD COLUMN user_id UUID; 

COMMIT;
