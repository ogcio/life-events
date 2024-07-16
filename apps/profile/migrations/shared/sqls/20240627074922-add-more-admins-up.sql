INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('kelly.rush@per.gov.ie', 'not needed atm', 'Kelly Rush', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;

INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('therese.ohanlon@per.gov.ie', 'not needed atm','Therese OHanlon', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;
