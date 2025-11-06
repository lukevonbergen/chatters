-- Performance Analysis: Check existing indexes and suggest improvements

-- Show all indexes for key tables
DO $$
DECLARE
    table_name text;
    tables text[] := ARRAY['feedback', 'assistance_requests', 'nps_submissions', 'employees', 'venues', 'users', 'staff', 'custom_dashboard_tiles'];
BEGIN
    RAISE NOTICE '=== EXISTING INDEXES ===';
    FOREACH table_name IN ARRAY tables
    LOOP
        RAISE NOTICE '';
        RAISE NOTICE 'Table: %', table_name;
        FOR rec IN
            SELECT
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = table_name
        LOOP
            RAISE NOTICE '  Index: % - %', rec.indexname, rec.indexdef;
        END LOOP;
    END LOOP;
END $$;

-- Create missing indexes for commonly queried columns
-- These indexes will significantly improve query performance

-- Feedback table indexes
CREATE INDEX IF NOT EXISTS idx_feedback_venue_id_created_at
    ON feedback(venue_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_session_id
    ON feedback(session_id);

CREATE INDEX IF NOT EXISTS idx_feedback_resolved_by
    ON feedback(resolved_by) WHERE resolved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_co_resolver
    ON feedback(co_resolver_id) WHERE co_resolver_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_resolved_at
    ON feedback(resolved_at DESC) WHERE resolved_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_rating
    ON feedback(rating) WHERE rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_is_actioned
    ON feedback(is_actioned, dismissed) WHERE is_actioned = true OR dismissed = true;

-- Assistance requests indexes
CREATE INDEX IF NOT EXISTS idx_assistance_requests_venue_id_created_at
    ON assistance_requests(venue_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assistance_requests_status
    ON assistance_requests(status) WHERE status != 'resolved';

CREATE INDEX IF NOT EXISTS idx_assistance_requests_resolved_by
    ON assistance_requests(resolved_by) WHERE resolved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assistance_requests_resolved_at
    ON assistance_requests(resolved_at DESC) WHERE resolved_at IS NOT NULL;

-- NPS submissions indexes
CREATE INDEX IF NOT EXISTS idx_nps_submissions_venue_id_responded_at
    ON nps_submissions(venue_id, responded_at DESC);

CREATE INDEX IF NOT EXISTS idx_nps_submissions_score
    ON nps_submissions(score) WHERE score IS NOT NULL;

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_venue_id
    ON employees(venue_id);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_user_id
    ON staff(user_id);

CREATE INDEX IF NOT EXISTS idx_staff_venue_id
    ON staff(venue_id);

-- Custom dashboard tiles indexes
CREATE INDEX IF NOT EXISTS idx_custom_dashboard_tiles_user_id
    ON custom_dashboard_tiles(user_id);

CREATE INDEX IF NOT EXISTS idx_custom_dashboard_tiles_position
    ON custom_dashboard_tiles(user_id, position);

-- Google rating indexes
CREATE INDEX IF NOT EXISTS idx_venue_google_ratings_venue_recorded
    ON venue_google_ratings(venue_id, recorded_at DESC);

-- TripAdvisor rating indexes
CREATE INDEX IF NOT EXISTS idx_venue_tripadvisor_ratings_venue_recorded
    ON venue_tripadvisor_ratings(venue_id, recorded_at DESC);

-- Analyze tables to update statistics for query planner
ANALYZE feedback;
ANALYZE assistance_requests;
ANALYZE nps_submissions;
ANALYZE employees;
ANALYZE staff;
ANALYZE custom_dashboard_tiles;
ANALYZE venue_google_ratings;
ANALYZE venue_tripadvisor_ratings;

-- Show table sizes and row counts
DO $$
DECLARE
    table_name text;
    tables text[] := ARRAY['feedback', 'assistance_requests', 'nps_submissions', 'employees', 'staff'];
    row_count bigint;
    table_size text;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TABLE STATISTICS ===';
    FOREACH table_name IN ARRAY tables
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
        EXECUTE format('SELECT pg_size_pretty(pg_total_relation_size(%L))', 'public.' || table_name) INTO table_size;
        RAISE NOTICE 'Table: % - Rows: %, Size: %', table_name, row_count, table_size;
    END LOOP;
END $$;

RAISE NOTICE '';
RAISE NOTICE '=== Performance indexes created successfully ===';
