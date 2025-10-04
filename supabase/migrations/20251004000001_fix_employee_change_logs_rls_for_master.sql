-- Fix RLS policy for employee_change_logs to include master role users
-- Master users should be able to see change logs for employees in venues they own

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view change logs for their venue employees" ON public.employee_change_logs;

-- Create updated policy that includes master role
CREATE POLICY "Users can view change logs for their venue employees"
  ON public.employee_change_logs
  FOR SELECT
  TO authenticated
  USING (
    -- Staff members can see logs for their venue's employees
    EXISTS (
      SELECT 1
      FROM public.employees e
      INNER JOIN public.staff s ON s.venue_id = e.venue_id
      WHERE e.id = employee_change_logs.employee_id
        AND s.user_id = auth.uid()
    )
    OR
    -- Master users can see logs for employees in venues under their account
    EXISTS (
      SELECT 1
      FROM public.employees e
      INNER JOIN public.venues v ON v.id = e.venue_id
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE e.id = employee_change_logs.employee_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    -- Admins can see all logs
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );
