/* Replace with your SQL commands */

ALTER TABLE payment_requests ALTER COLUMN reference DROP NOT NULL;
ALTER TABLE payment_requests ALTER COLUMN amount DROP NOT NULL;
ALTER TABLE payment_requests ALTER COLUMN redirect_url DROP NOT NULL;
