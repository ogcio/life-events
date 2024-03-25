/* Replace with your SQL commands */

ALTER TABLE payment_requests_providers
ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT FALSE;
