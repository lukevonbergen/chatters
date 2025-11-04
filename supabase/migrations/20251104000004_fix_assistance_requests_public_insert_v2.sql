-- Drop the previous policy if it exists
DROP POLICY IF EXISTS "Allow public insert to assistance_requests" ON public.assistance_requests;

-- Allow anyone (including anonymous users) to insert assistance requests
-- This is necessary for the customer feedback page
CREATE POLICY "Allow public to insert assistance requests"
  ON public.assistance_requests
  FOR INSERT
  WITH CHECK (true);

-- Ensure anon role has the necessary permissions
GRANT INSERT ON public.assistance_requests TO anon;
GRANT USAGE ON SEQUENCE public.assistance_requests_id_seq TO anon;
