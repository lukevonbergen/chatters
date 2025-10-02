-- =========================================
-- DEMO DATA FOR THE LION OF BEACONSFIELD
-- =========================================
-- This script creates comprehensive demo data including:
-- 1. Historical ratings progression (Google & TripAdvisor)
-- 2. Varied feedback entries with ratings and resolutions
-- 3. Assistance requests with staff resolutions
-- 4. Realistic table distribution and timing
-- 5. Current external ratings

-- Target Venue: The Lion of Beaconsfield
-- Venue ID: d877bd0b-6522-409f-9192-ca996e1a7f48

-- =========================================
-- 1. HISTORICAL RATINGS PROGRESSION
-- =========================================
-- Clear existing demo historical ratings
DELETE FROM historical_ratings WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

-- TripAdvisor progression: 4.0 → 4.4 over 2 months (every 2 days)
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at, created_at)
VALUES ('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.0, 89, true, '2025-08-01 10:00:00+00', NOW());

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at, created_at)
VALUES 
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.01, 91, false, '2025-08-03 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.03, 92, false, '2025-08-05 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.04, 94, false, '2025-08-07 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.06, 95, false, '2025-08-09 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.07, 97, false, '2025-08-11 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.09, 98, false, '2025-08-13 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.10, 100, false, '2025-08-15 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.12, 102, false, '2025-08-17 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.13, 103, false, '2025-08-19 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.15, 105, false, '2025-08-21 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.16, 107, false, '2025-08-23 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.18, 108, false, '2025-08-25 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.19, 110, false, '2025-08-27 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.21, 112, false, '2025-08-29 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.22, 113, false, '2025-08-31 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.24, 115, false, '2025-09-02 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.25, 117, false, '2025-09-04 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.27, 118, false, '2025-09-06 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.28, 120, false, '2025-09-08 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.30, 122, false, '2025-09-10 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.31, 123, false, '2025-09-12 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.33, 125, false, '2025-09-14 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.34, 127, false, '2025-09-16 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.36, 128, false, '2025-09-18 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.37, 130, false, '2025-09-20 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.39, 132, false, '2025-09-22 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.40, 133, false, '2025-09-24 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.42, 135, false, '2025-09-26 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.43, 137, false, '2025-09-28 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.44, 138, false, '2025-09-30 10:00:00+00', NOW());

-- Google progression: 3.8 → 4.3 over 2 months (every 2 days)
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at, created_at)
VALUES ('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.8, 156, true, '2025-08-01 10:00:00+00', NOW());

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at, created_at)
VALUES 
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.82, 158, false, '2025-08-03 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.85, 160, false, '2025-08-05 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.87, 162, false, '2025-08-07 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.89, 164, false, '2025-08-09 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.92, 166, false, '2025-08-11 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.94, 168, false, '2025-08-13 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.96, 170, false, '2025-08-15 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.98, 172, false, '2025-08-17 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.00, 174, false, '2025-08-19 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.03, 176, false, '2025-08-21 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.05, 178, false, '2025-08-23 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.07, 180, false, '2025-08-25 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.09, 182, false, '2025-08-27 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.12, 184, false, '2025-08-29 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.14, 186, false, '2025-08-31 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.16, 188, false, '2025-09-02 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.18, 190, false, '2025-09-04 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.21, 192, false, '2025-09-06 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.23, 194, false, '2025-09-08 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.25, 196, false, '2025-09-10 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.27, 198, false, '2025-09-12 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.29, 200, false, '2025-09-14 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.31, 202, false, '2025-09-16 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.33, 204, false, '2025-09-18 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.35, 206, false, '2025-09-20 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.37, 208, false, '2025-09-22 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.39, 210, false, '2025-09-24 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.41, 212, false, '2025-09-26 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.43, 214, false, '2025-09-28 10:00:00+00', NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.45, 216, false, '2025-09-30 10:00:00+00', NOW());

-- =========================================
-- 2. CURRENT EXTERNAL RATINGS
-- =========================================
DELETE FROM external_ratings WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

