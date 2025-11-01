-- Add Stripe integration fields to accounts table
-- These fields are required for the billing system to track Stripe customer and subscription IDs

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for faster lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer_id ON accounts(stripe_customer_id);

-- Add comments for documentation
COMMENT ON COLUMN accounts.stripe_customer_id IS 'Stripe customer ID for this account';
COMMENT ON COLUMN accounts.stripe_subscription_id IS 'Active Stripe subscription ID for this account';
