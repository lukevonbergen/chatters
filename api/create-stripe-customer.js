const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, accountName, accountId, accountType, trialEndsAt } = req.body;

  if (!email || !accountId) {
    return res.status(400).json({ error: 'Email and account ID are required' });
  }

  try {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: accountName || email,
      metadata: {
        chatters_account_id: accountId,
        chatters_account_name: accountName || email,
        account_type: accountType || 'trial',
        trial_ends_at: trialEndsAt || ''
      }
    });

    // Update account with Stripe customer ID
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        stripe_customer_id: customer.id,
        account_type: accountType || 'trial'
      })
      .eq('id', accountId);

    if (updateError) {
      console.error('Error updating account with Stripe customer ID:', updateError);
      // Don't fail the request - customer was created successfully
    }

    return res.status(200).json({
      success: true,
      customerId: customer.id
    });

  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return res.status(500).json({
      error: 'Failed to create Stripe customer',
      message: error.message
    });
  }
};