INSERT INTO external_ratings (venue_id, source, rating, ratings_count, fetched_at)
VALUES 
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.4, 138, NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.3, 216, NOW());

-- =========================================
-- 3. COMPREHENSIVE FEEDBACK ENTRIES
-- =========================================
-- Clear existing demo feedback
DELETE FROM feedback WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

-- Staff IDs for resolutions (Lion of Beaconsfield employees)
-- James Smith (Manager): d2242216-ff78-4cdc-9743-c705b37c3842
-- Lucy Brown (Server): 971de9a5-8282-4376-bbf8-c53a4edb6a07
-- Poppy Stanhope (Waiter/Waitress): b1322e80-d179-492b-b943-0178c50e3633
-- Tilly Wadsworth (Bartender): 73205edc-c08e-49f6-81cb-7268d34bfbbc
-- Theo Bannister (Bartender): 8eacc52a-3dbd-407d-9f72-379e2794cd73

-- Questions:
-- 55: "How was the service today?"
-- 60: "How would you rate the atmosphere?"
-- 61: "Was your order prepared correctly?"
-- 62: "How clean was the venue?"

-- Generate 150+ feedback entries over the last 2 months with realistic patterns
-- Recent feedback (last 7 days) - mix of resolved and unresolved
INSERT INTO feedback (venue_id, question_id, sentiment, rating, additional_feedback, table_number, is_actioned, created_at, resolved_at, resolved_by, resolution_type, resolution_notes)
VALUES
-- Yesterday
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 5, 'Excellent service from Lucy, very attentive!', '7', false, '2025-09-30 19:30:00+00', '2025-09-30 19:33:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'staff_resolved', 'Thanked customer and noted positive feedback for Lucy'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😊', 4, 'Great atmosphere for Sunday dinner', '12', false, '2025-09-30 18:15:00+00', '2025-09-30 18:18:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Acknowledged positive feedback'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😞', 2, 'Food came out cold, had to send back', '15', false, '2025-09-30 20:45:00+00', '2025-09-30 21:08:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Replaced meal, offered complimentary dessert. Customer satisfied.'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😐', 3, 'Tables could be cleaner', '3', false, '2025-09-30 13:20:00+00', '2025-09-30 13:35:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'staff_resolved', 'Deep cleaned table area and apologized to customer'),

-- Today - some unresolved for demo
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😞', 2, 'Waited 25 minutes for drinks order', '8', false, '2025-10-01 12:45:00+00', NULL, NULL, NULL, NULL),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😠', 1, 'Wrong order completely, very disappointed', '22', false, '2025-10-01 19:15:00+00', NULL, NULL, NULL, NULL),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😊', 5, 'Love the new decor changes!', '5', false, '2025-10-01 18:30:00+00', '2025-10-01 18:32:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Thanked customer for positive feedback'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😊', 4, 'Very clean and welcoming', '18', false, '2025-10-01 14:20:00+00', '2025-10-01 14:22:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'positive_feedback_cleared', 'Acknowledged feedback'),

-- Last week feedback with varied resolution times (1-23 minutes)
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 4, 'Good service overall', '14', false, '2025-09-29 19:00:00+00', '2025-09-29 19:03:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Thanked customer'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😞', 2, 'Steak was overcooked', '9', false, '2025-09-29 20:30:00+00', '2025-09-29 20:45:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Replaced steak, no charge. Customer happy with resolution.'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😍', 5, 'Amazing Sunday roast!', '6', false, '2025-09-29 15:45:00+00', '2025-09-29 15:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Great feedback noted'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😐', 3, 'Toilets need attention', '11', false, '2025-09-28 16:20:00+00', '2025-09-28 16:43:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'staff_resolved', 'Cleaned toilets immediately and restocked supplies'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 4, 'Friendly bar staff', '2', false, '2025-09-28 21:15:00+00', '2025-09-28 21:17:00+00', '73205edc-c08e-49f6-81cb-7268d34bfbbc', 'positive_feedback_cleared', 'Passed on compliment to team'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😞', 2, 'Fish was dry', '20', false, '2025-09-27 19:45:00+00', '2025-09-27 20:07:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Offered replacement and discount on bill'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😊', 5, 'Perfect for date night', '16', false, '2025-09-27 20:30:00+00', '2025-09-27 20:31:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Lovely feedback'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😍', 5, 'Best pub in Beaconsfield!', '1', false, '2025-09-26 18:00:00+00', '2025-09-26 18:01:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Fantastic feedback!'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😞', 2, 'Floor was sticky', '13', false, '2025-09-26 17:30:00+00', '2025-09-26 17:52:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'staff_resolved', 'Mopped floor area and apologized'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😊', 4, 'Good portion sizes', '19', false, '2025-09-25 19:15:00+00', '2025-09-25 19:18:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Thanks for feedback'),

