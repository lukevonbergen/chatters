-- Allow public (unauthenticated) access to table_positions for customer feedback page
-- Customers need to see table numbers when filling out feedback forms

CREATE POLICY "Public can view table positions"
  ON public.table_positions FOR SELECT
  TO anon
  USING (true);

-- Grant SELECT permission to anonymous users
GRANT SELECT ON public.table_positions TO anon;
