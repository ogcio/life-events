INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('tamara.aranda@nearform.com', 'not needed atm','Tamara Aranda', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;
