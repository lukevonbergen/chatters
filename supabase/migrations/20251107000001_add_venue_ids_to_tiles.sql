-- Add venue_ids column to custom_dashboard_tiles table for multi-venue support

ALTER TABLE custom_dashboard_tiles
ADD COLUMN IF NOT EXISTS venue_ids TEXT[] DEFAULT NULL;

COMMENT ON COLUMN custom_dashboard_tiles.venue_ids IS 'Array of venue IDs for multi-venue tiles (feedback_chart). NULL means use current venue only.';
