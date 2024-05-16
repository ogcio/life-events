DO $$ BEGIN
    UPDATE payment_providers as providers
    SET provider_name = providers.provider_name || '_' || floor(random()*1000) + 1
    FROM (
        SELECT provider_id, provider_name, row_number(*) over (partition by provider_name order by provider_id) as rn
        FROM public.payment_providers
    ) dublicate
    where providers.provider_id = dublicate.provider_id AND dublicate.rn > 1;

    IF NOT EXISTS (
        SELECT FROM pg_constraint 
        WHERE conname = 'unique_provider_name')
    THEN 
        ALTER TABLE payment_providers
        ADD CONSTRAINT unique_provider_name UNIQUE (user_id, provider_name);
    END IF;
END $$;
