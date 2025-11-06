-- Create custom_dashboard_tiles table for user-customizable dashboard
CREATE TABLE IF NOT EXISTS custom_dashboard_tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  position integer NOT NULL,
  size text DEFAULT 'medium', -- small, medium, large for future flexibility
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, position)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_dashboard_tiles_user_id ON custom_dashboard_tiles(user_id);

-- Add RLS policies
ALTER TABLE custom_dashboard_tiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own tiles
CREATE POLICY "Users can view their own custom dashboard tiles"
  ON custom_dashboard_tiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom dashboard tiles"
  ON custom_dashboard_tiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom dashboard tiles"
  ON custom_dashboard_tiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom dashboard tiles"
  ON custom_dashboard_tiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_dashboard_tiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_dashboard_tiles_updated_at
  BEFORE UPDATE ON custom_dashboard_tiles
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_dashboard_tiles_updated_at();
