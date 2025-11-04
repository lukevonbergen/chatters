-- Add plan details to accounts table

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS plan_amount INTEGER,
ADD COLUMN IF NOT EXISTS plan_currency TEXT,
ADD COLUMN IF NOT EXISTS plan_interval TEXT;

-- Add comments
COMMENT ON COLUMN public.accounts.stripe_price_id IS 'Stripe Price ID (e.g., price_xxxxx)';
COMMENT ON COLUMN public.accounts.plan_amount IS 'Plan amount in cents (e.g., 100 for £1.00)';
COMMENT ON COLUMN public.accounts.plan_currency IS 'Plan currency (e.g., gbp, usd)';
COMMENT ON COLUMN public.accounts.plan_interval IS 'Billing interval (month, year)';
