INSERT INTO users
(id, govid_email, govid, user_name, is_public_servant)
VALUES
    ('239c2e19-6869-44ef-bdd2-eb17819cf51e', 'bob.red@profile.com', 'not needed atm', 'Bob Red', false),
    ('5eca4350-1d83-427a-849f-c2db698a5dfc', 'anne.brown@profile.com', 'not needed atm', 'Anne Brown', false),
    ('fc6f3dd9-79ff-424f-b41e-e1959e25b414', 'margaret.blue@profile.com', 'not needed atm', 'Margaret Blue', false)
ON CONFLICT (govid_email)
DO NOTHING