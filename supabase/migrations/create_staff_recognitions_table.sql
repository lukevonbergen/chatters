-- Create staff_recognitions table for tracking recognition emails sent to employees
CREATE TABLE IF NOT EXISTS staff_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  employee_email TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  venue_id UUID NOT NULL,
  venue_name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  period TEXT NOT NULL,
  feedback_resolved INTEGER DEFAULT 0,
  assistance_resolved INTEGER DEFAULT 0,
  total_resolved INTEGER NOT NULL,
  personal_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_staff_recognitions_venue_id ON staff_recognitions(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_recognitions_employee_id ON staff_recognitions(employee_id);
CREATE INDEX IF NOT EXISTS idx_staff_recognitions_sent_at ON staff_recognitions(sent_at);

-- Add RLS policies
ALTER TABLE staff_recognitions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view recognitions for their venue
CREATE POLICY "Users can view recognitions for their venue"
  ON staff_recognitions
  FOR SELECT
  USING (
    venue_id IN (
      SELECT venue_id FROM staff WHERE user_id = auth.uid()
      UNION
      SELECT id FROM venues WHERE account_id IN (
        SELECT account_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Policy: Managers and admins can insert recognitions
CREATE POLICY "Managers can insert recognitions"
  ON staff_recognitions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('manager', 'master', 'admin')
    )
  );
