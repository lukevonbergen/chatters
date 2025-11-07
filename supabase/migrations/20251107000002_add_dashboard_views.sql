-- Create dashboard_views table for multiple named dashboard configurations
CREATE TABLE IF NOT EXISTS dashboard_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add view_id to custom_dashboard_tiles to link tiles to specific views
ALTER TABLE custom_dashboard_tiles
ADD COLUMN IF NOT EXISTS view_id UUID REFERENCES dashboard_views(id) ON DELETE CASCADE;

-- Drop the old unique constraint on (user_id, position) if it exists
-- This constraint is no longer valid since tiles are now scoped to views
ALTER TABLE custom_dashboard_tiles
DROP CONSTRAINT IF EXISTS custom_dashboard_tiles_user_id_position_key;

-- Create new unique constraint on (view_id, position) instead
-- This ensures tile positions are unique within each view
ALTER TABLE custom_dashboard_tiles
ADD CONSTRAINT custom_dashboard_tiles_view_id_position_key
UNIQUE (view_id, position);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_views_user_id ON dashboard_views(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tiles_view_id ON custom_dashboard_tiles(view_id);

-- Ensure each user has at least one view and only one default
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_views_user_default
ON dashboard_views(user_id, is_default)
WHERE is_default = true;

COMMENT ON TABLE dashboard_views IS 'Named dashboard view configurations for users';
COMMENT ON COLUMN dashboard_views.name IS 'User-defined name for the dashboard view (e.g., "Sales View", "Operations View")';
COMMENT ON COLUMN dashboard_views.is_default IS 'Whether this is the default view shown when user visits dashboard';
COMMENT ON COLUMN dashboard_views.position IS 'Display order for view tabs';
COMMENT ON COLUMN custom_dashboard_tiles.view_id IS 'Links tile to a specific dashboard view';
