BEGIN;

ALTER TABLE files ADD COLUMN lastscan timestamptz DEFAULT now() NOT NULL;
ALTER TABLE files ADD COLUMN createdat timestamptz DEFAULT now() NOT NULL;
ALTER TABLE files ADD COLUMN filesize int4 NULL;
ALTER TABLE files ADD COLUMN mimetype varchar(255) NULL;
ALTER TABLE files ADD COLUMN filename varchar(255) DEFAULT NULL;

UPDATE public.files SET
    lastscan = last_scan,
    createdat = created_at,
    filesize = file_size,
    mimetype = mime_type,
    filename = file_name;

ALTER TABLE public.files DROP COLUMN last_scan;
ALTER TABLE public.files DROP COLUMN created_at;
ALTER TABLE public.files DROP COLUMN file_size;
ALTER TABLE public.files DROP COLUMN mime_type;
ALTER TABLE public.files DROP COLUMN file_name;

COMMIT;