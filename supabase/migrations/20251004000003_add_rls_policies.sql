-- Add RLS policies for tables that are currently unrestricted
-- This ensures data security based on user roles and venue membership

-- ============================================================================
-- EMPLOYEES TABLE
-- ============================================================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Staff members can view employees in their venue
CREATE POLICY "Staff can view employees in their venue"
  ON public.employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = employees.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    -- Master users can view employees in venues under their account
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = employees.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    -- Admins can view all employees
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Staff members can insert employees in their venue
CREATE POLICY "Staff can insert employees in their venue"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = employees.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = employees.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Staff members can update employees in their venue
CREATE POLICY "Staff can update employees in their venue"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = employees.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = employees.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Staff members can delete employees in their venue
CREATE POLICY "Staff can delete employees in their venue"
  ON public.employees FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = employees.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = employees.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ============================================================================
-- STAFF_ROLES TABLE
-- ============================================================================
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles for their venues"
  ON public.staff_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = staff_roles.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = staff_roles.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can manage roles for their venues"
  ON public.staff_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = staff_roles.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = staff_roles.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ============================================================================
-- STAFF_LOCATIONS TABLE
-- ============================================================================
ALTER TABLE public.staff_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view locations for their venues"
  ON public.staff_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = staff_locations.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = staff_locations.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can manage locations for their venues"
  ON public.staff_locations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = staff_locations.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = staff_locations.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ============================================================================
-- ASSISTANCE_REQUESTS TABLE
-- ============================================================================
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assistance requests for their venues"
  ON public.assistance_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = assistance_requests.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = assistance_requests.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can manage assistance requests for their venues"
  ON public.assistance_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = assistance_requests.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = assistance_requests.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ============================================================================
-- ZONES TABLE
-- ============================================================================
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view zones for their venues"
  ON public.zones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = zones.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = zones.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can manage zones for their venues"
  ON public.zones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = zones.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = zones.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE_POSITIONS TABLE
-- ============================================================================
ALTER TABLE public.table_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view table positions for their venues"
  ON public.table_positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = table_positions.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = table_positions.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can manage table positions for their venues"
  ON public.table_positions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.venue_id = table_positions.venue_id
        AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE v.id = table_positions.venue_id
        AND u.id = auth.uid()
        AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ============================================================================
-- STAFF_RECOGNITIONS TABLE
-- ============================================================================
ALTER TABLE public.staff_recognitions ENABLE ROW LEVEL SECURITY;

-- Anyone can view recognitions (they're read from employee data which is already protected)
CREATE POLICY "Authenticated users can view staff recognitions"
  ON public.staff_recognitions FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete recognitions (these are system-generated)
CREATE POLICY "Admins can manage staff recognitions"
  ON public.staff_recognitions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ============================================================================
-- USERS TABLE (Restricted - only allow viewing own profile)
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Only admins can create users
CREATE POLICY "Admins can create users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Users can update their own profile, admins can update any
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Only admins can delete users
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistance_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_positions TO authenticated;
GRANT SELECT ON public.staff_recognitions TO authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated;
