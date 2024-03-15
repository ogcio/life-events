CREATE TABLE IF NOT EXISTS user_consents (
    user_id UUID NOT NULl,
    agreement TEXT NOT NULL, -- Can be as fine grained as we want, or just "store data". Can also be an enum or whatever.
    is_consenting BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS user_flow_data(
    user_id UUID NOT NULL,
    category TEXT NOT NULL,
    flow TEXT NOT NULL,
    flow_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    primary key(flow, user_id)
);

CREATE TABLE IF NOT EXISTS form_errors(
    user_id UUID NOT NULL,
    flow TEXT NOT NULL,
    slug TEXT NOT NULL,
    field TEXT NOT NULL,
    error_value TEXT,
    error_message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS file_meta(
    file_id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_type TEXT NOT NULL, -- proofOfAddress, fishingLicenceAddress, medicalDocument eg.
    file_name_i18key TEXT NOT NULL, -- let's double down on the locale
    file_extension TEXT NOT NULL, -- txt, pdf, csv, xlsx eg.
    upload_version INT DEFAULT 1, -- could be some composite serial
    primary key(file_id)
);
