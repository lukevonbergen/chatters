import React from 'react';

const PerformanceSummaryTile = ({ totalCount, recentCount, completionRate, alertsCount }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2 lg:mb-3">Performance Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 text-sm">
        <div className="flex justify-between sm:block">
          <span className="text-gray-700">Response Rate:</span>
          <span className="ml-2 font-medium">
            {totalCount > 0 ? `${((recentCount / totalCount) * 100).toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between sm:block">
          <span className="text-gray-700">Action Rate:</span>
          <span className="ml-2 font-medium">{completionRate}%</span>
        </div>
        <div className="flex justify-between sm:block">
          <span className="text-gray-700">Alert Rate:</span>
          <span className="ml-2 font-medium">
            {totalCount > 0 ? `${((alertsCount / totalCount) * 100).toFixed(1)}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummaryTile;