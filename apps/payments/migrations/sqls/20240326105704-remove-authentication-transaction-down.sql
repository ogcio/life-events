/* Replace with your SQL commands */

BEGIN;
ALTER TABLE payment_transactions ADD COLUMN user_id UUID;
ALTER TABLE payment_transactions ADD COLUMN user_ppsn TEXT;
ALTER TABLE payment_transactions DROP COLUMN user_data;
COMMIT;

