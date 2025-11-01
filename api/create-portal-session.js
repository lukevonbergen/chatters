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

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user's account
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('account_id, role')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only masters can access billing portal
    if (user.role !== 'master') {
      return res.status(403).json({ error: 'Only account owners can access billing' });
    }

    // Get account with Stripe customer ID
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('stripe_customer_id')
      .eq('id', user.account_id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.stripe_customer_id) {
      return res.status(400).json({
        error: 'No active subscription found. Please start a subscription first.'
      });
    }

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: account.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account/billing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal session creation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
