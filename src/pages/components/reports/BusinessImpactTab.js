// BusinessImpactTab.js — Revenue impact and ROI metrics

import React from 'react';
import RevenueProjection from '../../RevenueProjection';
import PerformanceSummaryTile from '../../PerformanceSummaryTile';

const BusinessImpactTab = ({
  venueId,
  totalCount,
  recentCount,
  completionRate,
  alertsCount
}) => {
  return (
    <div className="max-w-none">
      <div className="mb-6">
        <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-1">Business Impact</h2>
        <p className="text-sm text-gray-600">
          Estimated revenue impact and return on investment from customer feedback management
        </p>
      </div>

      <div className="space-y-6 lg:space-y-8">
        <RevenueProjection 
          venueId={venueId} 
        />

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Performance Summary</h3>
          <PerformanceSummaryTile 
            totalCount={totalCount}
            recentCount={recentCount}
            completionRate={completionRate}
            alertsCount={alertsCount}
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessImpactTab;