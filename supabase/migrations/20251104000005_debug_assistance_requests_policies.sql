-- Query all existing policies on assistance_requests table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'assistance_requests';

-- Check all grants for the anon role on assistance_requests
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name='assistance_requests';

-- Check sequence grants for anon role
SELECT grantee, object_schema, object_name, privilege_type
FROM information_schema.usage_privileges
WHERE grantee = 'anon' AND object_schema = 'public' AND object_type = 'SEQUENCE';

-- Check if RLS is enabled on the table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'assistance_requests';
