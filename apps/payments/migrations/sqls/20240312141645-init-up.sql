CREATE TABLE IF NOT EXISTS payment_providers(
    user_id UUID NOT NULL,
    provider_id UUID NOT NULL DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    status TEXT NOT NULL,
    provider_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(provider_id)
);


CREATE TABLE IF NOT EXISTS payment_requests(
    payment_request_id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reference TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    redirect_url TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(payment_request_id)
);

CREATE TABLE IF NOT EXISTS payment_requests_providers(
    payment_request_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    primary key(payment_request_id, provider_id)
);

CREATE TABLE IF NOT EXISTS payment_transactions(
    transaction_id SERIAL NOT NULL,
    payment_request_id UUID NOT NULL,
    user_id UUID,
    user_ppsn TEXT, -- Used in order to send the payment request to the user through the messaging app.
    ext_payment_id TEXT, -- The payment Id from TrueLayer/stripe etc
    status TEXT NOT NULL,
    integration_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(transaction_id),
    constraint fk_payment_request_id foreign key(payment_request_id) references payment_requests(payment_request_id)
);
