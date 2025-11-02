-- Apply venue ratings tables migration
-- Run this with: psql <connection_string> -f apply_rating_tables.sql

-- Create venue_google_ratings table
CREATE TABLE IF NOT EXISTS public.venue_google_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  rating DECIMAL(2,1),
  ratings_count INTEGER DEFAULT 0,
  is_initial BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create venue_tripadvisor_ratings table
CREATE TABLE IF NOT EXISTS public.venue_tripadvisor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  rating DECIMAL(2,1),
  ratings_count INTEGER DEFAULT 0,
  is_initial BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_venue_google_ratings_venue_id ON public.venue_google_ratings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_google_ratings_recorded_at ON public.venue_google_ratings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_venue_tripadvisor_ratings_venue_id ON public.venue_tripadvisor_ratings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_tripadvisor_ratings_recorded_at ON public.venue_tripadvisor_ratings(recorded_at);

-- Enable RLS
ALTER TABLE public.venue_google_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_tripadvisor_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view ratings for their account venues" ON public.venue_google_ratings;
DROP POLICY IF EXISTS "Users can view ratings for their account venues" ON public.venue_tripadvisor_ratings;

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

-- Comments
COMMENT ON TABLE public.venue_google_ratings IS 'Daily Google ratings history for venues. Each row represents a daily snapshot.';
COMMENT ON TABLE public.venue_tripadvisor_ratings IS 'Daily TripAdvisor ratings history for venues. Each row represents a daily snapshot.';

SELECT 'Tables created successfully!' as status;
