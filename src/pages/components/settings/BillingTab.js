import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../../../utils/supabase';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const BillingTab = () => {
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [userEmail, setUserEmail] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrialInfo = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email;

      if (!email) return;

      setUserEmail(email);

      const { data: userRow } = await supabase
        .from('users')
        .select('account_id')
        .eq('email', email)
        .single();

      if (!userRow) return;

      const { data: account } = await supabase
        .from('accounts')
        .select('trial_ends_at')
        .eq('id', userRow.account_id)
        .single();

      if (account?.trial_ends_at) {
        setTrialEndsAt(account.trial_ends_at);
      }
    };

    fetchTrialInfo();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);

    const priceId =
      subscriptionType === 'monthly'
        ? process.env.REACT_APP_STRIPE_PRICE_MONTHLY
        : process.env.REACT_APP_STRIPE_PRICE_YEARLY;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, priceId }),
    });

    const { id } = await response.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: id });
  };

  const daysLeft = trialEndsAt
    ? Math.max(
        0,
        Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;

  return (
    <div className="max-w-none lg:max-w-2xl">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Billing & Subscription</h2>
        <p className="text-gray-600 text-sm">Manage your subscription and billing information.</p>
        {daysLeft !== null && (
          <div className="mt-3 p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              Your free trial ends in <strong>{daysLeft}</strong> day{daysLeft !== 1 && 's'}.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
        {/* Monthly Plan */}
        <label className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-4 lg:p-5 cursor-pointer transition 
          ${subscriptionType === 'monthly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
          <div className="flex-1 mb-3 sm:mb-0">
            <h3 className="font-semibold text-gray-800 text-base lg:text-lg">Monthly Plan</h3>
            <p className="text-sm text-gray-600">Pay as you go. Cancel anytime.</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:ml-4">
            <div className="text-right">
              <span className="text-lg lg:text-xl font-bold text-gray-800">£29/mo</span>
            </div>
            <input
              type="radio"
              value="monthly"
              checked={subscriptionType === 'monthly'}
              onChange={() => setSubscriptionType('monthly')}
              className="ml-4 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </label>

        {/* Yearly Plan */}
        <label className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-4 lg:p-5 cursor-pointer transition relative
          ${subscriptionType === 'yearly' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-400'}`}>
          <div className="flex-1 mb-3 sm:mb-0">
            <h3 className="font-semibold text-gray-800 flex flex-col sm:flex-row sm:items-center text-base lg:text-lg">
              <span>Yearly Plan</span>
              <span className="mt-1 sm:mt-0 sm:ml-2 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full w-fit">
                Best value
              </span>
            </h3>
            <p className="text-sm text-gray-600">Save over 20% vs monthly. One payment for the year.</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:ml-4">
            <div className="text-right">
              <span className="text-lg lg:text-xl font-bold text-gray-800">£278/yr</span>
              <p className="text-xs text-gray-500">£23.17/mo equivalent</p>
            </div>
            <input
              type="radio"
              value="yearly"
              checked={subscriptionType === 'yearly'}
              onChange={() => setSubscriptionType('yearly')}
              className="ml-4 h-4 w-4 text-green-600 focus:ring-green-500"
            />
          </div>
        </label>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full sm:w-auto bg-black text-white px-6 lg:px-8 py-3 lg:py-4 rounded-md hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 text-sm lg:text-base font-medium"
        >
          {loading ? 'Redirecting…' : 'Upgrade and Continue'}
        </button>

        <p className="text-xs text-gray-500">
          Secured checkout powered by Stripe. You can cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default BillingTab;