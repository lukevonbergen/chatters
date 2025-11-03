-- Migration: Create venue_google_ratings and venue_tripadvisor_ratings tables
-- This replaces the external_ratings and historical_ratings tables with cleaner, platform-specific tables

-- Create venue_google_ratings table
CREATE TABLE IF NOT EXISTS public.venue_google_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  rating DECIMAL(2,1), -- e.g., 4.5
  ratings_count INTEGER DEFAULT 0, -- Total number of reviews
  is_initial BOOLEAN DEFAULT false, -- True for the first rating when integration is connected
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create venue_tripadvisor_ratings table
CREATE TABLE IF NOT EXISTS public.venue_tripadvisor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  rating DECIMAL(2,1), -- e.g., 4.5
  ratings_count INTEGER DEFAULT 0, -- Total number of reviews
  is_initial BOOLEAN DEFAULT false, -- True for the first rating when integration is connected
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_venue_google_ratings_venue_id ON public.venue_google_ratings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_google_ratings_recorded_at ON public.venue_google_ratings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_venue_tripadvisor_ratings_venue_id ON public.venue_tripadvisor_ratings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_tripadvisor_ratings_recorded_at ON public.venue_tripadvisor_ratings(recorded_at);

-- Migrate existing data from external_ratings to new tables (if they exist)
DO $$
BEGIN
  -- Migrate Google ratings from external_ratings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_ratings') THEN
    INSERT INTO public.venue_google_ratings (venue_id, rating, ratings_count, is_initial, recorded_at)
    SELECT
      venue_id,
      rating,
      ratings_count,
      true, -- Mark existing ratings as initial
      fetched_at
    FROM public.external_ratings
    WHERE source = 'google'
    ON CONFLICT DO NOTHING;

    -- Migrate TripAdvisor ratings from external_ratings
    INSERT INTO public.venue_tripadvisor_ratings (venue_id, rating, ratings_count, is_initial, recorded_at)
    SELECT
      venue_id,
      rating,
      ratings_count,
      true, -- Mark existing ratings as initial
      fetched_at
    FROM public.external_ratings
    WHERE source = 'tripadvisor'
    ON CONFLICT DO NOTHING;
  END IF;

  -- Migrate Google ratings from historical_ratings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historical_ratings') THEN
    INSERT INTO public.venue_google_ratings (venue_id, rating, ratings_count, is_initial, recorded_at)
    SELECT
      venue_id,
      rating,
      ratings_count,
      is_initial,
      recorded_at
    FROM public.historical_ratings
    WHERE source = 'google'
    ON CONFLICT DO NOTHING;

    -- Migrate TripAdvisor ratings from historical_ratings
    INSERT INTO public.venue_tripadvisor_ratings (venue_id, rating, ratings_count, is_initial, recorded_at)
    SELECT
      venue_id,
      rating,
      ratings_count,
      is_initial,
      recorded_at
    FROM public.historical_ratings
    WHERE source = 'tripadvisor'
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE public.venue_google_ratings IS 'Daily Google ratings history for venues. Each row represents a daily snapshot of the venue rating.';
COMMENT ON TABLE public.venue_tripadvisor_ratings IS 'Daily TripAdvisor ratings history for venues. Each row represents a daily snapshot of the venue rating.';
COMMENT ON COLUMN public.venue_google_ratings.is_initial IS 'True for the first rating recorded when the integration was connected';
COMMENT ON COLUMN public.venue_tripadvisor_ratings.is_initial IS 'True for the first rating recorded when the integration was connected';

-- Enable RLS
ALTER TABLE public.venue_google_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_tripadvisor_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venue_google_ratings
CREATE POLICY "Users can view ratings for their account venues"
  ON public.venue_google_ratings
  FOR SELECT
  USING (
    venue_id IN (
      SELECT v.id FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE u.id = auth.uid()
    )
  );

-- RLS Policies for venue_tripadvisor_ratings
CREATE POLICY "Users can view ratings for their account venues"
  ON public.venue_tripadvisor_ratings
  FOR SELECT
  USING (
    venue_id IN (
      SELECT v.id FROM public.venues v
      INNER JOIN public.users u ON u.account_id = v.account_id
      WHERE u.id = auth.uid()
    )
  );

-- Note: external_ratings and historical_ratings tables can be dropped manually after verifying the migration
-- To drop old tables (run manually after verification):
-- DROP TABLE IF EXISTS public.external_ratings;
-- DROP TABLE IF EXISTS public.historical_ratings;
