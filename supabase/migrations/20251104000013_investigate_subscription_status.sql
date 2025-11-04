-- Investigation queries for stripe_subscription_status changes
-- Run these queries in the Supabase SQL Editor to investigate

-- 1. Check current accounts table structure
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'accounts'
AND table_schema = 'public'
AND column_name LIKE '%stripe%' OR column_name LIKE '%subscription%' OR column_name LIKE '%paid%'
ORDER BY ordinal_position;

-- 2. Check all accounts with their subscription status
SELECT
    id,
    name,
    is_paid,
    account_type,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_subscription_status,
    trial_ends_at,
    created_at
FROM accounts
ORDER BY created_at DESC;

-- 3. Check for any triggers on the accounts table
SELECT
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'accounts'
AND event_object_schema = 'public';

-- 4. Check for any functions that modify accounts table
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition LIKE '%accounts%'
AND routine_definition LIKE '%stripe_subscription_status%';

-- 5. Check if there are any scheduled jobs or cron that might be updating this
-- (Note: This requires pg_cron extension)
-- SELECT * FROM cron.job WHERE command LIKE '%accounts%' OR command LIKE '%subscription%';

-- 6. Look for recent updates to specific account (replace 'your-account-id' with actual ID)
-- SELECT * FROM accounts WHERE id = 'your-account-id';

-- 7. Check RLS policies on accounts table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'accounts';

-- 8. To monitor changes in real-time, you could create an audit log table:
-- Uncomment and run if you want to track all changes to accounts table

/*
-- Create audit log table
CREATE TABLE IF NOT EXISTS accounts_audit_log (
    id BIGSERIAL PRIMARY KEY,
    account_id UUID,
    changed_at TIMESTAMP DEFAULT NOW(),
    changed_by TEXT,
    old_subscription_status TEXT,
    new_subscription_status TEXT,
    old_is_paid BOOLEAN,
    new_is_paid BOOLEAN,
    operation TEXT,
    changed_fields JSONB
);

-- Create trigger function to log changes
CREATE OR REPLACE FUNCTION log_accounts_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.stripe_subscription_status IS DISTINCT FROM NEW.stripe_subscription_status
           OR OLD.is_paid IS DISTINCT FROM NEW.is_paid THEN
            INSERT INTO accounts_audit_log (
                account_id,
                changed_by,
                old_subscription_status,
                new_subscription_status,
                old_is_paid,
                new_is_paid,
                operation,
                changed_fields
            ) VALUES (
                NEW.id,
                current_user,
                OLD.stripe_subscription_status,
                NEW.stripe_subscription_status,
                OLD.is_paid,
                NEW.is_paid,
                TG_OP,
                jsonb_build_object(
                    'old', row_to_json(OLD),
                    'new', row_to_json(NEW)
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS accounts_changes_trigger ON accounts;
CREATE TRIGGER accounts_changes_trigger
    AFTER UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION log_accounts_changes();

-- Grant access
GRANT SELECT ON accounts_audit_log TO authenticated;
*/
