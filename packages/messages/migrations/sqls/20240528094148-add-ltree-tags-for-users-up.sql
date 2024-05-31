DROP TABLE IF EXISTS tags_users;
DROP TABLE IF EXISTS tags;

CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE tags (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    tag_name TEXT NOT NULL,
    tag_path ltree NOT NULL
);

CREATE TABLE tags_users (
    user_id uuid NOT NULL REFERENCES users (id),
    tag_id uuid NOT NULL REFERENCES tags (id),
    PRIMARY KEY (user_id, tag_id)
);

