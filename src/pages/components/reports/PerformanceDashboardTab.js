// PerformanceDashboardTab.js — Performance metrics and trends

import React from 'react';
import ActionCompletionRateTile from '../../ActionCompletionRateTile';
import SatisfactionTrendTile from '../../SatisfactionTrendTile';
import AverageResolutionTimeTile from '../../AverageResolutionTimeTile';

const PerformanceDashboardTab = ({
  venueId,
  actionedCount,
  totalCount,
  satisfactionTrend
}) => {
  return (
    <div className="max-w-none">
      <div className="mb-6">
        <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-1">Performance Dashboard</h2>
        <p className="text-sm text-gray-600">
          Key metrics showing your team's response performance and customer satisfaction trends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <ActionCompletionRateTile 
          actionedCount={actionedCount} 
          totalCount={totalCount} 
        />
        
        <SatisfactionTrendTile 
          satisfactionTrend={satisfactionTrend} 
        />
        
        <AverageResolutionTimeTile 
          venueId={venueId} 
        />
      </div>
    </div>
  );
};

export default PerformanceDashboardTab;