CREATE TABLE IF NOT EXISTS user_details(
    user_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    title TEXT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    date_of_birth DATE,
    ppsn TEXT,
    ppsn_visible BOOLEAN DEFAULT FALSE,
    gender TEXT,
    phone TEXT, 
    email TEXT NOT NULL,
    consent_to_prefill_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(user_id)
);

CREATE TABLE IF NOT EXISTS user_addresses (
    address_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    user_id UUID NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    town TEXT NOT NULL,
    county TEXT NOT NULL,
    eirecode TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    ownership_status TEXT,
    start_date  TIMESTAMPTZ,
    end_date  TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_details(user_id)
);

CREATE TABLE IF NOT EXISTS user_entitlements (
    id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    type TEXT NOT NULL, -- eventually could be an enum
    issue_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ,
    document_number TEXT NOT NULL,
    user_id UUID NOT NULL,
    firstName TEXT NOT NULL, 
    lastName TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_details(user_id)
);

CREATE TABLE IF NOT EXISTS form_errors(
    user_id UUID NOT NULL,
    field TEXT NOT NULL,
    error_value TEXT,
    error_message TEXT NOT NULL
);
