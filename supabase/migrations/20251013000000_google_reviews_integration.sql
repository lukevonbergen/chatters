-- Google Reviews Integration Schema
-- Created: 2025-10-13
-- This migration creates tables for Google Business Profile integration

-- ============================================
-- 1. GOOGLE CONNECTIONS TABLE
-- Stores OAuth tokens for venue's Google Business Profile connection
-- ============================================
CREATE TABLE IF NOT EXISTS google_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_account_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id) -- One venue can only have one Google connection
);

CREATE INDEX idx_google_connections_venue ON google_connections(venue_id);
CREATE INDEX idx_google_connections_user ON google_connections(user_id);

-- ============================================
-- 2. GOOGLE LOCATIONS TABLE
-- Stores Google Business Profile location details
-- ============================================
CREATE TABLE IF NOT EXISTS google_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_connection_id UUID NOT NULL REFERENCES google_connections(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL UNIQUE, -- Google's location ID (e.g., "accounts/123/locations/456")
  location_name TEXT NOT NULL,
  address TEXT,
  phone_number TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_google_locations_connection ON google_locations(google_connection_id);
CREATE INDEX idx_google_locations_active ON google_locations(is_active);

-- ============================================
-- 3. GOOGLE REVIEWS TABLE
-- Stores individual Google reviews
-- ============================================
CREATE TABLE IF NOT EXISTS google_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES google_locations(id) ON DELETE CASCADE,
  google_review_id TEXT UNIQUE NOT NULL, -- Google's review ID
  reviewer_name TEXT,
  reviewer_profile_photo TEXT,
  star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  review_text TEXT,
  review_date TIMESTAMP WITH TIME ZONE NOT NULL,
  review_reply TEXT,
  reply_date TIMESTAMP WITH TIME ZONE,
  replied_by_user_id UUID REFERENCES auth.users(id),
  is_replied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_google_reviews_location ON google_reviews(location_id);
CREATE INDEX idx_google_reviews_replied ON google_reviews(is_replied);
CREATE INDEX idx_google_reviews_date ON google_reviews(review_date DESC);
CREATE INDEX idx_google_reviews_rating ON google_reviews(star_rating);

-- ============================================
-- 4. VENUE PERMISSIONS TABLE
-- Controls manager access to Google reviews
-- ============================================
CREATE TABLE IF NOT EXISTS venue_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  can_view_google_reviews BOOLEAN DEFAULT false,
  can_reply_to_google_reviews BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id)
);

CREATE INDEX idx_venue_permissions_venue ON venue_permissions(venue_id);

-- ============================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_connections_updated_at
  BEFORE UPDATE ON google_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_locations_updated_at
  BEFORE UPDATE ON google_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_reviews_updated_at
  BEFORE UPDATE ON google_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_permissions_updated_at
  BEFORE UPDATE ON venue_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GOOGLE CONNECTIONS POLICIES
-- ============================================

-- Admin users can see all connections
CREATE POLICY "Admins can view all google connections"
  ON google_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Master users can see connections for venues in their account
CREATE POLICY "Master users can view their account's google connections"
  ON google_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN venues ON venues.account_id = users.account_id
      WHERE users.id = auth.uid()
      AND users.role = 'master'
      AND venues.id = google_connections.venue_id
    )
  );

-- Manager users can see connections for their assigned venues (if permission granted)
CREATE POLICY "Managers can view their venue's google connections"
  ON google_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN staff ON staff.user_id = users.id
      JOIN venue_permissions vp ON vp.venue_id = staff.venue_id
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
      AND staff.venue_id = google_connections.venue_id
      AND vp.can_view_google_reviews = true
    )
  );

-- Master users can insert connections for venues in their account
CREATE POLICY "Master users can insert google connections"
  ON google_connections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      JOIN venues ON venues.account_id = users.account_id
      WHERE users.id = auth.uid()
      AND users.role = 'master'
      AND venues.id = google_connections.venue_id
    )
  );

