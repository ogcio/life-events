CREATE TABLE
    users (
        id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
        user_profile_id uuid,
        importer_organisation_id uuid NOT NULL,
        user_status text NOT NULL DEFAULT 'pending'
    );

CREATE TABLE
    organisations_users (
        organisation_id uuid NOT NULL,
        user_id uuid NOT NULL REFERENCES users (id),
        invitation_status text NOT NULL DEFAULT 'pending',
        invitation_sent_at timestamptz,
        invitation_feedback_at timestamptz,
        preferred_transports text[],
        UNIQUE (organisation_id, user_id)

    );

CREATE TABLE 
    users_imports (
        organisation_id uuid NOT NULL,
        imported_at timestamptz DEFAULT now(),
        users_data jsonb NOT NULL,
        import_channel text NOT NULL DEFAULT 'api',
        retry_count int NOT NULL DEFAULT 0,
        last_retry_at timestamptz
    );