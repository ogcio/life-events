/* Replace with your SQL commands */

ALTER TABLE journeys
DROP COLUMN IF EXISTS organization_id;

ALTER TABLE journeys
DROP COLUMN IF EXISTS status;

ALTER TABLE journey_steps
DROP COLUMN IF EXISTS status;
