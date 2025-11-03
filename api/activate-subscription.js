const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Activate subscription for a customer with saved payment method
 * Call this when trial ends or when manually activating
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountId, priceId } = req.body;

  if (!accountId || !priceId) {
    return res.status(400).json({ error: 'Account ID and price ID are required' });
  }

  try {
    // Get account with Stripe customer ID
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('stripe_customer_id, account_type')
      .eq('id', accountId)
      .single();

    if (accountError || !account?.stripe_customer_id) {
      return res.status(404).json({ error: 'Account or Stripe customer not found' });
    }

    // Check if customer has a payment method saved
    const paymentMethods = await stripe.paymentMethods.list({
      customer: account.stripe_customer_id,
      type: 'card',
      limit: 1
    });

    if (paymentMethods.data.length === 0) {
      return res.status(400).json({
        error: 'No payment method on file',
        message: 'Customer must add a payment method before activating subscription'
      });
    }

    // Set the default payment method
    const defaultPaymentMethod = paymentMethods.data[0].id;
    await stripe.customers.update(account.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: defaultPaymentMethod
      }
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: account.stripe_customer_id,
      items: [{ price: priceId }],
      default_payment_method: defaultPaymentMethod,
      metadata: {
        chatters_account_id: accountId
      }
    });

    // Update account in database
    await supabase
      .from('accounts')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        account_type: 'paid',
        is_paid: subscription.status === 'active'
      })
      .eq('id', accountId);

    return res.status(200).json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status
    });

  } catch (error) {
    console.error('Error activating subscription:', error);
    return res.status(500).json({
      error: 'Failed to activate subscription',
      message: error.message
    });
  }
};
