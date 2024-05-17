/* Replace with your SQL commands */

BEGIN;

TRUNCATE TABLE payment_transactions, payment_requests_providers, payment_requests, payment_providers CASCADE;

COMMIT;