/* Replace with your SQL commands */

ALTER TABLE payment_requests
ADD COLUMN allow_amount_override BOOLEAN NOT NULL DEFAULT FALSE;


ALTER TABLE payment_transactions
ADD COLUMN amount NUMERIC NOT NULL DEFAULT 0.0;
