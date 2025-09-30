import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import PerformanceDashboardTab from '../../components/dashboard/reports/PerformanceDashboardTab';

const PerformanceDashboardPage = () => {
  usePageTitle('Performance Dashboard');
  const { venueId } = useVenue();

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Performance Dashboard"
        subtitle="Track key performance metrics and trends"
      >
        <PerformanceDashboardTab venueId={venueId} />
      </ChartCard>
    </div>
  );
};

export default PerformanceDashboardPage;