BEGIN; 

ALTER TABLE form_errors ADD COLUMN slug TEXT NOT NULL;

COMMIT;