BEGIN;


ALTER TABLE payment_providers
    ALTER COLUMN user_id TYPE UUID USING user_id::UUID;


ALTER TABLE payment_requests
    ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

COMMIT;
