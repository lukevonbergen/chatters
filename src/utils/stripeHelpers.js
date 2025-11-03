/**
 * Create a Stripe customer for a new account
 * Call this from your backend/serverless function
 *
 * @param {object} params
 * @param {string} params.email - Customer email
 * @param {string} params.accountName - Account/company name
 * @param {string} params.accountId - Chatters account ID
 * @param {string} params.accountType - 'trial', 'demo', 'test', or 'paid'
 * @param {Date} params.trialEndsAt - When the trial ends (optional)
 * @returns {Promise<{customerId: string}>}
 */
export const createStripeCustomer = async ({
  email,
  accountName,
  accountId,
  accountType = 'trial',
  trialEndsAt = null
}) => {
  const response = await fetch('/api/create-stripe-customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      accountName,
      accountId,
      accountType,
      trialEndsAt
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create Stripe customer');
  }

  const data = await response.json();
  return { customerId: data.customerId };
};

/**
 * Create a subscription for an existing Stripe customer
 *
 * @param {object} params
 * @param {string} params.customerId - Stripe customer ID
 * @param {string} params.priceId - Stripe price ID
 * @param {number} params.trialDays - Number of trial days (optional)
 * @returns {Promise<{subscriptionId: string, status: string}>}
 */
export const createSubscription = async ({
  customerId,
  priceId,
  trialDays = null
}) => {
  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId,
      priceId,
      trialDays
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create subscription');
  }

  const data = await response.json();
  return {
    subscriptionId: data.subscriptionId,
    status: data.status
  };
};

/**
 * Setup payment method during trial (no charge)
 * Creates a SetupIntent for collecting payment details without charging
 *
 * @param {object} params
 * @param {string} params.email - Customer email
 * @param {string} params.accountId - Chatters account ID
 * @returns {Promise<{clientSecret: string, customerId: string}>}
 */
export const setupPaymentMethod = async ({ email, accountId }) => {
  const response = await fetch('/api/setup-payment-method', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, accountId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to setup payment method');
  }

  const data = await response.json();
  return {
    clientSecret: data.clientSecret,
    customerId: data.customerId
  };
};

/**
 * Activate subscription after trial or manually
 * Requires payment method to be already saved
 *
 * @param {object} params
 * @param {string} params.accountId - Chatters account ID
 * @param {string} params.priceId - Stripe price ID
 * @returns {Promise<{subscriptionId: string, status: string}>}
 */
export const activateSubscription = async ({ accountId, priceId }) => {
  const response = await fetch('/api/activate-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, priceId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to activate subscription');
  }

  const data = await response.json();
  return {
    subscriptionId: data.subscriptionId,
    status: data.status
  };
};
