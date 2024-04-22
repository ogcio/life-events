BEGIN;

ALTER TABLE payment_transactions DROP COLUMN user_id;

COMMIT;
