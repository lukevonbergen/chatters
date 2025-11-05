const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: 'Missing customerId' });
  }

  try {
    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.status(200).json({
        hasSubscription: false,
        nextBillingDate: null
      });
    }

    const subscription = subscriptions.data[0];

    return res.status(200).json({
      hasSubscription: true,
      nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });

  } catch (error) {
    console.error('Error fetching Stripe subscription:', error);
    return res.status(500).json({
      error: 'Failed to fetch subscription details',
      message: error.message
    });
  }
};
