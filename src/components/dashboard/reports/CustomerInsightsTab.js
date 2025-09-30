// CustomerInsightsTab.js — Detailed customer feedback analysis

import React from 'react';
import RatingDistributionTile from './RatingDistributionTile';
import TablePerformanceRankingTile from './TablePerformanceRankingTile';
import SentimentTrendsTile from './SentimentTrendsTile';
import QuestionEffectivenessTile from './QuestionEffectivenessTile';

const CustomerInsightsTab = ({ venueId }) => {
  return (
    <div className="max-w-none">
      <div className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <RatingDistributionTile 
            venueId={venueId} 
          />
          
          <TablePerformanceRankingTile 
            venueId={venueId} 
          />
        </div>

        <SentimentTrendsTile 
          venueId={venueId} 
        />

        <QuestionEffectivenessTile 
          venueId={venueId} 
        />
      </div>
    </div>
  );
};

export default CustomerInsightsTab;