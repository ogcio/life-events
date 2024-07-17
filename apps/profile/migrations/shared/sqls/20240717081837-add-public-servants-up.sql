INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('rodrigo.guimaraes@gmail.com', 'not needed atm', 'Rodrigo Guimares', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;

INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('david_losinski@yahoo.co.uk', 'not needed atm','David Losinski', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;
