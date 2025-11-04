-- Add button text color to venues table

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS button_text_color TEXT DEFAULT '#ffffff';

COMMENT ON COLUMN public.venues.button_text_color IS 'Color of text on buttons (default white)';
