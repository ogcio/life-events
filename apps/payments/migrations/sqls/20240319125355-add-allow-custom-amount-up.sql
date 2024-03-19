/* Replace with your SQL commands */

ALTER TABLE payment_requests
ADD COLUMN allow_custom_amount BOOLEAN NOT NULL DEFAULT FALSE;
