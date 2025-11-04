-- Remove secondary_color from venues table as it's no longer used
-- The feedback page now uses: background_color, text_color, and primary_color

ALTER TABLE venues
DROP COLUMN IF EXISTS secondary_color;
