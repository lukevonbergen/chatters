-- Add descriptive comments to all tables for better documentation

-- Core business entities
COMMENT ON TABLE accounts IS 'Top-level account grouping for multi-venue organizations. Each account can have multiple venues and manages billing/subscription.';
COMMENT ON TABLE users IS 'Application users with role-based access (admin, master, manager). Masters own accounts, managers access specific venues via staff table.';
COMMENT ON TABLE venues IS 'Individual business locations belonging to an account. Stores branding, operating hours, and integration settings.';
COMMENT ON TABLE staff IS 'Many-to-many relationship linking manager users to specific venues they can access.';

-- Feedback collection system
COMMENT ON TABLE feedback IS 'Customer feedback responses linked to questions and venues. Tracks sentiment, ratings, resolution status, and actionable items.';
COMMENT ON TABLE feedback_sessions IS 'Groups feedback by customer visit/session. Links table-specific feedback together for holistic view of customer experience.';
COMMENT ON TABLE questions IS 'Customizable feedback questions per venue. Controls question order and active status for feedback flow.';

-- Staff performance tracking
COMMENT ON TABLE employees IS 'Venue staff members tracked for performance metrics and leaderboard rankings. Different from users table - these are frontline staff being measured.';
COMMENT ON TABLE staff_roles IS 'Customizable role definitions per venue (e.g., Server, Bartender, Host) with color coding for visual differentiation.';
COMMENT ON TABLE staff_locations IS 'Work area/department definitions per venue (e.g., Patio, Bar, Main Dining) for location-based performance tracking.';
COMMENT ON TABLE staff_backup IS 'Backup copy of staff table data. Appears to be a data migration safety net.';

-- Venue layout and table management
COMMENT ON TABLE table_positions IS 'Visual floor plan positions for tables. Stores x/y coordinates as percentages, shapes, and zone assignments for interactive floorplan view.';
COMMENT ON TABLE zones IS 'Logical groupings of tables within a venue (e.g., sections, floors, areas) for organizational hierarchy.';

-- Real-time assistance
COMMENT ON TABLE assistance_requests IS 'Customer assistance requests when they need help but not formal feedback. Tracks acknowledgment and resolution by staff members.';

-- External integrations and analytics
COMMENT ON TABLE external_ratings IS 'Cache for third-party ratings (Google, TripAdvisor) with 24-hour TTL. Only stores latest snapshot per venue/source.';
COMMENT ON TABLE historical_ratings IS 'Historical tracking of external ratings for trend analysis. Records taken periodically to show rating progression over time.';
