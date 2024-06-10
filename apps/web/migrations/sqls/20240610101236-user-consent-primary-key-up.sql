WITH duplicates AS (
    SELECT
        ctid,
        ROW_NUMBER() OVER (PARTITION BY user_id, agreement, is_consenting ORDER BY user_id) AS rn
    FROM
        user_consents
)
delete FROM user_consents
WHERE ctid IN (
    SELECT ctid
    FROM duplicates
    WHERE rn > 1
);

ALTER TABLE user_consents
ADD CONSTRAINT user_consents_pkey PRIMARY KEY (user_id, agreement);