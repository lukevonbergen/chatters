-- Fix subscription status to match current Stripe data
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/xjznwqvwlooarskroogf/sql

UPDATE accounts
SET
  is_paid = true,
  stripe_subscription_status = 'active'
WHERE stripe_customer_id = 'cus_TLT0gmDo25h7pG';

-- Verify the update
SELECT
  id,
  name,
  stripe_customer_id,
  stripe_subscription_id,
  is_paid,
  stripe_subscription_status,
  account_type
FROM accounts
WHERE stripe_customer_id = 'cus_TLT0gmDo25h7pG';
