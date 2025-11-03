import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { useVenue } from '../../../context/VenueContext';
import { CreditCard, Building2, Calendar, Receipt, ExternalLink, AlertCircle } from 'lucide-react';
import StripeCheckoutModal from './StripeCheckoutModal';

// Pricing configuration
const PRICE_PER_VENUE_MONTHLY = 149; // £149 per venue per month
const PRICE_PER_VENUE_YEARLY = 1430; // £1,430 per venue per year (20% discount)

const BillingTab = ({ allowExpiredAccess = false }) => {
  const { userRole } = useVenue();
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
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
      // IMPORTANT: Different flow for trial vs expired trial
      const endpoint = !accountData?.isExpired
        ? '/api/setup-payment-method'  // Trial: Just save card, NO CHARGE
        : '/api/create-subscription-intent';  // Expired: Charge immediately

      const body = !accountData?.isExpired
        ? { email: userEmail, accountId: accountId }  // Setup only needs email + accountId
        : { email: userEmail, priceId, venueCount };  // Subscription needs pricing

      console.log('Calling endpoint:', endpoint, 'with body:', body);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleManageSubscription = async () => {
    setPortalLoading(true);

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(error);
        setPortalLoading(false);
        return;
      }

      // Redirect to Stripe customer portal
      window.location.href = url;
    } catch (error) {
      console.error('Portal session error:', error);
      alert('Failed to open billing portal. Please try again.');
      setPortalLoading(false);
    }
  };

  // Calculate total pricing based on venue count
  const monthlyTotal = venueCount * PRICE_PER_VENUE_MONTHLY;
  const yearlyTotal = venueCount * PRICE_PER_VENUE_YEARLY;
  const yearlyMonthlyEquivalent = yearlyTotal / 12;
  const yearlyDiscount = ((monthlyTotal * 12 - yearlyTotal) / (monthlyTotal * 12) * 100).toFixed(0);

  // Show loading state while data is being fetched
  if (!accountData && userRole !== 'admin') {
    return (
      <div className="max-w-5xl">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // Only masters can access
  if (userRole !== 'master' && !accountData?.isExpired) {
    return (
      <div className="max-w-none lg:max-w-2xl">
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
    );
  }

  // Demo account - show special message and disable billing
  if (accountData?.demo_account) {
    return (
      <div className="w-full">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-300 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Demo Account</h3>
            <p className="text-gray-600 mb-6">
              This is a demonstration account with full access to all features. Billing is disabled for demo accounts.
            </p>
            <div className="border-t border-gray-200 pt-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Unlimited venue access</li>
                <li>• All premium features enabled</li>
                <li>• No billing or payment required</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
              For questions about your demo account, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Account Overview - removed duplicate title */}

      {/* Status Banners */}
      {accountData?.isExpired && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
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

      {accountData?.is_paid && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">Active Subscription</p>
            <p className="text-green-700 text-sm mt-1">
              Your subscription is active and covers {venueCount} venue{venueCount !== 1 ? 's' : ''}.
            </p>
          </div>
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {portalLoading ? 'Loading...' : (
              <>
                Manage Subscription
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-8">
        {/* Current Plan Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Current Plan</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${accountData?.is_paid ? 'text-green-600' : 'text-yellow-600'}`}>
                {accountData?.is_paid ? 'Active' : accountData?.demo_account ? 'Demo Account' : 'Trial'}
              </span>
            </div>
            {!accountData?.is_paid && accountData?.daysLeft !== null && accountData?.daysLeft !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trial ends:</span>
                <span className="font-medium text-gray-900">{accountData?.daysLeft} days</span>
              </div>
            )}
          </div>
        </div>

        {/* Venues Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Your Venues</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total venues:</span>
              <span className="font-medium text-gray-900">{venueCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price per venue:</span>
              <span className="font-medium text-gray-900">
                £{PRICE_PER_VENUE_MONTHLY}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Venue List */}
      {accountData?.venues && accountData.venues.length > 0 && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Venues in your account</h3>
          <div className="space-y-2">
            {accountData.venues.map((venue) => (
              <div key={venue.id} className="flex items-center gap-2 text-sm text-gray-700">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{venue.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      {!accountData?.is_paid && (
        <>
          {/* Different heading based on trial status */}
          {!accountData?.isExpired ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Payment Details</h3>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-medium">No charge today</p>
                <p className="text-blue-800 text-sm mt-1">
                  Add your payment details now for seamless access when your trial ends in {accountData?.daysLeft} day{accountData?.daysLeft !== 1 ? 's' : ''}.
                  You won't be charged until your trial period expires.
                </p>
              </div>
            </>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
          )}
          <div className="space-y-4 mb-8">
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

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 font-semibold disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : !accountData?.isExpired
                ? 'Add Payment Details (No Charge Today)'
                : `Subscribe Now - £${subscriptionType === 'monthly' ? monthlyTotal.toLocaleString() : yearlyTotal.toLocaleString()}${subscriptionType === 'monthly' ? '/mo' : '/yr'}`
              }
            </button>

            <div className="text-sm text-gray-500">
              {!accountData?.isExpired ? (
                <p>
                  🔒 Secure · No charge until trial ends<br/>
                  <span className="text-xs">Cancel anytime before {new Date(accountData?.trial_ends_at).toLocaleDateString()}</span>
                </p>
              ) : (
                <p>Secured checkout powered by Stripe</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Active Subscription Management */}
      {accountData?.is_paid && accountData.stripe_customer_id && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Subscription Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage your subscription, update payment methods, view invoices, and more in the Stripe customer portal.
          </p>
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {portalLoading ? 'Opening Portal...' : (
              <>
                <CreditCard className="w-5 h-5" />
                Open Billing Portal
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Pricing Note */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Pricing is based on the number of venues in your account.
          {venueCount > 1 ? ` You currently have ${venueCount} venues.` : ' Add more venues as you grow.'}
          Each venue costs £{PRICE_PER_VENUE_MONTHLY}/month or £{PRICE_PER_VENUE_YEARLY}/year.
        </p>
      </div>

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
