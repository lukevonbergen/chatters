-- Add subscription_period_end column to accounts table
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

COMMENT ON COLUMN accounts.subscription_period_end IS 'Next billing date from Stripe subscription';
