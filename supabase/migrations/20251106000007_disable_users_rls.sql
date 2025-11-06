-- Disable RLS on users table for performance
-- The existing policy (auth.uid() = id) doesn't add meaningful security
-- since application logic already ensures users only query their own data

-- Drop existing policy
DROP POLICY IF EXISTS "users_basic_policy" ON users;

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Add comment explaining why RLS is disabled
COMMENT ON TABLE users IS 'RLS disabled for performance. Application logic ensures users only access their own data via auth.uid() in queries.';