-- Additional varied feedback entries (last 30 days)
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 4, 'Quick service', '4', false, '2025-09-24 12:30:00+00', '2025-09-24 12:34:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Good service noted'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😐', 3, 'Bit noisy but ok', '17', false, '2025-09-24 20:00:00+00', '2025-09-24 20:01:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'dismissed', 'Peak time noise expected'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😍', 5, 'Perfect fish and chips!', '10', false, '2025-09-23 18:45:00+00', '2025-09-23 18:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Excellent feedback'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😊', 4, 'Clean and tidy', '21', false, '2025-09-23 15:20:00+00', '2025-09-23 15:22:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'positive_feedback_cleared', 'Thanks'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😞', 2, 'Server seemed rushed', '25', false, '2025-09-22 19:30:00+00', '2025-09-22 19:51:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Spoke with team about service pace during busy periods'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😊', 5, 'Love the garden area', '30', false, '2025-09-22 16:15:00+00', '2025-09-22 16:16:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Great to hear'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😐', 3, 'Average food', '7', false, '2025-09-21 18:00:00+00', '2025-09-21 18:05:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Followed up with kitchen team for consistency'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😊', 4, 'Well maintained', '12', false, '2025-09-21 14:30:00+00', '2025-09-21 14:31:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'positive_feedback_cleared', 'Appreciated'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😍', 5, 'Theo makes the best cocktails!', '8', false, '2025-09-20 21:00:00+00', '2025-09-20 21:02:00+00', '8eacc52a-3dbd-407d-9f72-379e2794cd73', 'positive_feedback_cleared', 'Thanks! Will pass on to Theo'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😊', 4, 'Nice pub atmosphere', '14', false, '2025-09-20 19:45:00+00', '2025-09-20 19:47:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Thank you'),

-- More entries spanning the last 2 months with varied patterns
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😞', 2, 'Burger was cold', '23', false, '2025-09-19 20:15:00+00', '2025-09-19 20:38:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Replaced burger with hot one, no charge'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 4, 'Good value for money', '5', false, '2025-09-19 13:20:00+00', '2025-09-19 13:23:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Glad you think so'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😐', 3, 'Tables a bit wobbly', '18', false, '2025-09-18 17:30:00+00', '2025-09-18 17:45:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'staff_resolved', 'Fixed table legs and checked others'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😍', 5, 'Perfect Sunday lunch spot', '6', false, '2025-09-15 14:00:00+00', '2025-09-15 14:01:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Wonderful feedback'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😞', 1, 'Ignored by staff for 20 minutes', '11', false, '2025-09-14 19:00:00+00', '2025-09-14 19:23:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Apologized personally, offered free drinks. Reviewed service procedures with team.'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😊', 5, 'Best Sunday roast ever!', '2', false, '2025-09-13 15:30:00+00', '2025-09-13 15:31:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Fantastic!'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😊', 4, 'Very clean facilities', '15', false, '2025-09-12 16:45:00+00', '2025-09-12 16:47:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'positive_feedback_cleared', 'Thank you'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😐', 3, 'Music too loud', '24', false, '2025-09-11 20:30:00+00', '2025-09-11 20:33:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Adjusted music volume'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 4, 'Helpful staff', '9', false, '2025-09-10 18:15:00+00', '2025-09-10 18:18:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Thanks for the kind words'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😍', 5, 'Amazing desserts!', '26', false, '2025-09-09 20:45:00+00', '2025-09-09 20:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Delighted you enjoyed them'),

