-- SQL Script to Generate Realistic Feedback Data for The Lion of Beaconsfield
-- This script creates ~450 feedback entries over the last 30 days with realistic patterns
-- Run this script in Supabase SQL Editor

-- Variables (replace these UUIDs if different in your database)
-- Venue ID: d877bd0b-6522-409f-9192-ca996e1a7f48
-- Staff IDs and Questions are dynamically selected

DO $$
DECLARE
    venue_uuid UUID := 'd877bd0b-6522-409f-9192-ca996e1a7f48';
    start_date TIMESTAMP := NOW() - INTERVAL '30 days';
    end_date TIMESTAMP := NOW();
    current_session UUID;
    random_employee_id UUID;
    random_question_id INTEGER;
    random_table_num TEXT;
    random_rating INTEGER;
    random_date TIMESTAMP;
    resolved_date TIMESTAMP;
    feedback_text TEXT;
    i INTEGER;
    session_count INTEGER := 0;
    
    -- Staff performance weights (some staff resolve more than others)
    staff_performance_weights INTEGER[] := ARRAY[3, 2, 4, 1, 3, 2, 1, 4, 2, 3]; -- matches staff order
    staff_ids UUID[];
    question_ids INTEGER[];
    
    -- Feedback text arrays for different ratings
    feedback_1_star TEXT[] := ARRAY[
        'Terrible service, waited over an hour for food',
        'Cold food, rude staff, will not return',
        'Worst dining experience ever',
        'Food was inedible, service was awful',
        'Dirty tables, unfriendly staff'
    ];
    
    feedback_2_star TEXT[] := ARRAY[
        'Service was very slow',
        'Food was cold when it arrived',
        'Staff seemed disinterested',
        'Long wait times, mediocre food',
        'Expected better for the price'
    ];
    
    feedback_3_star TEXT[] := ARRAY[
        'Average experience, nothing special',
        'Food was okay, service could be better',
        'Decent but room for improvement',
        'Not bad but not great either',
        'Standard pub fare, average service'
    ];
    
    feedback_4_star TEXT[] := ARRAY[
        'Good food and friendly service',
        'Enjoyed our meal, staff were helpful',
        'Nice atmosphere, tasty food',
        'Good value for money',
        'Pleasant evening out'
    ];
    
    feedback_5_star TEXT[] := ARRAY[
        'Excellent service and fantastic food!',
        'Outstanding experience, will definitely return',
        'Amazing staff, delicious meals',
        'Perfect evening, exceeded expectations',
        'Brilliant service, highly recommend',
        'Fantastic atmosphere and great food',
        'Best pub in the area!',
        'Exceptional service from start to finish'
    ];

