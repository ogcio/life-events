CREATE TABLE IF NOT EXISTS user_details(
    user_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    title TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    ppsn TEXT NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL, 
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(user_id)
);

CREATE TABLE IF NOT EXISTS user_addresses (
    address_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    user_id UUID NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    eirecode TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    ownership_status TEXT NOT NULL,
    start_date  TIMESTAMP NOT NULL,
    end_date  TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_details(user_id)
);

CREATE TABLE IF NOT EXISTS entitlements (
    id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    type TEXT NOT NULL, -- eventually could be an enum
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    document_number TEXT NOT NULL,
    user_id UUID NOT NULL,
    firstName TEXT NOT NULL, 
    lastName TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_details(user_id)
)