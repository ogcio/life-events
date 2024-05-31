ALTER TABLE tags ADD CONSTRAINT tags_name_path_unique UNIQUE (tag_name, tag_path);
