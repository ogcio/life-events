BEGIN;

ALTER TABLE user_addresses
DROP CONSTRAINT user_addresses_user_id_fkey;

ALTER TABLE user_entitlements
DROP CONSTRAINT entitlements_user_id_fkey;

ALTER TABLE user_details
ALTER COLUMN user_id SET DATA TYPE text;

ALTER TABLE user_entitlements
ALTER COLUMN user_id SET DATA TYPE text,
ADD CONSTRAINT entitlements_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_details (user_id);

ALTER TABLE form_errors
ALTER COLUMN user_id SET DATA TYPE text;

ALTER TABLE user_addresses
ALTER COLUMN user_id SET DATA TYPE text,
ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_details (user_id);

COMMIT;