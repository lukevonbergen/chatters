import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import CustomerInsightsTab from '../../components/dashboard/reports/CustomerInsightsTab';

const CustomerInsightsPage = () => {
  usePageTitle('Customer Insights');
  const { venueId } = useVenue();

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Customer Insights"
        subtitle="Understand your customers' behavior and preferences"
      >
        <CustomerInsightsTab venueId={venueId} />
      </ChartCard>
    </div>
  );
};

export default CustomerInsightsPage;