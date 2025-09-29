// PerformanceDashboardTab.js — Performance metrics and trends

import React from 'react';
import ActionCompletionRateTile from './ActionCompletionRateTile';
import SatisfactionTrendTile from './SatisfactionTrendTile';
import AverageResolutionTimeTile from './AverageResolutionTimeTile';
import ResponseTimeAnalyticsTile from './ResponseTimeAnalyticsTile';

const PerformanceDashboardTab = ({
  venueId,
  actionedCount,
  totalCount,
  satisfactionTrend
}) => {
  return (
    <div className="max-w-none">
      <div className="space-y-6 lg:space-y-8">
        {/* Row 1: Equal height KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-1 h-full">
            <AverageResolutionTimeTile venueId={venueId} />
          </div>
          <div className="lg:col-span-1 h-full">
            <ActionCompletionRateTile
              venueId={venueId}
            />
          </div>
        </div>

        {/* Row 2: Satisfaction trend */}
        <div>
          <SatisfactionTrendTile satisfactionTrend={satisfactionTrend} venueId={venueId}/>
        </div>

        {/* Row 3: Response time analytics */}
        <div>
          <ResponseTimeAnalyticsTile venueId={venueId} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboardTab;