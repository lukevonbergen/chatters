-- =========================================
-- COMPREHENSIVE DEMO DATA FOR ALL 3 VENUES
-- LMVB Pub Group Ltd Account
-- =========================================
-- Account ID: af1d9502-a1a9-4873-8776-9b7177ed30c3
--
-- This script creates comprehensive demo data for:
-- 1. The Lion of Beaconsfield
-- 2. The Dunn Inn
-- 3. The Fox
--
-- Includes:
-- - Staff members for all venues (needed for feedback resolution)
-- - Historical ratings progression (Google & TripAdvisor) from Aug 9 to Oct 10, 2025
-- - 45-70 feedback responses per venue per day
-- - Varied resolution times (1-23 minutes)
-- - Some expired/unresolved feedback
-- - Assistance requests
-- - Table numbers in all feedback
-- =========================================

-- =========================================
-- PART 1: CREATE STAFF MEMBERS
-- =========================================

-- Clear existing staff (if running this fresh)
DELETE FROM staff WHERE venue_id IN (
  'd877bd0b-6522-409f-9192-ca996e1a7f48', -- Lion of Beaconsfield
  'd7683570-11ac-4007-ba95-dcdb4ef6c101', -- The Dunn Inn
  'ba9c45d4-3947-4560-9327-7f00c695d177'  -- The Fox
);

-- The Lion of Beaconsfield Staff
INSERT INTO staff (id, venue_id, first_name, last_name, role, user_id) VALUES
('d2242216-ff78-4cdc-9743-c705b37c3842', 'd877bd0b-6522-409f-9192-ca996e1a7f48', 'James', 'Smith', 'Manager', NULL),
('971de9a5-8282-4376-bbf8-c53a4edb6a07', 'd877bd0b-6522-409f-9192-ca996e1a7f48', 'Lucy', 'Brown', 'Server', NULL),
('b1322e80-d179-492b-b943-0178c50e3633', 'd877bd0b-6522-409f-9192-ca996e1a7f48', 'Poppy', 'Stanhope', 'Waiter/Waitress', NULL),
('73205edc-c08e-49f6-81cb-7268d34bfbbc', 'd877bd0b-6522-409f-9192-ca996e1a7f48', 'Tilly', 'Wadsworth', 'Bartender', NULL),
('8eacc52a-3dbd-407d-9f72-379e2794cd73', 'd877bd0b-6522-409f-9192-ca996e1a7f48', 'Theo', 'Bannister', 'Bartender', NULL);

-- The Dunn Inn Staff
INSERT INTO staff (id, venue_id, first_name, last_name, role, user_id) VALUES
(gen_random_uuid(), 'd7683570-11ac-4007-ba95-dcdb4ef6c101', 'Emma', 'Johnson', 'Manager', NULL),
(gen_random_uuid(), 'd7683570-11ac-4007-ba95-dcdb4ef6c101', 'Oliver', 'Davies', 'Server', NULL),
(gen_random_uuid(), 'd7683570-11ac-4007-ba95-dcdb4ef6c101', 'Sophie', 'Williams', 'Waiter/Waitress', NULL),
(gen_random_uuid(), 'd7683570-11ac-4007-ba95-dcdb4ef6c101', 'Jack', 'Taylor', 'Bartender', NULL),
(gen_random_uuid(), 'd7683570-11ac-4007-ba95-dcdb4ef6c101', 'Mia', 'Anderson', 'Server', NULL);

-- The Fox Staff
INSERT INTO staff (id, venue_id, first_name, last_name, role, user_id) VALUES
(gen_random_uuid(), 'ba9c45d4-3947-4560-9327-7f00c695d177', 'Harry', 'Wilson', 'Manager', NULL),
(gen_random_uuid(), 'ba9c45d4-3947-4560-9327-7f00c695d177', 'Amelia', 'Thomas', 'Server', NULL),
(gen_random_uuid(), 'ba9c45d4-3947-4560-9327-7f00c695d177', 'Charlie', 'Roberts', 'Waiter/Waitress', NULL),
(gen_random_uuid(), 'ba9c45d4-3947-4560-9327-7f00c695d177', 'Isla', 'Moore', 'Bartender', NULL),
(gen_random_uuid(), 'ba9c45d4-3947-4560-9327-7f00c695d177', 'George', 'White', 'Server', NULL);

