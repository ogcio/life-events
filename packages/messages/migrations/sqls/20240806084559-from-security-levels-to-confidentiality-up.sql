BEGIN;

UPDATE public.messages
SET security_level='confidential'::text
WHERE security_level = 'high';

UPDATE public.messages
SET security_level='public'::text
WHERE security_level = 'low';

COMMIT;
