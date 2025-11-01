import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, priceId, venueCount } = req.body;

  try {
    // Validate required fields
    if (!email || !priceId || !venueCount) {
      return res.status(400).json({ error: 'Email, price ID, and venue count are required' });
    }

    // Find user's account
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('account_id, role')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('stripe_customer_id')
      .eq('id', user.account_id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let customerId = account.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          account_id: user.account_id,
        },
      });
      customerId = customer.id;

      // Save customer ID to account
      await supabase
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.account_id);
    }

    // Create the subscription with payment pending
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
          quantity: venueCount,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card', 'bacs_debit'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    const paymentIntent = subscription.latest_invoice.payment_intent;

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Subscription intent creation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