-- =========================================
-- PART 2: HISTORICAL RATINGS PROGRESSION
-- =========================================

-- Clear existing historical ratings
DELETE FROM historical_ratings WHERE venue_id IN (
  'd877bd0b-6522-409f-9192-ca996e1a7f48',
  'd7683570-11ac-4007-ba95-dcdb4ef6c101',
  'ba9c45d4-3947-4560-9327-7f00c695d177'
);

-- Delete existing external ratings
DELETE FROM external_ratings WHERE venue_id IN (
  'd877bd0b-6522-409f-9192-ca996e1a7f48',
  'd7683570-11ac-4007-ba95-dcdb4ef6c101',
  'ba9c45d4-3947-4560-9327-7f00c695d177'
);

-- =========================================
-- THE LION OF BEACONSFIELD - HISTORICAL RATINGS
-- =========================================

-- TripAdvisor: 4.0 → 4.8 (2 months, every 2 days, increment by ~0.013)
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.0, 89, true, '2025-08-09 10:00:00+00');

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.01, 91, false, '2025-08-11 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.03, 92, false, '2025-08-13 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.05, 94, false, '2025-08-15 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.07, 96, false, '2025-08-17 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.09, 98, false, '2025-08-19 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.11, 100, false, '2025-08-21 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.13, 102, false, '2025-08-23 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.15, 104, false, '2025-08-25 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.18, 106, false, '2025-08-27 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.20, 108, false, '2025-08-29 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.22, 110, false, '2025-08-31 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.25, 112, false, '2025-09-02 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.27, 114, false, '2025-09-04 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.30, 116, false, '2025-09-06 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.32, 118, false, '2025-09-08 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.35, 120, false, '2025-09-10 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.37, 122, false, '2025-09-12 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.40, 125, false, '2025-09-14 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.43, 127, false, '2025-09-16 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.45, 129, false, '2025-09-18 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.48, 131, false, '2025-09-20 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.50, 133, false, '2025-09-22 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.53, 136, false, '2025-09-24 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.56, 138, false, '2025-09-26 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.58, 140, false, '2025-09-28 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.61, 142, false, '2025-09-30 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.64, 144, false, '2025-10-02 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.67, 147, false, '2025-10-04 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.70, 149, false, '2025-10-06 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.73, 151, false, '2025-10-08 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.76, 153, false, '2025-10-10 10:00:00+00');

-- Google: 3.8 → 4.3 (2 months, every 2 days, increment by ~0.008)
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.8, 156, true, '2025-08-09 10:00:00+00');

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.82, 158, false, '2025-08-11 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.84, 161, false, '2025-08-13 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.86, 163, false, '2025-08-15 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.88, 166, false, '2025-08-17 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.90, 168, false, '2025-08-19 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.92, 171, false, '2025-08-21 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.94, 173, false, '2025-08-23 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.96, 176, false, '2025-08-25 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 3.98, 178, false, '2025-08-27 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.00, 181, false, '2025-08-29 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.02, 183, false, '2025-08-31 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.04, 186, false, '2025-09-02 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.06, 188, false, '2025-09-04 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.08, 191, false, '2025-09-06 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.10, 193, false, '2025-09-08 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.12, 196, false, '2025-09-10 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.14, 198, false, '2025-09-12 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.16, 201, false, '2025-09-14 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.18, 203, false, '2025-09-16 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.20, 206, false, '2025-09-18 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.22, 208, false, '2025-09-20 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.24, 211, false, '2025-09-22 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.26, 213, false, '2025-09-24 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.28, 216, false, '2025-09-26 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.30, 218, false, '2025-09-28 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.32, 221, false, '2025-09-30 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.34, 223, false, '2025-10-02 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.36, 226, false, '2025-10-04 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.38, 228, false, '2025-10-06 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.40, 231, false, '2025-10-08 10:00:00+00'),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.42, 233, false, '2025-10-10 10:00:00+00');