-- Master users can update connections for venues in their account
CREATE POLICY "Master users can update google connections"
  ON google_connections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN venues ON venues.account_id = users.account_id
      WHERE users.id = auth.uid()
      AND users.role = 'master'
      AND venues.id = google_connections.venue_id
    )
  );

-- Master users can delete connections for venues in their account
CREATE POLICY "Master users can delete google connections"
  ON google_connections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN venues ON venues.account_id = users.account_id
      WHERE users.id = auth.uid()
      AND users.role = 'master'
      AND venues.id = google_connections.venue_id
    )
  );

-- ============================================
-- GOOGLE LOCATIONS POLICIES
-- ============================================

-- Users can view locations if they can see the connection
CREATE POLICY "Users can view their google locations"
  ON google_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM google_connections gc
      WHERE gc.id = google_locations.google_connection_id
    )
  );

-- System can insert/update locations (no user policy needed for automated sync)
CREATE POLICY "Service role can manage google locations"
  ON google_locations FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- GOOGLE REVIEWS POLICIES
-- ============================================

-- Admin users can see all reviews
CREATE POLICY "Admins can view all google reviews"
  ON google_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Master users can see reviews for venues in their account
CREATE POLICY "Master users can view their account's google reviews"
  ON google_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN venues ON venues.account_id = users.account_id
      JOIN google_connections gc ON gc.venue_id = venues.id
      JOIN google_locations gl ON gl.google_connection_id = gc.id
      WHERE users.id = auth.uid()
      AND users.role = 'master'
      AND gl.id = google_reviews.location_id
    )
  );

-- Manager users can see reviews for their assigned venues (if permission granted)
CREATE POLICY "Managers can view their venue's google reviews"
  ON google_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN staff ON staff.user_id = users.id
      JOIN venue_permissions vp ON vp.venue_id = staff.venue_id
      JOIN google_connections gc ON gc.venue_id = staff.venue_id
      JOIN google_locations gl ON gl.google_connection_id = gc.id
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
      AND vp.can_view_google_reviews = true
      AND gl.id = google_reviews.location_id
    )
  );

-- Master and managers (with permission) can update reviews (for replying)
CREATE POLICY "Authorized users can update google reviews"
  ON google_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN venues ON venues.account_id = users.account_id
      JOIN google_connections gc ON gc.venue_id = venues.id
      JOIN google_locations gl ON gl.google_connection_id = gc.id
      WHERE users.id = auth.uid()
      AND users.role = 'master'
      AND gl.id = google_reviews.location_id
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      JOIN staff ON staff.user_id = users.id
      JOIN venue_permissions vp ON vp.venue_id = staff.venue_id
      JOIN google_connections gc ON gc.venue_id = staff.venue_id
      JOIN google_locations gl ON gl.google_connection_id = gc.id
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
      AND vp.can_reply_to_google_reviews = true
      AND gl.id = google_reviews.location_id
    )
  );

-- System can insert reviews (no user policy needed for automated sync)
CREATE POLICY "Service role can manage google reviews"
  ON google_reviews FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VENUE PERMISSIONS POLICIES
-- ============================================

-- Master users can manage permissions for their venues
CREATE POLICY "Master users can manage venue permissions"
  ON venue_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN venues ON venues.account_id = users.account_id
      WHERE users.id = auth.uid()
      AND users.role = 'master'
      AND venues.id = venue_permissions.venue_id
    )
  );

-- Managers can view permissions for their venues
CREATE POLICY "Managers can view their venue permissions"
  ON venue_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN staff ON staff.user_id = users.id
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
      AND staff.venue_id = venue_permissions.venue_id
    )
  );

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default permissions for all existing venues
INSERT INTO venue_permissions (venue_id, can_view_google_reviews, can_reply_to_google_reviews)
SELECT id, false, false FROM venues
ON CONFLICT (venue_id) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Google Reviews Integration schema created successfully!';
  RAISE NOTICE 'Tables created: google_connections, google_locations, google_reviews, venue_permissions';
  RAISE NOTICE 'Default permissions added for all existing venues';
END $$;
