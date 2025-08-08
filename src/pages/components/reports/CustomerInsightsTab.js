// CustomerInsightsTab.js — Detailed customer feedback analysis

import React from 'react';
import RatingDistributionTile from '../../RatingDistributionTile';
import TablePerformanceRankingTile from '../../TablePerformanceRankingTile';

const CustomerInsightsTab = ({ venueId }) => {
  return (
    <div className="max-w-none">
      <div className="mb-6">
        <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-1">Customer Insights</h2>
        <p className="text-sm text-gray-600">
          Detailed analysis of customer feedback patterns and satisfaction distribution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <RatingDistributionTile 
          venueId={venueId} 
        />
        
        <TablePerformanceRankingTile 
          venueId={venueId} 
        />
      </div>
    </div>
  );
};

export default CustomerInsightsTab;