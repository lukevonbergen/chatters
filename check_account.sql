-- Check account af1d9502-a1a9-4873-8776-9b7177ed30c3
SELECT
    id,
    name,
    is_paid,
    account_type,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_subscription_status,
    trial_ends_at,
    demo_account,
    created_at
FROM accounts
WHERE id = 'af1d9502-a1a9-4873-8776-9b7177ed30c3';