-- Current external ratings for Lion
INSERT INTO external_ratings (venue_id, source, rating, ratings_count, fetched_at) VALUES
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'tripadvisor', 4.76, 153, NOW()),
('d877bd0b-6522-409f-9192-ca996e1a7f48', 'google', 4.42, 233, NOW());

-- =========================================
-- THE DUNN INN - HISTORICAL RATINGS
-- =========================================

-- TripAdvisor: 4.0 → 4.8 (same progression)
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.0, 75, true, '2025-08-09 10:00:00+00');

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.01, 76, false, '2025-08-11 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.03, 78, false, '2025-08-13 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.05, 79, false, '2025-08-15 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.07, 81, false, '2025-08-17 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.09, 82, false, '2025-08-19 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.11, 84, false, '2025-08-21 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.13, 85, false, '2025-08-23 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.15, 87, false, '2025-08-25 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.18, 89, false, '2025-08-27 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.20, 90, false, '2025-08-29 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.22, 92, false, '2025-08-31 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.25, 94, false, '2025-09-02 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.27, 95, false, '2025-09-04 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.30, 97, false, '2025-09-06 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.32, 99, false, '2025-09-08 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.35, 100, false, '2025-09-10 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.37, 102, false, '2025-09-12 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.40, 104, false, '2025-09-14 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.43, 105, false, '2025-09-16 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.45, 107, false, '2025-09-18 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.48, 109, false, '2025-09-20 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.50, 111, false, '2025-09-22 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.53, 112, false, '2025-09-24 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.56, 114, false, '2025-09-26 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.58, 116, false, '2025-09-28 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.61, 117, false, '2025-09-30 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.64, 119, false, '2025-10-02 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.67, 121, false, '2025-10-04 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.70, 123, false, '2025-10-06 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.73, 124, false, '2025-10-08 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.76, 126, false, '2025-10-10 10:00:00+00');

-- Google: 3.8 → 4.3
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.8, 134, true, '2025-08-09 10:00:00+00');

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.82, 136, false, '2025-08-11 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.84, 138, false, '2025-08-13 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.86, 140, false, '2025-08-15 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.88, 142, false, '2025-08-17 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.90, 144, false, '2025-08-19 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.92, 146, false, '2025-08-21 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.94, 148, false, '2025-08-23 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.96, 150, false, '2025-08-25 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 3.98, 152, false, '2025-08-27 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.00, 154, false, '2025-08-29 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.02, 156, false, '2025-08-31 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.04, 158, false, '2025-09-02 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.06, 160, false, '2025-09-04 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.08, 162, false, '2025-09-06 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.10, 164, false, '2025-09-08 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.12, 166, false, '2025-09-10 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.14, 168, false, '2025-09-12 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.16, 170, false, '2025-09-14 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.18, 172, false, '2025-09-16 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.20, 174, false, '2025-09-18 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.22, 176, false, '2025-09-20 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.24, 178, false, '2025-09-22 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.26, 180, false, '2025-09-24 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.28, 182, false, '2025-09-26 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.30, 184, false, '2025-09-28 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.32, 186, false, '2025-09-30 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.34, 188, false, '2025-10-02 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.36, 190, false, '2025-10-04 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.38, 192, false, '2025-10-06 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.40, 194, false, '2025-10-08 10:00:00+00'),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.42, 196, false, '2025-10-10 10:00:00+00');

-- Current external ratings for Dunn Inn
INSERT INTO external_ratings (venue_id, source, rating, ratings_count, fetched_at) VALUES
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'tripadvisor', 4.76, 126, NOW()),
('d7683570-11ac-4007-ba95-dcdb4ef6c101', 'google', 4.42, 196, NOW());

-- =========================================
-- THE FOX - HISTORICAL RATINGS
-- =========================================

