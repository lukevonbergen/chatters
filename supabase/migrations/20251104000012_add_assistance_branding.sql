-- Add assistance message branding fields to venues table

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS assistance_title TEXT DEFAULT 'Help is on the way!',
ADD COLUMN IF NOT EXISTS assistance_message TEXT DEFAULT 'We''ve notified our team that you need assistance. Someone will be with you shortly.',
ADD COLUMN IF NOT EXISTS assistance_icon TEXT DEFAULT 'hand-heart';

-- Add comment explaining the fields
COMMENT ON COLUMN public.venues.assistance_title IS 'Title shown on assistance request confirmation page';
COMMENT ON COLUMN public.venues.assistance_message IS 'Message shown on assistance request confirmation page. Use {table} placeholder for table number.';
COMMENT ON COLUMN public.venues.assistance_icon IS 'Icon identifier for assistance confirmation (hand-heart, bell, user-check, etc)';
