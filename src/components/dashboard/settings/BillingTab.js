import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { useVenue } from '../../../context/VenueContext';
import { Calendar, AlertCircle } from 'lucide-react';
import StripeCheckoutModal from './StripeCheckoutModal';
import SubscriptionManagement from './SubscriptionManagement';
import { Button } from '../../ui/button';

// Pricing configuration
const PRICE_PER_VENUE_MONTHLY = 149; // £149 per venue per month
const PRICE_PER_VENUE_YEARLY = 1430; // £1,430 per venue per year (20% discount)

const BillingTab = ({ allowExpiredAccess = false }) => {
  const { userRole } = useVenue();
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [venueCount, setVenueCount] = useState(0);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email;
      const userId = authData?.user?.id;

      if (!email || !userId) return;

      setUserEmail(email);

      // Get user info
      const { data: userRow } = await supabase
        .from('users')
        .select('account_id, role')
        .eq('id', userId)
        .single();

      if (!userRow) return;

      // For managers, get account_id through their venue
      let accountIdToCheck = userRow.account_id;
      if (userRow.role === 'manager' && !accountIdToCheck) {
        const { data: staffRow } = await supabase
          .from('staff')
          .select('venues!inner(account_id)')
          .eq('user_id', userId)
          .limit(1)
          .single();

        accountIdToCheck = staffRow?.venues?.account_id;
      }

      if (accountIdToCheck) {
        // Store account ID for later use
        setAccountId(accountIdToCheck);

        // Get account data
        const { data: account } = await supabase
          .from('accounts')
          .select('trial_ends_at, is_paid, demo_account, stripe_customer_id, stripe_subscription_id, name, account_type, stripe_subscription_status')
          .eq('id', accountIdToCheck)
          .single();

        // Get venue count for this account
        const { data: venues, count } = await supabase
          .from('venues')
          .select('id, name', { count: 'exact' })
          .eq('account_id', accountIdToCheck);

        setVenueCount(count || 0);

        if (account) {
          const trialEndDate = new Date(account.trial_ends_at);
          const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

          setAccountData({
            ...account,
            daysLeft,
            isExpired: daysLeft <= 0 && !account.is_paid && !account.demo_account,
            venues: venues || []
          });
        }
      }
    };

    fetchBillingInfo();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);

    const priceId =
      subscriptionType === 'monthly'
        ? process.env.REACT_APP_STRIPE_PRICE_MONTHLY
        : process.env.REACT_APP_STRIPE_PRICE_YEARLY;

    try {
      // Get auth session for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in again to continue.');
        setLoading(false);
        return;
      }

      // IMPORTANT: Different flow for trial vs expired trial
      const endpoint = !accountData?.isExpired
        ? '/api/setup-payment-method'  // Trial: Just save card, NO CHARGE
        : '/api/create-subscription-intent';  // Expired: Charge immediately

      const body = !accountData?.isExpired
        ? {}  // Setup only needs auth token (backend gets account from token)
        : { priceId };  // Subscription needs pricing (venueCount fetched from DB on backend)

      console.log('Calling endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Failed to process payment';
        const errorDetails = data.details ? ` (${data.details})` : '';
        throw new Error(errorMessage + errorDetails);
      }

      if (!data.clientSecret) {
        throw new Error('No client secret returned');
      }

      // Open modal with client secret
      setClientSecret(data.clientSecret);
      setCheckoutModalOpen(true);
      setLoading(false);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Checkout failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (status = 'succeeded') => {
    // Close modal
    setCheckoutModalOpen(false);
    setClientSecret(null);

    // Show appropriate success message based on status
    if (status === 'setup_succeeded') {
      // Setup mode - card saved, no charge
      alert('✓ Payment details saved successfully!\n\nYour card has been securely saved. You will not be charged until your trial period expires.\n\nYou can continue using Chatters throughout your trial.');
    } else if (status === 'processing') {
      // Direct Debit payment processing
      alert('Direct Debit setup successful! Your payment will be processed within 3-5 business days. You\'ll receive access once the payment clears.');
    } else {
      // Payment succeeded
      alert('Payment successful! Your subscription is now active.');
    }

    // Refresh billing info
    window.location.reload();
  };

  const handleCloseModal = () => {
    setCheckoutModalOpen(false);
    setClientSecret(null);
    setLoading(false);
  };

  // Calculate total pricing based on venue count
  const monthlyTotal = venueCount * PRICE_PER_VENUE_MONTHLY;
  const yearlyTotal = venueCount * PRICE_PER_VENUE_YEARLY;
  const yearlyMonthlyEquivalent = yearlyTotal / 12;
  const yearlyDiscount = ((monthlyTotal * 12 - yearlyTotal) / (monthlyTotal * 12) * 100).toFixed(0);

  // Show loading state while data is being fetched
  if (!accountData && userRole !== 'admin') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only masters can access
  if (userRole !== 'master' && !accountData?.isExpired) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">
              Only account owners can view billing information.
            </p>
            <p className="text-sm text-gray-500">
              Contact your account owner if you need access to billing details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Demo account - show special message and disable billing
  if (accountData?.demo_account) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Demo Account</h3>
          <p className="text-sm text-gray-500 mt-1">This is a demonstration account</p>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            This is a demonstration account with full access to all features. Billing is disabled for demo accounts.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li>• Unlimited venue access</li>
            <li>• All premium features enabled</li>
            <li>• No billing or payment required</li>
          </ul>
          <p className="text-sm text-gray-500 pt-4 border-t border-gray-100">
            For questions about your demo account, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banners */}
      {accountData?.isExpired && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Your trial has expired</p>
            <p className="text-red-700 text-sm mt-1">
              Please upgrade to continue using Chatters for your {venueCount} venue{venueCount !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      )}

      {accountData && !accountData.isExpired && accountData.daysLeft !== null && !accountData.is_paid && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <Calendar className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">
              Your free trial ends in <strong>{accountData.daysLeft}</strong> day{accountData.daysLeft !== 1 ? 's' : ''}
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Upgrade now to continue using Chatters without interruption.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Plans Card */}
      {!accountData?.is_paid && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              {!accountData?.isExpired ? 'Add Payment Details' : 'Choose Your Plan'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {!accountData?.isExpired
                ? 'Save your payment details for seamless access when your trial ends'
                : 'Select a subscription plan to continue using Chatters'
              }
            </p>
          </div>

          <div className="p-6">
            {/* No charge today notice */}
            {!accountData?.isExpired && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-medium">No charge today</p>
                <p className="text-blue-800 text-sm mt-1">
                  Add your payment details now for seamless access when your trial ends in {accountData?.daysLeft} day{accountData?.daysLeft !== 1 ? 's' : ''}.
                  You won't be charged until your trial period expires.
                </p>
              </div>
            )}

            {/* Plan Options */}
            <div className="space-y-4 mb-6">
              {/* Monthly Plan */}
              <label className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-2 rounded-xl p-5 cursor-pointer transition
                ${subscriptionType === 'monthly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="font-semibold text-gray-800 text-lg">Monthly Plan</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    £{PRICE_PER_VENUE_MONTHLY} per venue per month · Pay as you go · Cancel anytime
                  </p>
                  {!accountData?.isExpired && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      Billing starts after your {accountData?.daysLeft}-day trial
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:ml-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {!accountData?.isExpired ? 'After trial' : 'Total'} for {venueCount} venue{venueCount !== 1 ? 's' : ''}
                    </div>
                    <span className="text-2xl font-bold text-gray-800">£{monthlyTotal.toLocaleString()}</span>
                    <span className="text-gray-600">/mo</span>
                  </div>
                  <input
                    type="radio"
                    value="monthly"
                    checked={subscriptionType === 'monthly'}
                    onChange={() => setSubscriptionType('monthly')}
                    className="ml-4 h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </label>

              {/* Yearly Plan */}
              <label className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-2 rounded-xl p-5 cursor-pointer transition relative
                ${subscriptionType === 'yearly' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-400'}`}>
                <div className="absolute -top-3 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  SAVE {yearlyDiscount}%
                </div>
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="font-semibold text-gray-800 text-lg">Yearly Plan</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    £{PRICE_PER_VENUE_YEARLY} per venue per year · Best value · One payment
                  </p>
                  {!accountData?.isExpired && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Billing starts after your {accountData?.daysLeft}-day trial
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:ml-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {!accountData?.isExpired ? 'After trial' : 'Total'} for {venueCount} venue{venueCount !== 1 ? 's' : ''}
                    </div>
                    <span className="text-2xl font-bold text-gray-800">£{yearlyTotal.toLocaleString()}</span>
                    <span className="text-gray-600">/yr</span>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      £{yearlyMonthlyEquivalent.toFixed(2)}/mo equivalent
                    </p>
                  </div>
                  <input
                    type="radio"
                    value="yearly"
                    checked={subscriptionType === 'yearly'}
                    onChange={() => setSubscriptionType('yearly')}
                    className="ml-4 h-5 w-5 text-green-600 focus:ring-green-500"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="text-sm text-gray-500">
                {!accountData?.isExpired ? (
                  <>
                    Secure · No charge until trial ends · Cancel anytime before {new Date(accountData?.trial_ends_at).toLocaleDateString()}
                  </>
                ) : (
                  'Secured checkout powered by Stripe'
                )}
              </div>
              <Button
                variant="primary"
                onClick={handleCheckout}
                loading={loading}
              >
                {loading ? 'Processing...' : !accountData?.isExpired
                  ? 'Add Payment Details'
                  : `Subscribe Now - £${subscriptionType === 'monthly' ? monthlyTotal.toLocaleString() : yearlyTotal.toLocaleString()}${subscriptionType === 'monthly' ? '/mo' : '/yr'}`
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Subscription Management */}
      {accountData?.is_paid && accountData.stripe_customer_id && accountId && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Subscription Details</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your active subscription and billing</p>
          </div>
          <div className="p-6">
            <SubscriptionManagement
              accountId={accountId}
              userEmail={userEmail}
            />
          </div>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePaymentSuccess}
        clientSecret={clientSecret}
        total={subscriptionType === 'monthly' ? monthlyTotal : yearlyTotal}
        billingPeriod={subscriptionType}
        venueCount={venueCount}
        isSetupMode={!accountData?.isExpired}
      />
    </div>
  );
};

export default BillingTab;
