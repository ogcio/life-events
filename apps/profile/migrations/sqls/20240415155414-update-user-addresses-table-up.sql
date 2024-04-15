BEGIN; 


ALTER TABLE user_addresses RENAME COLUMN city TO town;

ALTER TABLE user_addresses ADD COLUMN county TEXT NOT NULL;

ALTER TABLE user_addresses ALTER COLUMN ownership_status DROP NOT NULL;

ALTER TABLE user_addresses RENAME COLUMN start_date TO move_in_date;
ALTER TABLE user_addresses ALTER COLUMN move_in_date SET NOT NULL;

ALTER TABLE user_addresses RENAME COLUMN end_date TO move_out_date;

COMMIT;
