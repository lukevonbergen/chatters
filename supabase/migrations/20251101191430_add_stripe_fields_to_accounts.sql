-- Add Stripe integration fields to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer_id ON accounts(stripe_customer_id);

-- Add comments
COMMENT ON COLUMN accounts.stripe_customer_id IS 'Stripe customer ID for this account';
COMMENT ON COLUMN accounts.stripe_subscription_id IS 'Active Stripe subscription ID for this account';
