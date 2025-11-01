-- Add first_name and last_name columns to manager_invitations table if they don't exist
ALTER TABLE manager_invitations
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing invitations to have empty strings instead of NULL
UPDATE manager_invitations
SET first_name = '', last_name = ''
WHERE first_name IS NULL OR last_name IS NULL;
