INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('fmnf2024@proton.me', 'not needed atm', 'Francesco Maida', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;

INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('eimear.phelan@per.gov.ie', 'not needed atm','Eimear Phelan', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;

INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('conor.goulding@per.gov.ie', 'not needed atm','Conor Goulding', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;

INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('tiago.ramos@nearform.com', 'not needed atm','Tiago Ramos', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;

INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('richard.warner@nearform.com', 'not needed atm','Richard Warner', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;

INSERT INTO users (govid_email, govid, user_name, is_public_servant)
VALUES ('radomir.drndarski@nearform.com', 'not needed atm','Radomir Drndarski', true)
ON CONFLICT (govid_email)
DO UPDATE SET is_public_servant = EXCLUDED.is_public_servant;
