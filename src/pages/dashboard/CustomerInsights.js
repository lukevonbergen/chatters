import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import CustomerInsightsTab from '../../components/dashboard/reports/CustomerInsightsTab';

const CustomerInsightsPage = () => {
  usePageTitle('Customer Insights');
  const { venueId } = useVenue();
  const [timeframe, setTimeframe] = useState('last30');

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Customer Insights"
        subtitle="Understand your customers' behavior and preferences"
        actions={
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="last7">Last 7 Days</option>
              <option value="last14">Last 14 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        }
      >
        <CustomerInsightsTab venueId={venueId} timeframe={timeframe} />
      </ChartCard>
    </div>
  );
};

export default CustomerInsightsPage;