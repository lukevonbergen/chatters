const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a SetupIntent for collecting payment method without charging
 * This is used during trial to collect payment details for future billing
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, accountId } = req.body;

  if (!email || !accountId) {
    return res.status(400).json({ error: 'Email and account ID are required' });
  }

  try {
    // Get or create Stripe customer
    const { data: account } = await supabase
      .from('accounts')
      .select('stripe_customer_id, name')
      .eq('id', accountId)
      .single();

    let customerId = account?.stripe_customer_id;

    // If no customer exists, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: account?.name || email,
        metadata: {
          chatters_account_id: accountId,
          chatters_account_name: account?.name || email,
          account_type: 'trial'
        }
      });

      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', accountId);
    }

    // Create SetupIntent for collecting payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'bacs_debit'],
      metadata: {
        chatters_account_id: accountId
      }
    });

    return res.status(200).json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId: customerId
    });

  } catch (error) {
    console.error('Error creating setup intent:', error);
    return res.status(500).json({
      error: 'Failed to create setup intent',
      message: error.message
    });
  }
};
