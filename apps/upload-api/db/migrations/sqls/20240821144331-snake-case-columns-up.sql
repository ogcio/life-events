BEGIN;
ALTER TABLE files ADD COLUMN last_scan timestamptz DEFAULT now() NOT NULL;
ALTER TABLE files ADD COLUMN created_at timestamptz DEFAULT now() NOT NULL;
ALTER TABLE files ADD COLUMN file_size int4 NULL;
ALTER TABLE files ADD COLUMN mime_type varchar(255) NULL;
ALTER TABLE files ADD COLUMN file_name varchar(255) DEFAULT NULL;


UPDATE public.files SET
    id = id,
    key = key,
    owner = owner,
    last_scan = lastscan,
    created_at = createdat,
    infected = infected,
    infection_description = infection_description,
    deleted = deleted,
    file_size = filesize,
    mime_type = mimetype,
    file_name = filename,
    antivirus_db_version = antivirus_db_version,
    organization_id = organization_id;


ALTER TABLE public.files DROP COLUMN "lastscan";
ALTER TABLE public.files DROP COLUMN "createdat";
ALTER TABLE public.files DROP COLUMN "filesize";
ALTER TABLE public.files DROP COLUMN "mimetype";
ALTER TABLE public.files DROP COLUMN "filename";

COMMIT;