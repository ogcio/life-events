/* Replace with your SQL commands */

BEGIN;

-- Add the payment_provider_id column to the payment_transactions table
ALTER TABLE payment_transactions
ADD COLUMN payment_provider_id UUID;

-- Add a foreign key constraint linking payment_provider_id to the payment_providers table
ALTER TABLE payment_transactions
ADD CONSTRAINT fk_payment_provider_id 
FOREIGN KEY (payment_provider_id) 
REFERENCES payment_providers(provider_id);

COMMIT;
