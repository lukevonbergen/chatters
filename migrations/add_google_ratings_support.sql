-- Migration: Add Google ratings support
-- Run this migration to add Google Place ID and external ratings support

-- 1) Add Place ID to venues
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS place_id text;

-- 2) Cache table for third-party ratings
CREATE TABLE IF NOT EXISTS public.external_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('google')),
  rating numeric(3,2),               -- e.g. 4.35
  ratings_count integer,
  attributions jsonb,                -- array of strings
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, source)
);

-- 3) RLS policies for external_ratings table
ALTER TABLE public.external_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read ratings for venues they have access to
CREATE POLICY "external_ratings_select" ON public.external_ratings
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Admin users can see all
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      -- Master users can see ratings for venues in their account
      EXISTS (
        SELECT 1 FROM public.venues v
        JOIN public.users u ON v.account_id = u.account_id
        WHERE v.id = venue_id 
          AND u.id = auth.uid() 
          AND u.role = 'master'
      )
      OR
      -- Manager users can see ratings for venues they're assigned to
      EXISTS (
        SELECT 1 FROM public.staff s
        WHERE s.venue_id = venue_id 
          AND s.user_id = auth.uid()
      )
    )
  );

-- Policy: Only allow system-level inserts/updates (via service role)
-- This will be used by our API endpoints with elevated permissions
CREATE POLICY "external_ratings_system_write" ON public.external_ratings
  FOR ALL
  USING (false); -- Block all user writes, only service role can write

-- Add comment for documentation
COMMENT ON TABLE public.external_ratings IS 'Cache for third-party ratings (Google, etc.) with 24-hour TTL. Only stores latest snapshot per venue/source.';