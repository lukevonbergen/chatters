// /pages/api/webhook.js
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: 'Webhook error' });
  }

  // Handle different webhook events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Find the user's account via email
        const { data: user } = await supabase
          .from('users')
          .select('account_id')
          .eq('email', customerEmail)
          .single();

        if (user && user.account_id) {
          // Update existing account with payment info
          const { error: updateError } = await supabase
            .from('accounts')
            .update({
              is_paid: true,
              trial_ends_at: null,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId
            })
            .eq('id', user.account_id);

          if (updateError) throw updateError;
          console.log('Account marked as paid:', user.account_id);
        } else {
          console.warn('No user found for email:', customerEmail);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const isActive = subscription.status === 'active';

        // Update account by stripe customer ID
        const { error: updateError } = await supabase
          .from('accounts')
          .update({
            is_paid: isActive,
            stripe_subscription_id: subscription.id
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) throw updateError;
        console.log('Subscription updated:', subscription.id, 'Active:', isActive);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Mark account as unpaid when subscription cancelled
        const { error: updateError } = await supabase
          .from('accounts')
          .update({
            is_paid: false,
            stripe_subscription_id: null
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) throw updateError;
        console.log('Subscription cancelled:', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Optionally: Set grace period or notify user
        // For now, we'll let subscription.updated handle the status change
        console.log('Payment failed for customer:', customerId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Ensure account is marked as paid (redundant with subscription.updated but safe)
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ is_paid: true })
          .eq('stripe_customer_id', customerId);

        if (updateError) throw updateError;
        console.log('Payment succeeded for customer:', customerId);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ message: err.message });
  }
}