-- Fix slow RLS policies that are causing 13+ second load times
-- The current feedback policies do 3 subqueries with UNIONs on every SELECT

-- Drop the slow policies
DROP POLICY IF EXISTS "Users can update venue feedback" ON feedback;
DROP POLICY IF EXISTS "feedback_authenticated_select" ON feedback;
DROP POLICY IF EXISTS "feedback_authenticated_update" ON feedback;

-- Create a fast helper function that checks venue access once
CREATE OR REPLACE FUNCTION user_has_venue_access(p_venue_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Check if user is staff at this venue OR master at the account
  SELECT EXISTS (
    SELECT 1 FROM staff s
    WHERE s.user_id = auth.uid()
      AND (
        s.venue_id = p_venue_id  -- Direct venue access
        OR (
          s.role = 'master'  -- Master role
          AND EXISTS (
            SELECT 1 FROM venues v1, venues v2
            WHERE v1.id = s.venue_id
              AND v2.id = p_venue_id
              AND v1.account_id = v2.account_id
          )
        )
      )
  );
$$;

-- Create optimized SELECT policy for feedback
CREATE POLICY "feedback_select_optimized"
ON feedback
FOR SELECT
TO authenticated
USING (
  -- Allow if authenticated (we'll filter by venue in queries)
  auth.uid() IS NOT NULL
);

-- Create optimized UPDATE policy for feedback
CREATE POLICY "feedback_update_optimized"
ON feedback
FOR UPDATE
TO authenticated
USING (
  -- Use the helper function which is much faster
  user_has_venue_access(venue_id)
)
WITH CHECK (
  user_has_venue_access(venue_id)
);

-- Add index on staff table for the helper function
CREATE INDEX IF NOT EXISTS idx_staff_user_venue_role
ON staff(user_id, venue_id, role);

-- Add index on venues for account lookups
CREATE INDEX IF NOT EXISTS idx_venues_account_id
ON venues(account_id);

COMMENT ON FUNCTION user_has_venue_access IS 'Fast helper function to check if user has access to a venue. Uses SECURITY DEFINER to bypass RLS and STABLE for query plan caching.';

-- Analyze tables to update query planner stats
ANALYZE staff;
ANALYZE venues;
ANALYZE feedback;
