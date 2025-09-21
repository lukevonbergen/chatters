-- Migration: Enhance Google Reviews Integration
-- Adds website field, venue locking, and historical ratings tracking

-- 1) Add website field to venues table
ALTER TABLE public.venues 
  ADD COLUMN IF NOT EXISTS website text;

-- 2) Add venue_locked field to prevent Google venue changes  
ALTER TABLE public.venues 
  ADD COLUMN IF NOT EXISTS venue_locked boolean DEFAULT false;

-- 3) Add phone field to venues (if not exists) for Google auto-population
ALTER TABLE public.venues 
  ADD COLUMN IF NOT EXISTS phone text;

-- 4) Create historical_ratings table for tracking rating progression
CREATE TABLE IF NOT EXISTS public.historical_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('google')),
  rating numeric(3,2),               -- e.g. 4.35
  ratings_count integer,
  is_initial boolean DEFAULT false,  -- marks the first/baseline rating
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Add index for performance on historical queries
CREATE INDEX IF NOT EXISTS idx_historical_ratings_venue_source 
  ON public.historical_ratings(venue_id, source);

CREATE INDEX IF NOT EXISTS idx_historical_ratings_recorded_at 
  ON public.historical_ratings(recorded_at);

-- 6) RLS policies for historical_ratings table
ALTER TABLE public.historical_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read historical ratings for venues they have access to
CREATE POLICY "historical_ratings_select" ON public.historical_ratings
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
CREATE POLICY "historical_ratings_system_write" ON public.historical_ratings
  FOR ALL
  USING (false); -- Block all user writes, only service role can write

-- Add comments for documentation
COMMENT ON TABLE public.historical_ratings IS 'Historical tracking of Google ratings for progression analysis. Records taken every other day plus initial baseline.';
COMMENT ON COLUMN public.venues.venue_locked IS 'When true, prevents changes to Google venue selection (one-time setup only).';
COMMENT ON COLUMN public.venues.website IS 'Venue website URL, can be auto-populated from Google Places.';
COMMENT ON COLUMN public.historical_ratings.is_initial IS 'Marks the baseline rating when venue was first linked to Google.';