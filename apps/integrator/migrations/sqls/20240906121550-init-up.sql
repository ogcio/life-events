/* Replace with your SQL commands */

DO $$
BEGIN
    -- Table to store journeys, which represent an overarching flow made of multiple steps
    CREATE TABLE IF NOT EXISTS journeys (
        id SERIAL PRIMARY KEY,                       -- Unique identifier for the journey
        title VARCHAR(255) NOT NULL,                 -- Title or name of the journey
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the journey was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of the last time the journey was updated
    );

    -- Table to store the individual steps within a journey
    CREATE TABLE IF NOT EXISTS journey_steps (
        id SERIAL PRIMARY KEY,                           -- Unique identifier for the step
        journey_id INT REFERENCES journeys(id) ON DELETE CASCADE, -- Foreign key to the journey
        step_type VARCHAR(50) NOT NULL,                  -- Type of step, e.g., "form", "payment", "messaging"
        step_number INT NOT NULL,                        -- Step sequence number in the journey
        step_data JSONB,                                 -- Step-specific data stored as a JSONB object, schema varies based on step_type
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of when the step was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Timestamp of the last time the step was updated
    );

    -- Table to track individual submissions by users through a journey
    CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,                           -- Unique identifier for the submission
        user_id INT NOT NULL,                            -- Identifier for the user making the submission (assumes a user system exists)
        journey_id INT REFERENCES journeys(id) ON DELETE CASCADE, -- Foreign key to the associated journey
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the submission was started
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Timestamp when the submission was last updated
    );

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'step_status') THEN
        CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
    END IF;

    -- Table to track progress of each step in a submission
    CREATE TABLE IF NOT EXISTS submission_step (
        id SERIAL PRIMARY KEY,                           -- Unique identifier for the submission step
        submission_id INT REFERENCES submissions(id) ON DELETE CASCADE, -- Foreign key to the submission
        step_id INT REFERENCES journey_steps(id) ON DELETE CASCADE, -- Foreign key to the specific step in the journey
        key VARCHAR(255) NOT NULL,                       -- Identifier or label for the submission step data
        data JSONB,                                      -- The data collected or processed for this step, stored in JSONB format
        status step_status NOT NULL DEFAULT 'pending',   -- Status of the step (pending, in_progress, completed, failed)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the step was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Timestamp of the last time the step was updated
    );
END$$;
