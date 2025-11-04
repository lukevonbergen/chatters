import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import {
  CreditCard,
  Calendar,
  Receipt,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isProcessing ? 'Updating...' : 'Update Payment Method'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
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

      // Fetch subscription details from your API
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
        setInvoices(data.invoices);
      }

    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      // Create a SetupIntent for updating payment method
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
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      {subscription && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Subscription</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-700'
                : subscription.status === 'past_due'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Plan</p>
              <p className="text-gray-900 font-medium">
                {subscription.planName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className="text-gray-900 font-medium">
                £{(subscription.amount / 100).toFixed(2)} / {subscription.interval}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Period</p>
              <p className="text-gray-900 font-medium">
                {new Date(subscription.current_period_start * 1000).toLocaleDateString()} - {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </p>
            </div>
            {subscription.cancel_at_period_end && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Cancels On</p>
                <p className="text-red-600 font-medium">
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {!subscription.cancel_at_period_end && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      )}

      {/* Payment Method */}
      {paymentMethod && !showUpdatePayment && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            <button
              onClick={handleUpdatePaymentMethod}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Update
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                {paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)} •••• {paymentMethod.last4}
              </p>
              <p className="text-sm text-gray-600">
                Expires {paymentMethod.exp_month.toString().padStart(2, '0')}/{paymentMethod.exp_year}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Update Payment Method Form */}
      {showUpdatePayment && setupSecret && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
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

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>

          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-gray-900 font-medium">
                      £{(invoice.amount_paid / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(invoice.created * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                  <button
                    onClick={() => downloadInvoice(invoice.id)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Download Invoice"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period on {subscription ? new Date(subscription.current_period_end * 1000).toLocaleDateString() : ''}.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
