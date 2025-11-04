const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ error: 'Invoice ID is required' });
  }

  try {
    // Get invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Return the PDF URL
    return res.status(200).json({
      url: invoice.invoice_pdf,
      hosted_url: invoice.hosted_invoice_url
    });

  } catch (error) {
    console.error('Error retrieving invoice:', error);
    return res.status(500).json({
      error: 'Failed to retrieve invoice',
      message: error.message
    });
  }
};
