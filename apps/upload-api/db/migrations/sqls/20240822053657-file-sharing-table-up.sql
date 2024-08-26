BEGIN;

-- Create the file_sharing table
CREATE TABLE public.file_sharing (
    id uuid NOT NULL, -- Foreign key to the files table
    user_id VARCHAR(255) NOT NULL, -- User ID associated with the file sharing
    shared_at timestamptz DEFAULT now() NOT NULL, -- Timestamp when the file was shared

    -- Define the composite primary key
    PRIMARY KEY (id, user_id),

    -- Foreign key constraint to ensure id references files(id)
    CONSTRAINT fk_file
        FOREIGN KEY (id)
        REFERENCES public.files (id)
        ON DELETE CASCADE
);

END;
