import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, priceId, venueCount } = req.body;

  try {
    // Validate the email and price ID
    if (!email || !priceId) {
      return res.status(400).json({ error: 'Email and price ID are required' });
    }

    // Create a Stripe checkout session
    // Note: User should already have a trial account created via /api/create-trial-account
    // This checkout session just upgrades them to paid
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Use the selected price ID
          quantity: venueCount || 1, // Use actual venue count, default to 1 if not provided
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      customer_email: email,
      // No metadata needed - webhook will find user by email
    });

    // Return the session ID
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}