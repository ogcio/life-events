CREATE TABLE tags (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    tag_name TEXT NOT NULL,
    parent_id uuid REFERENCES tags(id)
    /* can't set unique because it would collide for tag_name, null
       we have to check it at code level */
    -- UNIQUE(tag_name, parent_id),
);

CREATE TABLE tags_users (
    user_id uuid NOT NULL REFERENCES users (id),
    tag_id uuid NOT NULL REFERENCES tags (id),
    /* let's say we have a `Country` tag with its child `City`
       we assign `City` to user 1, but to speed up search
       we will store both the relation between `City` and user 1
       with inherited to false and the relation between `Country`
       and user 1 with inherited true */
    inherited BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, tag_id)
);