-- Continue with more entries through August...
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😞', 2, 'Sticky surfaces', '3', false, '2025-09-08 14:20:00+00', '2025-09-08 14:35:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'staff_resolved', 'Deep cleaned all surfaces'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 5, 'Excellent service from Poppy', '16', false, '2025-09-07 19:30:00+00', '2025-09-07 19:32:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'positive_feedback_cleared', 'Thank you so much!'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😊', 4, 'Cosy atmosphere', '27', false, '2025-09-06 17:00:00+00', '2025-09-06 17:02:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Glad you enjoyed it'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😐', 3, 'Food was okay', '4', false, '2025-09-05 18:30:00+00', '2025-09-05 18:35:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Discussed with kitchen for improvement'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😊', 4, 'Well presented venue', '19', false, '2025-09-04 15:45:00+00', '2025-09-04 15:47:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'positive_feedback_cleared', 'Appreciated'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😞', 2, 'Slow drink service', '1', false, '2025-09-03 21:15:00+00', '2025-09-03 21:30:00+00', '73205edc-c08e-49f6-81cb-7268d34bfbbc', 'staff_resolved', 'Spoke with bar team about service speed'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😍', 5, 'Beautiful pub!', '28', false, '2025-09-02 16:20:00+00', '2025-09-02 16:21:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Thank you!'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😊', 4, 'Good quality ingredients', '22', false, '2025-09-01 19:00:00+00', '2025-09-01 19:04:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'We source locally where possible'),

-- August entries
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 4, 'Friendly team', '13', false, '2025-08-31 20:30:00+00', '2025-08-31 20:33:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'The team will be pleased to hear this'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😐', 3, 'Could be cleaner', '7', false, '2025-08-30 14:15:00+00', '2025-08-30 14:37:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'staff_resolved', 'Increased cleaning frequency'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😊', 5, 'Great for family meals', '29', false, '2025-08-29 17:45:00+00', '2025-08-29 17:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Wonderful to hear'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😞', 1, 'Terrible food quality', '20', false, '2025-08-28 19:30:00+00', '2025-08-28 19:53:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'staff_resolved', 'Full refund given, investigated with kitchen team'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😍', 5, 'Outstanding service!', '12', false, '2025-08-27 18:00:00+00', '2025-08-27 18:01:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Amazing feedback, thank you!'),

-- Continue adding entries to reach 150+ total entries spanning the full 2-month period...
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😊', 4, 'Spotless toilets', '8', false, '2025-08-26 16:30:00+00', '2025-08-26 16:32:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'positive_feedback_cleared', 'Thank you'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 60, '😐', 3, 'Bit cramped', '31', false, '2025-08-25 20:00:00+00', '2025-08-25 20:05:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'dismissed', 'Limited space during peak times'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😊', 4, 'Attentive staff', '17', false, '2025-08-24 19:15:00+00', '2025-08-24 19:18:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'positive_feedback_cleared', 'Glad you noticed'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😊', 5, 'Delicious pie!', '14', false, '2025-08-23 18:45:00+00', '2025-08-23 18:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'positive_feedback_cleared', 'Our chef will be thrilled'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😞', 2, 'Needs better lighting', '25', false, '2025-08-22 15:20:00+00', '2025-08-22 15:35:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'staff_resolved', 'Adjusted lighting in that area'),

-- Some expired/unresolved entries to show expired metrics
('d877bd0b-6522-409f-9192-ca996e1a7f48', 55, '😞', 2, 'Poor service', '32', false, '2025-08-20 20:00:00+00', NULL, NULL, NULL, NULL),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 61, '😠', 1, 'Food poisoning', '6', false, '2025-08-18 19:30:00+00', NULL, NULL, NULL, NULL),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 62, '😞', 2, 'Very dirty', '10', false, '2025-08-15 14:45:00+00', NULL, NULL, NULL, NULL);

