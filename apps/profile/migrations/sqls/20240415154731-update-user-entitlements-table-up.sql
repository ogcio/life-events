BEGIN;

ALTER TABLE entitlements RENAME TO user_entitlements;

ALTER TABLE user_entitlements RENAME COLUMN start_date TO issue_date;
ALTER TABLE user_entitlements RENAME COLUMN end_date TO expiry_date;

COMMIT;