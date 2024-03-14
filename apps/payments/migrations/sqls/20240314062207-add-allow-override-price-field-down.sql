/* Replace with your SQL commands */

ALTER TABLE payment_requests
DROP COLUMN allow_amount_override;

ALTER TABLE payment_transactions
DROP COLUMN amount;
