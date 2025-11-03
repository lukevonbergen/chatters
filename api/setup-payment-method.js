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

  console.log('Setup payment method called with:', { email, accountId });

  if (!email || !accountId) {
    console.error('Missing required fields:', { email, accountId });
    return res.status(400).json({ error: 'Email and account ID are required' });
  }

  try {
    console.log('Fetching account from database...');
    // Get or create Stripe customer
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('stripe_customer_id, name')
      .eq('id', accountId)
      .single();

    if (accountError) {
      console.error('Supabase error fetching account:', accountError);
      throw new Error(`Database error: ${accountError.message}`);
    }

    console.log('Account fetched:', { accountId, hasCustomerId: !!account?.stripe_customer_id });

    let customerId = account?.stripe_customer_id;

    // If no customer exists, create one
    if (!customerId) {
      console.log('Creating new Stripe customer...');
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
      console.log('Stripe customer created:', customerId);

      // Save customer ID to database
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', accountId);

      if (updateError) {
        console.error('Error saving customer ID to database:', updateError);
        throw new Error(`Failed to save customer ID: ${updateError.message}`);
      }
      console.log('Customer ID saved to database');
    }

    // Create SetupIntent for collecting payment method
    console.log('Creating SetupIntent for customer:', customerId);
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'bacs_debit'],
      metadata: {
        chatters_account_id: accountId
      }
    });

    console.log('SetupIntent created successfully:', setupIntent.id);
    return res.status(200).json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId: customerId
    });

  } catch (error) {
    console.error('Error creating setup intent:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code
    });
    return res.status(500).json({
      error: 'Failed to create setup intent',
      message: error.message,
      details: error.type || error.code || 'Unknown error'
    });
  }
};
