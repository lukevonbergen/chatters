const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  try {
    // Get account data from Supabase
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.stripe_customer_id) {
      return res.status(200).json({
        subscription: null,
        paymentMethod: null,
        invoices: []
      });
    }

    const result = {
      subscription: null,
      paymentMethod: null,
      invoices: []
    };

    // Get subscription details
    if (account.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(account.stripe_subscription_id);

      result.subscription = {
        id: subscription.id,
        status: subscription.status,
        planName: subscription.items.data[0].price.nickname || 'Chatters Subscription',
        amount: subscription.items.data[0].price.unit_amount,
        interval: subscription.items.data[0].price.recurring.interval,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
      };
    }

    // Get default payment method
    const customer = await stripe.customers.retrieve(account.stripe_customer_id);

    if (customer.invoice_settings?.default_payment_method) {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        customer.invoice_settings.default_payment_method
      );

      result.paymentMethod = {
        id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year
      };
    }

    // Get recent invoices
    const invoices = await stripe.invoices.list({
      customer: account.stripe_customer_id,
      limit: 10
    });

    result.invoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount_paid: invoice.amount_paid,
      created: invoice.created,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url
    }));

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return res.status(500).json({
      error: 'Failed to fetch subscription details',
      message: error.message
    });
  }
};