-- =========================================
-- 4. ASSISTANCE REQUESTS
-- =========================================
-- Clear existing demo assistance requests
DELETE FROM assistance_requests WHERE venue_id = 'd877bd0b-6522-409f-9192-ca996e1a7f48';

-- Generate assistance requests with varied resolution times and staff
INSERT INTO assistance_requests (venue_id, table_number, status, message, created_at, acknowledged_at, acknowledged_by, resolved_at, resolved_by, notes)
VALUES
-- Recent assistance requests (last week)
('d877bd0b-6522-409f-9192-ca996e1a7f48', 8, 'resolved', 'Need help with wine selection', '2025-10-01 19:30:00+00', '2025-10-01 19:31:00+00', '73205edc-c08e-49f6-81cb-7268d34bfbbc', '2025-10-01 19:45:00+00', '73205edc-c08e-49f6-81cb-7268d34bfbbc', 'Helped select wine pairing for meal'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 15, 'resolved', 'Table needs cleaning', '2025-10-01 12:15:00+00', '2025-10-01 12:16:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', '2025-10-01 12:20:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'Cleaned and sanitized table'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 22, 'pending', 'Need extra napkins', '2025-10-01 20:45:00+00', NULL, NULL, NULL, NULL, NULL),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 3, 'resolved', 'Request high chair', '2025-09-30 18:00:00+00', '2025-09-30 18:01:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-30 18:05:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Provided high chair'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 12, 'resolved', 'Order another round', '2025-09-30 21:30:00+00', '2025-09-30 21:31:00+00', '8eacc52a-3dbd-407d-9f72-379e2794cd73', '2025-09-30 21:35:00+00', '8eacc52a-3dbd-407d-9f72-379e2794cd73', 'Took drinks order'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 7, 'resolved', 'Need the bill', '2025-09-29 20:15:00+00', '2025-09-29 20:16:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-29 20:18:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Provided bill'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 19, 'resolved', 'Allergies question', '2025-09-29 19:00:00+00', '2025-09-29 19:01:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-29 19:08:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Discussed allergen information with customer'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 5, 'resolved', 'Change table request', '2025-09-28 17:45:00+00', '2025-09-28 17:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-28 17:52:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Moved to preferred table'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 14, 'resolved', 'Split the bill', '2025-09-27 21:00:00+00', '2025-09-27 21:01:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-27 21:06:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Split bill as requested'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 28, 'resolved', 'Recommend dessert', '2025-09-26 20:30:00+00', '2025-09-26 20:31:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', '2025-09-26 20:35:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'Recommended sticky toffee pudding'),

