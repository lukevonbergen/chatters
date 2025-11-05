const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Webhook endpoint secret - get this from Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('Received webhook event:', event.type);

  // Handle different event types
  try {
    switch (event.type) {
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle subscription updates (status changes, quantity changes, etc.)
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  console.log('Status:', subscription.status);
  console.log('Current period:', subscription.current_period_start, '-', subscription.current_period_end);

  // Find account by stripe_subscription_id
  const { data: account, error: findError } = await supabase
    .from('accounts')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (findError || !account) {
    console.error('Account not found for subscription:', subscription.id);
    return;
  }

  // Update account with new subscription status
  const isPaid = ['active', 'trialing'].includes(subscription.status);

  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      stripe_subscription_status: subscription.status,
      is_paid: isPaid,
    })
    .eq('id', account.id);

  if (updateError) {
    console.error('Error updating account:', updateError);
  } else {
    console.log(`Account ${account.id} updated: status=${subscription.status}, is_paid=${isPaid}`);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);

  const { data: account, error: findError } = await supabase
    .from('accounts')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (findError || !account) {
    console.error('Account not found for subscription:', subscription.id);
    return;
  }

  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      stripe_subscription_status: 'canceled',
      is_paid: false,
    })
    .eq('id', account.id);

  if (updateError) {
    console.error('Error updating account:', updateError);
  } else {
    console.log(`Account ${account.id} marked as canceled`);
  }
}

// Handle successful payment
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  console.log('Amount paid:', invoice.amount_paid / 100, invoice.currency.toUpperCase());

  if (!invoice.subscription) {
    console.log('Invoice not associated with subscription');
    return;
  }

  const { data: account, error: findError } = await supabase
    .from('accounts')
    .select('id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (findError || !account) {
    console.error('Account not found for subscription:', invoice.subscription);
    return;
  }

  // Mark account as paid
  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      is_paid: true,
      stripe_subscription_status: 'active',
    })
    .eq('id', account.id);

  if (updateError) {
    console.error('Error updating account:', updateError);
  } else {
    console.log(`Account ${account.id} payment succeeded`);
  }
}

// Handle failed payment
async function handleInvoicePaymentFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);
  console.log('Attempt count:', invoice.attempt_count);

  if (!invoice.subscription) {
    console.log('Invoice not associated with subscription');
    return;
  }

  const { data: account, error: findError } = await supabase
    .from('accounts')
    .select('id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (findError || !account) {
    console.error('Account not found for subscription:', invoice.subscription);
    return;
  }

  // Mark account as past_due
  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      is_paid: false,
      stripe_subscription_status: 'past_due',
    })
    .eq('id', account.id);

  if (updateError) {
    console.error('Error updating account:', updateError);
  } else {
    console.log(`Account ${account.id} marked as past_due`);
  }
}

// Handle new subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('New subscription created:', subscription.id);
  console.log('Customer:', subscription.customer);
  console.log('Status:', subscription.status);

  // This is typically handled during checkout, but we can log it
  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (account) {
    console.log(`Subscription ${subscription.id} already linked to account ${account.id}`);
  } else {
    console.log(`New subscription ${subscription.id} - may need manual linking`);
  }
}
