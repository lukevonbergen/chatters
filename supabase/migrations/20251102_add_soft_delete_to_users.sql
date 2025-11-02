-- Add soft delete columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Create index for deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- Add comment
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when user was soft-deleted. NULL means user is active. Users can be recovered within 14 days.';
COMMENT ON COLUMN users.deleted_by IS 'ID of the user who deleted this user';
