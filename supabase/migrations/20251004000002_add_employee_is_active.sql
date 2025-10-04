-- Add is_active field to employees table to support pausing employees
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for filtering active employees
CREATE INDEX IF NOT EXISTS employees_is_active_idx ON public.employees(is_active);

-- Add comment
COMMENT ON COLUMN public.employees.is_active IS 'Whether the employee is currently active. Paused employees have is_active=false.';
