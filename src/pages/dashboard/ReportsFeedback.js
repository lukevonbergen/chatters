import React from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import ReportsPage from './ReportsPage';

const ReportsFeedbackPage = () => {
  usePageTitle('Feedback Reports');
  const { venueId } = useVenue();

  if (!venueId) {
    return null;
  }

  return (
    <div className="w-full">
      <ReportsPage />
    </div>
  );
};

export default ReportsFeedbackPage;