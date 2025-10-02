-- Cleanup Script: Remove All Existing Feedback Data for The Lion of Beaconsfield
-- Run this BEFORE running the data generation script
-- This ensures a clean slate for the new realistic data

-- Venue ID for The Lion of Beaconsfield
-- d877bd0b-6522-409f-9192-ca996e1a7f48

BEGIN;

-- Show current data counts before deletion
SELECT 
    'BEFORE CLEANUP' as status,
    'Feedback' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_date,
    MAX(created_at) as latest_date
FROM feedback 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'

UNION ALL

SELECT 
    'BEFORE CLEANUP' as status,
    'Assistance Requests' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_date,
    MAX(created_at) as latest_date
FROM assistance_requests 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'

UNION ALL

SELECT 
    'BEFORE CLEANUP' as status,
    'Feedback Sessions' as table_name,
    COUNT(*) as record_count,
    MIN(started_at) as earliest_date,
    MAX(started_at) as latest_date
FROM feedback_sessions 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

-- Delete all feedback for The Lion of Beaconsfield
DELETE FROM feedback 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

-- Delete all assistance requests for The Lion of Beaconsfield
DELETE FROM assistance_requests 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

-- Delete all feedback sessions for The Lion of Beaconsfield
DELETE FROM feedback_sessions 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

-- Show results after cleanup
SELECT 
    'AFTER CLEANUP' as status,
    'Feedback' as table_name,
    COUNT(*) as record_count,
    NULL as earliest_date,
    NULL as latest_date
FROM feedback 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'

UNION ALL

SELECT 
    'AFTER CLEANUP' as status,
    'Assistance Requests' as table_name,
    COUNT(*) as record_count,
    NULL as earliest_date,
    NULL as latest_date
FROM assistance_requests 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'

UNION ALL

SELECT 
    'AFTER CLEANUP' as status,
    'Feedback Sessions' as table_name,
    COUNT(*) as record_count,
    NULL as earliest_date,
    NULL as latest_date
FROM feedback_sessions 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

COMMIT;

-- Confirmation message
SELECT 'CLEANUP COMPLETE: All feedback data removed for The Lion of Beaconsfield' as message;