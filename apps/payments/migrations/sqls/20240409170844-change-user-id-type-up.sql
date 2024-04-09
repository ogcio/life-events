BEGIN;

ALTER TABLE payment_providers
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT,
    ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE payment_requests
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT,
    ALTER COLUMN user_id SET NOT NULL;


COMMIT;
