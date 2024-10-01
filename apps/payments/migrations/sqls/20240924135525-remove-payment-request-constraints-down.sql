/* Replace with your SQL commands */

ALTER TABLE payment_requests ALTER COLUMN reference SET NOT NULL;
ALTER TABLE payment_requests ALTER COLUMN amount SET NOT NULL;
ALTER TABLE payment_requests ALTER COLUMN redirect_url SET NOT NULL;
