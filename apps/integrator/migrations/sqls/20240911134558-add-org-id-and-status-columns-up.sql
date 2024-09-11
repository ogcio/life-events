/* Replace with your SQL commands */

ALTER TABLE journeys
ADD COLUMN organization_id VARCHAR(21);

ALTER TABLE journeys
ADD COLUMN status TEXT;

ALTER TABLE journey_steps
ADD COLUMN status TEXT;
