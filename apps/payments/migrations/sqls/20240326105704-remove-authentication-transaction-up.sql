/* Replace with your SQL commands */

BEGIN;
-- Removing both user_id and ppsn columns from payment_transactions table
-- as we want to allow unauthenticated transactions
ALTER TABLE payment_transactions DROP COLUMN user_id;
ALTER TABLE payment_transactions DROP COLUMN user_ppsn;

-- We want to save data like email and name (primarly for OpenBanking, but more broadly for all providers)
ALTER TABLE payment_transactions ADD COLUMN user_data JSONB NOT NULL;
COMMIT;
