import React from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import BillingTab from '../../components/dashboard/settings/BillingTab';

const AccountBillingPage = () => {
  usePageTitle('Billing & Subscription');
  const { venueId } = useVenue();

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Billing & Subscription"
        subtitle="Manage your subscription, billing details, and payment methods"
      >
        <BillingTab />
      </ChartCard>
    </div>
  );
};

export default AccountBillingPage;