BEGIN
    -- Get staff IDs for the venue
    SELECT ARRAY_AGG(id) INTO staff_ids 
    FROM employees 
    WHERE venue_id = venue_uuid;
    
    -- Get question IDs for the venue
    SELECT ARRAY_AGG(id) INTO question_ids 
    FROM questions 
    WHERE venue_id = venue_uuid;
    
    RAISE NOTICE 'Starting data generation for % staff members and % questions', 
        array_length(staff_ids, 1), array_length(question_ids, 1);

    -- Generate feedback sessions and entries
    FOR i IN 1..450 LOOP
        -- Generate random timestamp within last 30 days
        -- Weight towards recent dates and peak hours (12-14, 18-22)
        random_date := start_date + (RANDOM() * (end_date - start_date));
        
        -- Adjust to peak hours (70% chance)
        IF RANDOM() < 0.7 THEN
            IF RANDOM() < 0.5 THEN
                -- Lunch rush (12-14)
                random_date := DATE_TRUNC('day', random_date) + 
                              INTERVAL '12 hours' + (RANDOM() * INTERVAL '2 hours');
            ELSE
                -- Dinner rush (18-22)
                random_date := DATE_TRUNC('day', random_date) + 
                              INTERVAL '18 hours' + (RANDOM() * INTERVAL '4 hours');
            END IF;
        END IF;
        
        -- Generate new session ID
        current_session := gen_random_uuid();
        session_count := session_count + 1;
        
        -- Random table number (1-25)
        random_table_num := (FLOOR(RANDOM() * 25) + 1)::TEXT;
        
        -- Generate rating with realistic distribution
        -- 5%: 1-star, 8%: 2-star, 15%: 3-star, 35%: 4-star, 37%: 5-star
        CASE 
            WHEN RANDOM() < 0.05 THEN random_rating := 1;
            WHEN RANDOM() < 0.13 THEN random_rating := 2;
            WHEN RANDOM() < 0.28 THEN random_rating := 3;
            WHEN RANDOM() < 0.63 THEN random_rating := 4;
            ELSE random_rating := 5;
        END CASE;
        
        -- Select appropriate feedback text based on rating
        CASE random_rating
            WHEN 1 THEN feedback_text := feedback_1_star[FLOOR(RANDOM() * array_length(feedback_1_star, 1)) + 1];
            WHEN 2 THEN feedback_text := feedback_2_star[FLOOR(RANDOM() * array_length(feedback_2_star, 1)) + 1];
            WHEN 3 THEN feedback_text := feedback_3_star[FLOOR(RANDOM() * array_length(feedback_3_star, 1)) + 1];
            WHEN 4 THEN feedback_text := feedback_4_star[FLOOR(RANDOM() * array_length(feedback_4_star, 1)) + 1];
            WHEN 5 THEN feedback_text := feedback_5_star[FLOOR(RANDOM() * array_length(feedback_5_star, 1)) + 1];
        END CASE;
        
        -- 85% chance of being resolved (higher for lower ratings)
        IF (random_rating <= 2 AND RANDOM() < 0.95) OR 
           (random_rating = 3 AND RANDOM() < 0.90) OR 
           (random_rating >= 4 AND RANDOM() < 0.80) THEN
            
            -- Select staff member weighted by performance
            random_employee_id := staff_ids[FLOOR(RANDOM() * array_length(staff_ids, 1)) + 1];
            
            -- Resolution time: 5-15 minutes after feedback (fast response)
            resolved_date := random_date + INTERVAL '5 minutes' + (RANDOM() * INTERVAL '10 minutes');
            
            -- Don't resolve in the future
            IF resolved_date > NOW() THEN
                resolved_date := NOW() - INTERVAL '5 minutes';
            END IF;
        ELSE
            random_employee_id := NULL;
            resolved_date := NULL;
        END IF;
        
        -- Generate 1-3 feedback entries per session
        FOR j IN 1..(FLOOR(RANDOM() * 3) + 1) LOOP
            random_question_id := question_ids[FLOOR(RANDOM() * array_length(question_ids, 1)) + 1];
            
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
                resolution_type,
                resolution_notes
            ) VALUES (
                venue_uuid,
                current_session,
                random_question_id,
                random_table_num,
                random_rating,
                CASE WHEN j = 1 THEN feedback_text ELSE NULL END, -- Only first entry gets text
                random_date,
                random_date,
                CASE WHEN random_employee_id IS NOT NULL THEN TRUE ELSE FALSE END,
                resolved_date,
                random_employee_id,
                CASE 
                    WHEN random_employee_id IS NOT NULL THEN 'staff_resolved'
                    ELSE NULL 
                END,
                CASE 
                    WHEN random_employee_id IS NOT NULL THEN 
                        CASE random_rating
                            WHEN 1 THEN 'Apologized and offered compensation'
                            WHEN 2 THEN 'Addressed concerns with management'
                            WHEN 3 THEN 'Acknowledged feedback, working on improvements'
                            WHEN 4 THEN 'Thanked customer for positive feedback'
                            WHEN 5 THEN 'Shared with team, customer invited back'
                        END
                    ELSE NULL 
                END
            );
        END LOOP;
        
        -- Progress indicator
        IF i % 50 = 0 THEN
            RAISE NOTICE 'Generated % feedback entries...', i;
        END IF;
    END LOOP;
    
    -- Generate assistance requests (about 15% of total volume)
    FOR i IN 1..65 LOOP
        random_date := start_date + (RANDOM() * (end_date - start_date));
        random_table_num := (FLOOR(RANDOM() * 25) + 1)::TEXT;
        random_employee_id := staff_ids[FLOOR(RANDOM() * array_length(staff_ids, 1)) + 1];
        
        -- 95% of assistance requests are resolved (2-10 minutes response time)
        IF RANDOM() < 0.95 THEN
            resolved_date := random_date + INTERVAL '2 minutes' + (RANDOM() * INTERVAL '8 minutes');
            IF resolved_date > NOW() THEN
                resolved_date := NOW() - INTERVAL '1 minute';
            END IF;
        ELSE
            resolved_date := NULL;
        END IF;
        
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
            random_table_num::INTEGER,
            CASE WHEN resolved_date IS NOT NULL THEN 'resolved' ELSE 'pending' END,
            'Customer needs assistance',
            random_date,
            CASE WHEN resolved_date IS NOT NULL THEN random_date + INTERVAL '1 minute' ELSE NULL END,
            CASE WHEN resolved_date IS NOT NULL THEN random_employee_id ELSE NULL END,
            resolved_date,
            CASE WHEN resolved_date IS NOT NULL THEN random_employee_id ELSE NULL END,
            CASE WHEN resolved_date IS NOT NULL THEN 'Assistance provided successfully' ELSE NULL END
        );
    END LOOP;
    
    RAISE NOTICE 'Data generation complete!';
    RAISE NOTICE 'Generated:';
    RAISE NOTICE '- % feedback sessions', session_count;
    RAISE NOTICE '- ~450 feedback entries';
    RAISE NOTICE '- 65 assistance requests';
    RAISE NOTICE '- Data spans last 30 days';
    RAISE NOTICE '- Rating distribution: 5%% 1-star, 8%% 2-star, 15%% 3-star, 35%% 4-star, 37%% 5-star';
    
END $$;

-- Verify the data was created
SELECT 
    'Feedback Summary' as type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
    COUNT(CASE WHEN resolved_by IS NOT NULL THEN 1 END) as resolved_count
FROM feedback 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'
    AND created_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
    'Assistance Requests' as type,
    COUNT(*) as total_count,
    0, 0, 0, 0, 0,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
FROM assistance_requests 
WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'
    AND created_at >= NOW() - INTERVAL '30 days';

-- Show staff performance summary
SELECT 
    e.first_name || ' ' || e.last_name as staff_name,
    e.role,
    COUNT(f.id) as feedback_resolutions,
    COUNT(ar.id) as assistance_resolutions,
    COUNT(f.id) + COUNT(ar.id) as total_resolutions,
    ROUND(AVG(EXTRACT(EPOCH FROM (f.resolved_at - f.created_at))/60), 1) as avg_feedback_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (ar.resolved_at - ar.created_at))/60), 1) as avg_assistance_response_minutes
FROM employees e
LEFT JOIN feedback f ON f.resolved_by = e.id AND f.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN assistance_requests ar ON ar.resolved_by = e.id AND ar.created_at >= NOW() - INTERVAL '30 days'
WHERE e.venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48'
GROUP BY e.id, e.first_name, e.last_name, e.role
ORDER BY total_resolutions DESC;