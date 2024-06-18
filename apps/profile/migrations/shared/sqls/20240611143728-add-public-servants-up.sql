INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('zina.monaghan@per.gov.ie', 'not needed atm','Zina Monaghan', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;