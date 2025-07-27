import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const BillingPage = () => {
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [userEmail, setUserEmail] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrialInfo = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email;

      if (!email) {
        navigate('/signin');
        return;
      }

      setUserEmail(email);

      const { data: userRow } = await supabase
        .from('users')
        .select('account_id')
        .eq('email', email)
        .single();

      if (!userRow) {
        navigate('/signin');
        return;
      }

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
  }, [navigate]);

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
          {daysLeft !== null && (
            <p className="text-gray-600 text-sm">
              Your free trial ends in <strong>{daysLeft}</strong> day{daysLeft !== 1 && 's'}.
            </p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {/* Monthly Plan */}
          <label className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition 
            ${subscriptionType === 'monthly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
            <div>
              <h2 className="font-semibold text-gray-800">Monthly Plan</h2>
              <p className="text-sm text-gray-600">Pay as you go. Cancel anytime.</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-800">£29/mo</span>
            </div>
            <input
              type="radio"
              value="monthly"
              checked={subscriptionType === 'monthly'}
              onChange={() => setSubscriptionType('monthly')}
              className="hidden"
            />
          </label>

          {/* Yearly Plan */}
          <label className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition relative
            ${subscriptionType === 'yearly' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-400'}`}>
            <div>
              <h2 className="font-semibold text-gray-800 flex items-center">
                Yearly Plan
                <span className="ml-2 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  Best value
                </span>
              </h2>
              <p className="text-sm text-gray-600">Save over 20% vs monthly. One payment for the year.</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-800">£278/yr</span>
              <p className="text-xs text-gray-500">£23.17/mo equivalent</p>
            </div>
            <input
              type="radio"
              value="yearly"
              checked={subscriptionType === 'yearly'}
              onChange={() => setSubscriptionType('yearly')}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 transition text-white text-center font-medium py-3 px-6 rounded-lg"
        >
          {loading ? 'Redirecting…' : 'Upgrade and Continue'}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          Secured checkout powered by Stripe. You can cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default BillingPage;