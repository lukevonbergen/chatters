-- Add background_color and text_color to venues table for full branding customization
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#111827';

-- Add comments to explain the new columns
COMMENT ON COLUMN venues.background_color IS 'Background color for customer-facing feedback pages (hex color code)';
COMMENT ON COLUMN venues.text_color IS 'Text color for customer-facing feedback pages (hex color code)';
