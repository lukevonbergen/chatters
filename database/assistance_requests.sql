-- Create assistance_requests table for customer assistance notifications
CREATE TABLE assistance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) NOT NULL,
  table_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  message TEXT DEFAULT 'Just need assistance - Our team will be right with you',
  created_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES staff(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES staff(id),
  notes TEXT
);

-- Create index for efficient queries
CREATE INDEX idx_assistance_requests_venue_status ON assistance_requests(venue_id, status);
CREATE INDEX idx_assistance_requests_created ON assistance_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access assistance requests for their venues
CREATE POLICY "Users can access assistance requests for their venues" ON assistance_requests
FOR ALL USING (
  venue_id IN (
    SELECT venue_id FROM staff WHERE user_id = auth.uid()
    UNION
    SELECT v.id FROM venues v 
    JOIN accounts a ON v.account_id = a.id
    JOIN users u ON u.account_id = a.id
    WHERE u.id = auth.uid() AND u.role = 'master'
  )
);

-- RLS Policy: Admin users can access all assistance requests
CREATE POLICY "Admins can access all assistance requests" ON assistance_requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policy: Allow anonymous inserts for customer requests
CREATE POLICY "Allow anonymous assistance requests" ON assistance_requests
FOR INSERT WITH CHECK (true);

COMMENT ON TABLE assistance_requests IS 'Customer assistance requests when they need help but not formal feedback';
COMMENT ON COLUMN assistance_requests.status IS 'pending: new request, acknowledged: staff seen it, resolved: assistance provided';
COMMENT ON COLUMN assistance_requests.table_number IS 'Table number requesting assistance';
COMMENT ON COLUMN assistance_requests.message IS 'Default or custom assistance message';