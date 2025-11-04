-- Create email_change_requests table
CREATE TABLE IF NOT EXISTS public.email_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_change_requests_token ON public.email_change_requests(token);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_user_id ON public.email_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_expires_at ON public.email_change_requests(expires_at);

-- Enable RLS
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own email change requests
CREATE POLICY "Users can view own email change requests"
  ON public.email_change_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for the edge function)
CREATE POLICY "Service role can manage email change requests"
  ON public.email_change_requests
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Add comment
COMMENT ON TABLE public.email_change_requests IS 'Stores email change verification requests with tokens';
