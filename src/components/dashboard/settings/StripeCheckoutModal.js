import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { X, CreditCard, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onSuccess, onCancel, total, billingPeriod, venueCount }) => {
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

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else {
      // Payment succeeded or is processing
      // For BACS Direct Debit, the payment will be in 'processing' state
      // For cards, it will be 'succeeded'
      if (paymentIntent?.status === 'processing') {
        onSuccess('processing');
      } else {
        onSuccess('succeeded');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary - More Compact */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span className="text-gray-600 text-xs">Plan</span>
            <p className="font-semibold text-gray-900">
              {billingPeriod === 'monthly' ? 'Monthly' : 'Annual'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-xs">Venues</span>
            <p className="font-semibold text-gray-900">{venueCount}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-blue-200 flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">£{total.toLocaleString()}</span>
            <span className="text-xs text-gray-500 ml-1">
              /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-700">
          <CreditCard className="w-4 h-4" />
          <h3 className="text-sm font-medium">Payment Method</h3>
        </div>
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'GB',
                }
              }
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          💳 Pay by card or 🏦 Direct Debit (BACS)
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Security Badge & Action Buttons Combined */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              `Pay £${total.toLocaleString()}`
            )}
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Secured by Stripe • PCI DSS compliant</span>
        </div>
      </div>
    </form>
  );
};

const StripeCheckoutModal = ({ isOpen, onClose, onSuccess, clientSecret, total, billingPeriod, venueCount }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
      },
    },
    paymentMethodOrder: ['card', 'bacs_debit'],
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5 transform transition-all max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - More Compact */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Complete Subscription</h2>
              <p className="text-xs text-gray-500 mt-0.5">Secure payment via Stripe</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors -mt-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stripe Elements Form */}
          {clientSecret && (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm
                onSuccess={onSuccess}
                onCancel={onClose}
                total={total}
                billingPeriod={billingPeriod}
                venueCount={venueCount}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutModal;
