-- Check if assistance requests are actually being inserted
-- Run this to see all assistance requests in the database

SELECT
    id,
    venue_id,
    table_number,
    status,
    message,
    created_at,
    updated_at
FROM public.assistance_requests
ORDER BY created_at DESC
LIMIT 20;

-- Check the most recent assistance request
SELECT
    id,
    venue_id,
    table_number,
    status,
    message,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM public.assistance_requests
ORDER BY created_at DESC
LIMIT 1;