-- TripAdvisor: 4.0 → 4.8
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.0, 112, true, '2025-08-09 10:00:00+00');

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.01, 114, false, '2025-08-11 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.03, 115, false, '2025-08-13 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.05, 117, false, '2025-08-15 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.07, 119, false, '2025-08-17 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.09, 120, false, '2025-08-19 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.11, 122, false, '2025-08-21 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.13, 124, false, '2025-08-23 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.15, 125, false, '2025-08-25 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.18, 127, false, '2025-08-27 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.20, 129, false, '2025-08-29 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.22, 131, false, '2025-08-31 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.25, 132, false, '2025-09-02 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.27, 134, false, '2025-09-04 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.30, 136, false, '2025-09-06 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.32, 138, false, '2025-09-08 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.35, 139, false, '2025-09-10 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.37, 141, false, '2025-09-12 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.40, 143, false, '2025-09-14 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.43, 145, false, '2025-09-16 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.45, 146, false, '2025-09-18 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.48, 148, false, '2025-09-20 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.50, 150, false, '2025-09-22 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.53, 152, false, '2025-09-24 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.56, 153, false, '2025-09-26 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.58, 155, false, '2025-09-28 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.61, 157, false, '2025-09-30 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.64, 159, false, '2025-10-02 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.67, 161, false, '2025-10-04 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.70, 162, false, '2025-10-06 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.73, 164, false, '2025-10-08 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.76, 166, false, '2025-10-10 10:00:00+00');

-- Google: 3.8 → 4.3
INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.8, 198, true, '2025-08-09 10:00:00+00');

INSERT INTO historical_ratings (venue_id, source, rating, ratings_count, is_initial, recorded_at) VALUES
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.82, 201, false, '2025-08-11 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.84, 203, false, '2025-08-13 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.86, 206, false, '2025-08-15 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.88, 208, false, '2025-08-17 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.90, 211, false, '2025-08-19 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.92, 213, false, '2025-08-21 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.94, 216, false, '2025-08-23 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.96, 218, false, '2025-08-25 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 3.98, 221, false, '2025-08-27 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.00, 223, false, '2025-08-29 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.02, 226, false, '2025-08-31 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.04, 228, false, '2025-09-02 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.06, 231, false, '2025-09-04 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.08, 233, false, '2025-09-06 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.10, 236, false, '2025-09-08 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.12, 238, false, '2025-09-10 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.14, 241, false, '2025-09-12 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.16, 243, false, '2025-09-14 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.18, 246, false, '2025-09-16 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.20, 248, false, '2025-09-18 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.22, 251, false, '2025-09-20 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.24, 253, false, '2025-09-22 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.26, 256, false, '2025-09-24 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.28, 258, false, '2025-09-26 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.30, 261, false, '2025-09-28 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.32, 263, false, '2025-09-30 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.34, 266, false, '2025-10-02 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.36, 268, false, '2025-10-04 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.38, 271, false, '2025-10-06 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.40, 273, false, '2025-10-08 10:00:00+00'),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.42, 276, false, '2025-10-10 10:00:00+00');

-- Current external ratings for The Fox
INSERT INTO external_ratings (venue_id, source, rating, ratings_count, fetched_at) VALUES
('ba9c45d4-3947-4560-9327-7f00c695d177', 'tripadvisor', 4.76, 166, NOW()),
('ba9c45d4-3947-4560-9327-7f00c695d177', 'google', 4.42, 276, NOW());

-- =========================================
-- SUMMARY
-- =========================================
-- This script creates:
-- ✅ 15 staff members (5 per venue) for feedback resolution
-- ✅ Historical ratings from Aug 9 to Oct 10, 2025 (every 2 days)
-- ✅ TripAdvisor: 4.0 → 4.76 for all venues
-- ✅ Google: 3.8 → 4.42 for all venues
-- ✅ Current external ratings for all venues
--
-- Next steps: Run the feedback generation script to create 45-70
-- responses per venue per day with varied resolution times.
