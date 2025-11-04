import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import {
  CreditCard,
  Download,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Update Payment Method Component
const UpdatePaymentMethodForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/billing`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          {isProcessing ? 'Updating...' : 'Save Payment Method'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const SubscriptionManagement = ({ accountId, userEmail }) => {
  const [subscription, setSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [setupSecret, setSetupSecret] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [accountId]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/get-subscription-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();

      if (data.subscription) {
        setSubscription(data.subscription);
      }

      if (data.paymentMethod) {
        setPaymentMethod(data.paymentMethod);
      }

      if (data.invoices) {
        // Filter out void/draft invoices, only show paid ones
        const paidInvoices = data.invoices.filter(invoice => invoice.status === 'paid');
        setInvoices(paidInvoices);
      }

    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setSetupSecret(data.clientSecret);
        setShowUpdatePayment(true);
      }
    } catch (error) {
      console.error('Error creating setup intent:', error);
      alert('Failed to initialize payment update. Please try again.');
    }
  };

  const handlePaymentUpdateSuccess = () => {
    setShowUpdatePayment(false);
    setSetupSecret(null);
    alert('Payment method updated successfully!');
    loadSubscriptionData();
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Subscription cancelled. You\'ll have access until the end of your current billing period.');
        setShowCancelConfirm(false);
        loadSubscriptionData();
      } else {
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await fetch('/api/download-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription & Payment Method - Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Card */}
        {subscription && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Current Plan</h3>
                <p className="text-2xl font-bold text-gray-900">{subscription.planName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : subscription.status === 'past_due'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {subscription.status === 'active' ? 'Active' : subscription.status === 'past_due' ? 'Past Due' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-t border-blue-200">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-lg font-semibold text-gray-900">
                  £{(subscription.amount / 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-600">/{subscription.interval === 'month' ? 'mo' : 'yr'}</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-blue-200">
                <span className="text-sm text-gray-600">Next billing</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-700">
                      <p className="font-semibold mb-1">Cancellation Scheduled</p>
                      <p>Access ends {new Date(subscription.current_period_end * 1000).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>
              )}

              {!subscription.cancel_at_period_end && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="mt-4 w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Payment Method Card */}
        {paymentMethod && !showUpdatePayment && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Payment Method</h3>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {paymentMethod.brand} •••• {paymentMethod.last4}
                </p>
              </div>
              <button
                onClick={handleUpdatePaymentMethod}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Update payment method"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <div className="w-16 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Expires</p>
                <p className="text-sm font-medium text-gray-900">
                  {paymentMethod.exp_month.toString().padStart(2, '0')}/{paymentMethod.exp_year}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Update Payment Method Form */}
        {showUpdatePayment && setupSecret && (
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Payment Method</h3>
            <Elements stripe={stripePromise} options={{ clientSecret: setupSecret }}>
              <UpdatePaymentMethodForm
                onSuccess={handlePaymentUpdateSuccess}
                onCancel={() => {
                  setShowUpdatePayment(false);
                  setSetupSecret(null);
                }}
              />
            </Elements>
          </div>
        )}
      </div>

      {/* Invoices - Sleek List */}
      {invoices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Billing History</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold text-gray-900">
                          £{(invoice.amount_paid / 100).toFixed(2)}
                        </p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Paid
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(invoice.created * 1000).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadInvoice(invoice.id)}
                    className="ml-4 p-2 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Download invoice"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoices.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No invoices yet</p>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Subscription?</h3>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              You'll continue to have access until <strong>{subscription ? new Date(subscription.current_period_end * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</strong>.
              After that, your subscription will end.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Keep Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
