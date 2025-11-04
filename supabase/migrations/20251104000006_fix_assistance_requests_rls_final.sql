-- Comprehensive fix for assistance_requests RLS policy

-- Step 1: Drop any existing policies (just in case)
DROP POLICY IF EXISTS "Allow public to insert assistance requests" ON public.assistance_requests;
DROP POLICY IF EXISTS "Allow public insert to assistance_requests" ON public.assistance_requests;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.assistance_requests;

-- Step 2: Grant table permissions to anon role
GRANT INSERT ON public.assistance_requests TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 3: Create the INSERT policy for anonymous users
CREATE POLICY "Enable insert for anon users"
ON public.assistance_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Step 4: Verify the policy was created
-- Run this to check: SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'assistance_requests';
