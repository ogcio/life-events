BEGIN;

UPDATE public.messages
SET security_level='high'::text
WHERE security_level = 'confidential';

UPDATE public.messages
SET security_level='low'::text
WHERE security_level = 'public';

COMMIT;
