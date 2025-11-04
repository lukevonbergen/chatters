-- Complete verification and fix for assistance_requests RLS

-- First, let's see what the current state is
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'assistance_requests';

-- Check table grants
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'assistance_requests';

-- Now let's completely reset and fix the RLS policies
-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assistance_requests')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.assistance_requests', r.policyname);
    END LOOP;
END $$;

-- Grant permissions to anon role
GRANT INSERT ON public.assistance_requests TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Create a permissive INSERT policy for anon users
CREATE POLICY "anon_insert_assistance_requests"
ON public.assistance_requests
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (true);

-- Verify the policy was created
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'assistance_requests';
