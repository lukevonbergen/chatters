-- NPS (Net Promoter Score) System
-- Allows venues to send follow-up emails asking customers to rate their likelihood to recommend (1-10)

-- Add NPS configuration to venues table
ALTER TABLE venues
ADD COLUMN nps_enabled BOOLEAN DEFAULT false,
ADD COLUMN nps_delay_hours INTEGER DEFAULT 24 CHECK (nps_delay_hours IN (12, 24, 36)),
ADD COLUMN nps_question TEXT DEFAULT 'How likely are you to recommend us to a friend or colleague?',
ADD COLUMN nps_cooldown_hours INTEGER DEFAULT 24 CHECK (nps_cooldown_hours > 0);

COMMENT ON COLUMN venues.nps_enabled IS 'Whether NPS follow-up emails are enabled for this venue';
COMMENT ON COLUMN venues.nps_delay_hours IS 'Hours to wait after visit before sending NPS email (12, 24, or 36)';
COMMENT ON COLUMN venues.nps_question IS 'Customizable NPS question shown to customers';
COMMENT ON COLUMN venues.nps_cooldown_hours IS 'Minimum hours between NPS emails to same customer (prevents spam)';

-- NPS submissions table
CREATE TABLE nps_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  session_id UUID REFERENCES feedback_sessions(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,

  -- Scheduling
  scheduled_send_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  send_error TEXT,

  -- Response
  score SMALLINT CHECK (score >= 0 AND score <= 10),
  responded_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate submissions
  UNIQUE(venue_id, customer_email, scheduled_send_at)
);

COMMENT ON TABLE nps_submissions IS 'NPS email requests and responses. Tracks scheduled sends, actual sends, and customer ratings (0-10).';
COMMENT ON COLUMN nps_submissions.scheduled_send_at IS 'When the NPS email should be sent (visit time + delay hours)';
COMMENT ON COLUMN nps_submissions.sent_at IS 'When the email was actually sent via Resend';
COMMENT ON COLUMN nps_submissions.score IS 'Customer rating: 0-6=detractor, 7-8=passive, 9-10=promoter';

-- Index for efficient querying
CREATE INDEX idx_nps_venue_created ON nps_submissions(venue_id, created_at DESC);
CREATE INDEX idx_nps_scheduled ON nps_submissions(scheduled_send_at) WHERE sent_at IS NULL;
CREATE INDEX idx_nps_email_recent ON nps_submissions(customer_email, created_at DESC);

-- Enable RLS
ALTER TABLE nps_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view NPS for their venues"
  ON nps_submissions FOR SELECT
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

CREATE POLICY "Service role can manage NPS"
  ON nps_submissions FOR ALL
  USING (auth.role() = 'service_role');

-- Function to check if customer is within cooldown period
CREATE OR REPLACE FUNCTION check_nps_cooldown(
  p_venue_id UUID,
  p_customer_email TEXT,
  p_cooldown_hours INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM nps_submissions
    WHERE venue_id = p_venue_id
    AND customer_email = p_customer_email
    AND created_at > NOW() - (p_cooldown_hours || ' hours')::INTERVAL
  );
END;
$$;

COMMENT ON FUNCTION check_nps_cooldown IS 'Returns true if customer can receive another NPS email (not within cooldown period)';
