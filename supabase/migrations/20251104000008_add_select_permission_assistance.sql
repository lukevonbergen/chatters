-- Add SELECT permission for anon users to read their own assistance requests
-- This is needed because the insert query uses .select() to return the inserted row

-- Grant SELECT permission to anon role
GRANT SELECT ON public.assistance_requests TO anon;

-- Create a SELECT policy for anon users (allow reading all assistance requests)
CREATE POLICY "anon_select_assistance_requests"
ON public.assistance_requests
AS PERMISSIVE
FOR SELECT
TO anon
USING (true);

-- Verify both policies exist
SELECT
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'assistance_requests'
ORDER BY cmd, policyname;
