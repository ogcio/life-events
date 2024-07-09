INSERT INTO user_details
(user_id, title, firstname, lastname, date_of_birth, ppsn, gender, phone, email, created_at, updated_at, ppsn_visible, consent_to_prefill_data)
VALUES
    ('239c2e19-6869-44ef-bdd2-eb17819cf51e', 'Mr', 'Bob', 'Red', '1990-01-01', 'BOB_RED_PPSN', 'male', '123456789', 'bob.red@profile.com', now(), now(), false, false),
    ('5eca4350-1d83-427a-849f-c2db698a5dfc', 'Ms', 'Anne', 'Brown', '1990-01-01', 'ANNE_BROWN_PPSN', 'female', '2345432', 'anne.brown@profile.com', now(), now(), false, true),
    ('fc6f3dd9-79ff-424f-b41e-e1959e25b414', 'Mrs', 'Margaret', 'Blue', '1990-10-10', 'MARGARET_BLUE_PPSN', 'female', '00000000', 'margaret.blue@profile.com', now(), now(), false, true)
ON CONFLICT DO NOTHING;


INSERT INTO public.user_entitlements
(id, "type", issue_date, expiry_date, document_number, user_id, firstname, lastname, created_at, updated_at)
VALUES(gen_random_uuid(), 'fde', now(), now(), '123', 'fc6f3dd9-79ff-424f-b41e-e1959e25b414', 'aaa', 'aaa', now(), now()); 