-- Add policies for authenticated users to read/update assistance requests
-- The Kiosk page needs to be able to read and update assistance requests

-- Check current policies
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    CASE WHEN qual IS NULL THEN 'N/A' ELSE 'Has USING clause' END as using_clause,
    CASE WHEN with_check IS NULL THEN 'N/A' ELSE 'Has WITH CHECK clause' END as check_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'assistance_requests'
ORDER BY cmd, policyname;

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON public.assistance_requests TO authenticated;

-- Create SELECT policy for authenticated users (staff/managers viewing the kiosk)
CREATE POLICY "authenticated_select_assistance_requests"
ON public.assistance_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

-- Create UPDATE policy for authenticated users (to mark as acknowledged/resolved)
CREATE POLICY "authenticated_update_assistance_requests"
ON public.assistance_requests
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify all policies
SELECT
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'assistance_requests'
ORDER BY cmd, policyname;
