-- Create user_dashboard_tiles table for storing configurable multi-venue metric tiles
CREATE TABLE IF NOT EXISTS public.user_dashboard_tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'total_feedback',
    'resolved_feedback',
    'avg_satisfaction',
    'unresolved_alerts',
    'best_staff',
    'google_rating',
    'tripadvisor_rating'
  )),
  position INTEGER NOT NULL CHECK (position >= 0 AND position <= 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_position UNIQUE (user_id, position)
);

-- Enable RLS
ALTER TABLE public.user_dashboard_tiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own tiles
CREATE POLICY "Users can view their own tiles"
  ON public.user_dashboard_tiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tiles"
  ON public.user_dashboard_tiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tiles"
  ON public.user_dashboard_tiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tiles"
  ON public.user_dashboard_tiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_dashboard_tiles_user_id ON public.user_dashboard_tiles(user_id);
