-- Create employee_change_logs table to track all changes to employee records
CREATE TABLE IF NOT EXISTS public.employee_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS employee_change_logs_employee_id_idx ON public.employee_change_logs(employee_id);
CREATE INDEX IF NOT EXISTS employee_change_logs_changed_at_idx ON public.employee_change_logs(changed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.employee_change_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to view change logs for employees in their venue
CREATE POLICY "Users can view change logs for their venue employees"
  ON public.employee_change_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.employees e
      INNER JOIN public.staff s ON s.venue_id = e.venue_id
      WHERE e.id = employee_change_logs.employee_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Allow authenticated users to insert change logs
CREATE POLICY "Authenticated users can insert change logs"
  ON public.employee_change_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.employee_change_logs TO authenticated;

-- Add comment
COMMENT ON TABLE public.employee_change_logs IS 'Tracks all changes made to employee records for audit purposes';