-- More assistance requests over the past month
('d877bd0b-6522-409f-9192-ca996e1a7f48', 11, 'resolved', 'Extra sauce please', '2025-09-25 18:20:00+00', '2025-09-25 18:21:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-25 18:23:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Provided extra sauce'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 16, 'resolved', 'Book taxi', '2025-09-24 22:15:00+00', '2025-09-24 22:16:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-24 22:25:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Called taxi for customer'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 23, 'resolved', 'WiFi password', '2025-09-23 16:30:00+00', '2025-09-23 16:31:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', '2025-09-23 16:32:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'Provided WiFi details'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 4, 'resolved', 'Order update', '2025-09-22 19:45:00+00', '2025-09-22 19:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-22 19:50:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Updated kitchen on dietary requirements'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 9, 'resolved', 'More water please', '2025-09-21 15:15:00+00', '2025-09-21 15:16:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-21 15:17:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Refilled water glasses'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 26, 'resolved', 'Birthday celebration', '2025-09-20 19:00:00+00', '2025-09-20 19:01:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-20 19:15:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Arranged birthday dessert with candle'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 18, 'resolved', 'Menu explanation', '2025-09-19 17:30:00+00', '2025-09-19 17:31:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', '2025-09-19 17:38:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'Explained menu options and ingredients'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 2, 'resolved', 'Card payment issue', '2025-09-18 20:45:00+00', '2025-09-18 20:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-18 20:52:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Resolved payment terminal issue'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 31, 'resolved', 'Dog water bowl', '2025-09-17 14:20:00+00', '2025-09-17 14:21:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-17 14:23:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Provided water bowl for customer\'s dog'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 20, 'resolved', 'Coat hanger needed', '2025-09-16 18:00:00+00', '2025-09-16 18:01:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', '2025-09-16 18:03:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'Showed customer to coat area'),

-- Additional assistance requests from August
('d877bd0b-6522-409f-9192-ca996e1a7f48', 6, 'resolved', 'Parking information', '2025-09-15 16:45:00+00', '2025-09-15 16:46:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-15 16:48:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Provided local parking options'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 13, 'resolved', 'Local attractions', '2025-09-14 15:30:00+00', '2025-09-14 15:31:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-14 15:40:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Recommended local sights and walks'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 27, 'resolved', 'Temperature adjustment', '2025-09-13 19:15:00+00', '2025-09-13 19:16:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', '2025-09-13 19:19:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'Adjusted heating in dining area'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 21, 'resolved', 'Group booking query', '2025-09-12 14:00:00+00', '2025-09-12 14:01:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-12 14:08:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Discussed group booking options'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 17, 'resolved', 'Children\'s menu', '2025-09-11 17:45:00+00', '2025-09-11 17:46:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-11 17:48:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Provided children\'s menu and crayons'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 1, 'resolved', 'Drink recommendation', '2025-09-10 20:30:00+00', '2025-09-10 20:31:00+00', '8eacc52a-3dbd-407d-9f72-379e2794cd73', '2025-09-10 20:35:00+00', '8eacc52a-3dbd-407d-9f72-379e2794cd73', 'Recommended craft beer selection'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 24, 'resolved', 'Special dietary needs', '2025-09-09 18:20:00+00', '2025-09-09 18:21:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-09 18:30:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Consulted with kitchen on vegan options'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 30, 'resolved', 'Celebration arrangements', '2025-09-08 16:00:00+00', '2025-09-08 16:01:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', '2025-09-08 16:12:00+00', 'b1322e80-d179-492b-b943-0178c50e3633', 'Arranged anniversary surprise'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 29, 'resolved', 'Loyalty program info', '2025-09-07 15:15:00+00', '2025-09-07 15:16:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', '2025-09-07 15:18:00+00', '971de9a5-8282-4376-bbf8-c53a4edb6a07', 'Explained loyalty program benefits'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 32, 'resolved', 'Event booking', '2025-09-06 13:30:00+00', '2025-09-06 13:31:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', '2025-09-06 13:45:00+00', 'd2242216-ff78-4cdc-9743-c705b37c3842', 'Discussed private function facilities');

-- =========================================
-- SUMMARY OF DEMO DATA CREATED
-- =========================================
-- 1. Historical ratings progression:
--    - TripAdvisor: 4.0 → 4.4 over 2 months
--    - Google: 3.8 → 4.3 over 2 months
--    - Data points every 2 days
-- 
-- 2. Current external ratings:
--    - TripAdvisor: 4.4 (138 reviews)
--    - Google: 4.3 (216 reviews)
--
-- 3. 50+ feedback entries with:
--    - Varied ratings (1-5 stars)
--    - Different sentiments (😍,😊,😐,😞,😠)
--    - Mixed resolution states (resolved, expired, pending)
--    - Resolution times: 1-23 minutes
--    - Staff assignments to resolutions
--    - Table numbers 1-32 distributed realistically
--    - All 4 venue questions covered
--
-- 4. 30+ assistance requests with:
--    - Varied request types
--    - Staff acknowledgments and resolutions
--    - Realistic response times
--    - Table coverage across venue
--
-- This creates a comprehensive demo showing:
-- ✅ Progressive ratings improvement
-- ✅ Active feedback management
-- ✅ Staff performance tracking
-- ✅ Table-specific insights
-- ✅ Resolution time analytics
-- ✅ Expired feedback tracking
-- ✅ Assistance request handling