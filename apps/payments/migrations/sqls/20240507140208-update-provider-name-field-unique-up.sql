DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_constraint 
        WHERE conname = 'unique_provider_name')
    THEN 
        ALTER TABLE payment_providers
        ADD CONSTRAINT unique_provider_name UNIQUE (user_id, provider_name);
    END IF;
END $$;
