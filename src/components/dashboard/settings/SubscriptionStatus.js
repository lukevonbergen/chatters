import React from 'react';

const SubscriptionStatus = ({ isPaid, trialEndsAt, onUpgrade }) => {
  const now = new Date();
  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const onTrial = !isPaid && trialEnd && now < trialEnd;
  const trialExpired = !isPaid && trialEnd && now >= trialEnd;

  let statusLabel = '';
  if (isPaid) {
    statusLabel = 'Active Subscription';
  } else if (onTrial) {
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    statusLabel = `Free Trial – ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`;
  } else if (trialExpired) {
    statusLabel = 'Trial Expired – No Active Subscription';
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Subscription Status</h2>
      <div className="flex items-center gap-4">
        <span className="text-lg font-medium text-gray-700">{statusLabel}</span>
        {!isPaid && (
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            onClick={onUpgrade}
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;