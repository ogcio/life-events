/* Replace with your SQL commands */
BEGIN;

-- Drop the foreign key constraint linking payment_provider_id to the payment_providers table
ALTER TABLE payment_transactions
DROP CONSTRAINT IF EXISTS fk_payment_provider_id;

-- Remove the payment_provider_id column from the payment_transactions table
ALTER TABLE payment_transactions
DROP COLUMN IF EXISTS payment_provider_id;

COMMIT;
