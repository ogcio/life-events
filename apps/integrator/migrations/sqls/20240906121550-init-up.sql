DO $$
BEGIN
    -- Table to store journeys, which represent an overarching flow made of multiple steps
    CREATE TABLE IF NOT EXISTS journeys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for the journey
        title VARCHAR(255) NOT NULL,                    -- Title or name of the journey
        user_id VARCHAR(12) NOT NULL,                   -- Identifier for the user creating the journey (assumes a user system exists)
        organization_id VARCHAR(21) NOT NULL,           -- The organization's id to which the journey belongs
        initial_step_id UUID,                             -- Foreign key to the specific step in the journey
        status TEXT NOT NULL,                           -- Journey's status
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the journey was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the last time the journey was updated
    );

    -- Table to store the individual steps within a journey
    CREATE TABLE IF NOT EXISTS journey_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for the step
        journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE, -- Foreign key to the journey
        step_type VARCHAR(50) NOT NULL,                  -- Type of step, e.g., "form", "payment", "messaging"
        step_data JSONB,                                 -- Step-specific data stored as a JSONB object, schema varies based on step_type
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of when the step was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Timestamp of the last time the step was updated
    );

    -- Table to store the linkage between journey steps
    CREATE TABLE IF NOT EXISTS journey_steps_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for the step
        journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE, -- Foreign key to the journey
        source_step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE, -- Foreign key to the specific step in the journey
        destination_step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE -- Foreign key to the specific step in the journey
    );

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'run_status') THEN
        CREATE TYPE step_status AS ENUM ('pending', 'completed', 'failed');
    END IF;

    -- Table to track individual run by users through a journey
    CREATE TABLE IF NOT EXISTS runs ( 
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),             -- Unique identifier for the run
        user_id VARCHAR(12) NOT NULL,                              -- Identifier for the user executing the run (assumes a user system exists)
        journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE, -- Foreign key to the associated journey
        status run_status NOT NULL DEFAULT 'pending',              -- Status of the run (pending, completed, failed)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,            -- Timestamp when the run was started
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP             -- Timestamp when the run was last updated
    );

    -- Table to track progress of each step in a run
    CREATE TABLE IF NOT EXISTS run_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   -- Unique identifier for the run step
        run_id UUID REFERENCES runs(id) ON DELETE CASCADE, -- Foreign key to the run
        step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE, -- Foreign key to the specific step in the journey
        data JSONB,                                      -- The data collected or processed for this step, stored in JSONB format
        status step_status NOT NULL DEFAULT 'pending',   -- Status of the step (pending, in_progress, completed, failed)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the step was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Timestamp of the last time the step was updated
    );

    -- Table to track individual submissions by users through a journey
    CREATE TABLE IF NOT EXISTS submissions ( 
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for the submission
        user_id VARCHAR(12) NOT NULL,                            -- Identifier for the user making the submission (assumes a user system exists)
        journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE, -- Foreign key to the associated journey
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the submission was started
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Timestamp when the submission was last updated
    );

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'step_status') THEN
        CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
    END IF;

    -- Table to track progress of each step in a submission
    CREATE TABLE IF NOT EXISTS submission_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   -- Unique identifier for the submission step
        submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE, -- Foreign key to the submission
        step_id UUID REFERENCES journey_steps(id) ON DELETE CASCADE, -- Foreign key to the specific step in the journey
        data JSONB,                                      -- The data collected or processed for this step, stored in JSONB format
        status step_status NOT NULL DEFAULT 'pending',   -- Status of the step (pending, in_progress, completed, failed)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the step was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Timestamp of the last time the step was updated
    );
END$$;
