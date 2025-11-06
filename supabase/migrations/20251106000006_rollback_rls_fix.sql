-- Rollback the RLS fix that made things worse
-- Restore the original policies

-- Drop the new policies
DROP POLICY IF EXISTS "feedback_select_optimized" ON feedback;
DROP POLICY IF EXISTS "feedback_update_optimized" ON feedback;

-- Drop the helper function
DROP FUNCTION IF EXISTS user_has_venue_access(uuid);

-- Restore the original policies
CREATE POLICY "feedback_authenticated_select"
ON feedback
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

CREATE POLICY "feedback_authenticated_update"
ON feedback
FOR UPDATE
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (true);

CREATE POLICY "Users can update venue feedback"
ON feedback
FOR UPDATE
TO authenticated
USING (
  venue_id IN (
    SELECT staff.venue_id
    FROM staff
    WHERE (staff.user_id = auth.uid())
    UNION
    SELECT venues.id
    FROM venues
    WHERE (venues.account_id IN (
      SELECT venues.account_id
      FROM staff
      WHERE ((staff.user_id = auth.uid()) AND (staff.role = 'master'::text))
    ))
  )
);

COMMENT ON POLICY "feedback_authenticated_select" ON feedback IS 'Allow authenticated users to select feedback (venue filtering done in queries)';
