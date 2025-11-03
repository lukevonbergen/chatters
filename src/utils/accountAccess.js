import { supabase } from './supabase';

/**
 * Check if an account has access to the application
 * Based on account_type and subscription status
 *
 * @param {string} accountId - The account ID to check
 * @returns {Promise<{hasAccess: boolean, reason: string, accountData: object}>}
 */
export const checkAccountAccess = async (accountId) => {
  if (!accountId) {
    return { hasAccess: false, reason: 'No account ID provided', accountData: null };
  }

  const { data: account, error } = await supabase
    .from('accounts')
    .select('account_type, stripe_subscription_status, trial_ends_at, is_paid')
    .eq('id', accountId)
    .single();

  if (error || !account) {
    return { hasAccess: false, reason: 'Account not found', accountData: null };
  }

  // Demo accounts always have access
  if (account.account_type === 'demo') {
    return { hasAccess: true, reason: 'Demo account', accountData: account };
  }

  // Test accounts need active subscription
  if (account.account_type === 'test') {
    const isActive = account.stripe_subscription_status === 'active';
    return {
      hasAccess: isActive,
      reason: isActive ? 'Active test subscription' : 'Test subscription not active',
      accountData: account
    };
  }

  // Trial accounts
  if (account.account_type === 'trial') {
    const now = new Date();
    const trialEnd = new Date(account.trial_ends_at);

    // Still in trial
    if (now < trialEnd) {
      return { hasAccess: true, reason: 'Active trial', accountData: account };
    }

    // Trial ended - need active subscription
    const hasActiveSubscription = account.stripe_subscription_status === 'active';
    return {
      hasAccess: hasActiveSubscription,
      reason: hasActiveSubscription ? 'Active subscription' : 'Trial expired, no active subscription',
      accountData: account
    };
  }

  // Paid accounts need active subscription
  if (account.account_type === 'paid') {
    const isActive = account.stripe_subscription_status === 'active';
    return {
      hasAccess: isActive,
      reason: isActive ? 'Active subscription' : 'Subscription not active',
      accountData: account
    };
  }

  // Fallback to old is_paid logic for accounts without account_type set
  if (!account.account_type) {
    // Check trial
    if (account.trial_ends_at) {
      const now = new Date();
      const trialEnd = new Date(account.trial_ends_at);
      if (now < trialEnd) {
        return { hasAccess: true, reason: 'Active trial (legacy)', accountData: account };
      }
    }

    // Check if paid
    const hasPaid = account.is_paid || account.stripe_subscription_status === 'active';
    return {
      hasAccess: hasPaid,
      reason: hasPaid ? 'Active subscription (legacy)' : 'No active subscription',
      accountData: account
    };
  }

  return { hasAccess: false, reason: 'Unknown account state', accountData: account };
};

/**
 * Get user's account ID based on their role
 *
 * @param {string} userId - The user ID
 * @returns {Promise<string|null>} - The account ID or null
 */
export const getUserAccountId = async (userId) => {
  if (!userId) return null;

  // Get user info
  const { data: userRow } = await supabase
    .from('users')
    .select('account_id, role')
    .eq('id', userId)
    .single();

  if (!userRow) return null;

  // For managers, get account_id through their venue
  let accountId = userRow.account_id;
  if (userRow.role === 'manager' && !accountId) {
    const { data: staffRow } = await supabase
      .from('staff')
      .select('venues!inner(account_id)')
      .eq('user_id', userId)
      .limit(1)
      .single();

    accountId = staffRow?.venues?.account_id;
  }

  return accountId;
};
