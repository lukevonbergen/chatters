import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ActionCompletionRateTile = ({ actionedCount, totalCount }) => {
  const completionRate = totalCount > 0 ? ((actionedCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 lg:w-40 lg:h-40">
            <CircularProgressbar
              value={completionRate}
              text={`${completionRate}%`}
              styles={{
                path: { stroke: '#000000', strokeWidth: 3 },
                text: { fill: '#111827', fontSize: '16px', fontWeight: 'bold' },
                trail: { stroke: '#f3f4f6', strokeWidth: 3 }
              }}
            />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Action Completion Rate</h2>
          <p className="text-gray-600 text-sm mb-4">
            {actionedCount} of {totalCount} feedback sessions have been actioned by your team.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Completed:</span>
              <span className="ml-2 font-medium text-green-600">{actionedCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Pending:</span>
              <span className="ml-2 font-medium text-gray-900">{totalCount - actionedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCompletionRateTile;