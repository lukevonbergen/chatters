-- Add Unresolved Feedback for The Lion of Beaconsfield
-- 4 unresolved feedback items + 1 unresolved assistance request
-- Tables: 77, 80, 102, 217, 214

-- Venue ID: d877bd0b-6522-409f-9192-ca996e1a7f48

DO $$
DECLARE
    venue_uuid UUID := 'd877bd0b-6522-409f-9192-ca996e1a7f48';
    question_ids INTEGER[];
    feedback_session UUID;
    current_time TIMESTAMP := NOW();
BEGIN
    -- Get question IDs for the venue
    SELECT ARRAY_AGG(id) INTO question_ids 
    FROM questions 
    WHERE venue_id = venue_uuid;

    -- 1. Table 77 - 2-star review (service complaint)
    feedback_session := gen_random_uuid();
    INSERT INTO feedback (
        venue_id,
        session_id,
        question_id,
        table_number,
        rating,
        additional_feedback,
        created_at,
        timestamp,
        is_actioned,
        resolved_at,
        resolved_by,
        resolution_type
    ) VALUES (
        venue_uuid,
        feedback_session,
        question_ids[1], -- First question (How was the service today?)
        '77',
        2,
        'Service was very slow tonight, waited 45 minutes for our mains. Staff seemed overwhelmed.',
        current_time - INTERVAL '25 minutes',
        current_time - INTERVAL '25 minutes',
        FALSE,
        NULL,
        NULL,
        NULL
    );

    -- 2. Table 80 - 1-star review (food quality issue)
    feedback_session := gen_random_uuid();
    INSERT INTO feedback (
        venue_id,
        session_id,
        question_id,
        table_number,
        rating,
        additional_feedback,
        created_at,
        timestamp,
        is_actioned,
        resolved_at,
        resolved_by,
        resolution_type
    ) VALUES (
        venue_uuid,
        feedback_session,
        question_ids[3], -- Third question (Was your order prepared correctly?)
        '80',
        1,
        'Food arrived cold and my steak was completely wrong - ordered medium rare, got well done. Very disappointing.',
        current_time - INTERVAL '15 minutes',
        current_time - INTERVAL '15 minutes',
        FALSE,
        NULL,
        NULL,
        NULL
    );

    -- 3. Table 102 - 3-star review (cleanliness concern)
    feedback_session := gen_random_uuid();
    INSERT INTO feedback (
        venue_id,
        session_id,
        question_id,
        table_number,
        rating,
        additional_feedback,
        created_at,
        timestamp,
        is_actioned,
        resolved_at,
        resolved_by,
        resolution_type
    ) VALUES (
        venue_uuid,
        feedback_session,
        question_ids[4], -- Fourth question (How clean was the venue?)
        '102',
        3,
        'Tables were sticky and the floor around our table had food debris. Needs better cleaning between customers.',
        current_time - INTERVAL '8 minutes',
        current_time - INTERVAL '8 minutes',
        FALSE,
        NULL,
        NULL,
        NULL
    );

    -- 4. Table 217 - 2-star review (atmosphere/noise complaint)
    feedback_session := gen_random_uuid();
    INSERT INTO feedback (
        venue_id,
        session_id,
        question_id,
        table_number,
        rating,
        additional_feedback,
        created_at,
        timestamp,
        is_actioned,
        resolved_at,
        resolved_by,
        resolution_type
    ) VALUES (
        venue_uuid,
        feedback_session,
        question_ids[2], -- Second question (How would you rate the atmosphere?)
        '217',
        2,
        'Far too noisy, could barely have a conversation. Music was too loud and the acoustics made everything echo.',
        current_time - INTERVAL '32 minutes',
        current_time - INTERVAL '32 minutes',
        FALSE,
        NULL,
        NULL,
        NULL
    );

    -- 5. Table 214 - Unresolved assistance request
    INSERT INTO assistance_requests (
        venue_id,
        table_number,
        status,
        message,
        created_at,
        acknowledged_at,
        acknowledged_by,
        resolved_at,
        resolved_by,
        notes
    ) VALUES (
        venue_uuid,
        214,
        'pending',
        'Customer needs assistance - requested to speak with manager about billing issue',
        current_time - INTERVAL '12 minutes',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    );

    RAISE NOTICE 'Added 5 unresolved items:';
    RAISE NOTICE '- Table 77: 2-star service complaint (25 min ago)';
    RAISE NOTICE '- Table 80: 1-star food quality issue (15 min ago)';
    RAISE NOTICE '- Table 102: 3-star cleanliness concern (8 min ago)';
    RAISE NOTICE '- Table 217: 2-star noise complaint (32 min ago)';
    RAISE NOTICE '- Table 214: Assistance request - billing issue (12 min ago)';

END $$;

-- Verify the unresolved items were added
SELECT 
    'Unresolved Feedback' as type,
    table_number,
    rating,
    LEFT(additional_feedback, 50) || '...' as feedback_preview,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM feedback 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'
    AND is_actioned = FALSE
    AND created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC

UNION ALL

SELECT 
    'Assistance Request' as type,
    table_number::TEXT,
    NULL as rating,
    LEFT(message, 50) || '...' as feedback_preview,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM assistance_requests 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'
    AND status = 'pending'
    AND created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;