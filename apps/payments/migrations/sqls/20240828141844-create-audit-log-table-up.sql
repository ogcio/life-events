/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS audit_logs(
    audit_log_id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type TEXT NOT NULL,
    user_id VARCHAR(12),
    organization_id VARCHAR(21),
    metadata JSONB NOT NULL
);