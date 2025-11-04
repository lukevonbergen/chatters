-- Allow public (anonymous) users to insert assistance requests
-- This is needed for the customer feedback page where users can request assistance without authentication

CREATE POLICY "Allow public insert to assistance_requests"
  ON public.assistance_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Grant INSERT permission to anon role
GRANT INSERT ON public.assistance_requests TO anon;
