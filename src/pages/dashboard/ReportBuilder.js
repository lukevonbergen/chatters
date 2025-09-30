import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import ReportBuilderTab from '../../components/dashboard/reports/ReportBuilderTab';

const ReportBuilderPage = () => {
  usePageTitle('Report Builder');
  const { venueId } = useVenue();

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Report Builder"
        subtitle="Create custom reports with your data"
      >
        <ReportBuilderTab venueId={venueId} />
      </ChartCard>
    </div>
  );
};

export default ReportBuilderPage;