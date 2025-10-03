-- Fix RLS policies for feedback_sessions to allow public inserts from customer feedback page

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert feedback sessions" ON feedback_sessions;
DROP POLICY IF EXISTS "Users can view feedback sessions for their venues" ON feedback_sessions;

-- Allow public inserts (anyone can create a feedback session)
CREATE POLICY "Allow public insert feedback sessions"
  ON feedback_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to view sessions for their venues
CREATE POLICY "Users can view feedback sessions for their venues"
  ON feedback_sessions FOR SELECT
  USING (
    venue_id IN (
      SELECT v.id FROM venues v
      JOIN accounts a ON v.account_id = a.id
      JOIN users u ON u.account_id = a.id
      WHERE u.id = auth.uid()
    )
    OR
    venue_id IN (
      SELECT s.venue_id FROM staff s
      WHERE s.user_id = auth.uid()
    )
  );

-- Allow service role to do everything
CREATE POLICY "Service role can manage feedback sessions"
  ON feedback_sessions FOR ALL
  USING (auth.role() = 'service_role');
