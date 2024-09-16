ALTER TABLE organisation_user_configurations
ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();