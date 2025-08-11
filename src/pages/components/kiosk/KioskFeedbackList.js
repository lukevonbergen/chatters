import React from 'react';
import dayjs from 'dayjs';

const KioskFeedbackList = ({ feedbackList, selectedFeedback, onFeedbackClick }) => {
  // Group feedback by table
  const groupedFeedback = feedbackList.reduce((acc, feedback) => {
    const table = feedback.table_number;
    if (!acc[table]) {
      acc[table] = [];
    }
    acc[table].push(feedback);
    return acc;
  }, {});

  // Sort tables by most recent feedback first
  const sortedTables = Object.keys(groupedFeedback).sort((a, b) => {
    const aLatest = Math.max(...groupedFeedback[a].map(f => new Date(f.created_at).getTime()));
    const bLatest = Math.max(...groupedFeedback[b].map(f => new Date(f.created_at).getTime()));
    return bLatest - aLatest;
  });

  const getRatingColor = (rating) => {
    if (rating <= 2) return 'text-red-600 bg-red-50 border-red-200';
    if (rating <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUrgencyIndicator = (feedback) => {
    const rating = feedback.rating;
    const hasComment = feedback.additional_feedback && feedback.additional_feedback.trim().length > 0;
    
    if (rating <= 2) {
      return { label: 'URGENT', color: 'bg-red-600 text-white', priority: 3 };
    }
    if (rating <= 3 && hasComment) {
      return { label: 'ATTENTION', color: 'bg-yellow-500 text-white', priority: 2 };
    }
    return { label: 'INFO', color: 'bg-blue-500 text-white', priority: 1 };
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {feedbackList.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No pending feedback at the moment</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active Alerts</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {feedbackList.length} alert{feedbackList.length !== 1 ? 's' : ''}
            </span>
          </div>

          {sortedTables.map(tableNumber => {
            const tableFeedback = groupedFeedback[tableNumber];
            const latestFeedback = tableFeedback.reduce((latest, current) => 
              new Date(current.created_at) > new Date(latest.created_at) ? current : latest
            );
            const urgency = getUrgencyIndicator(latestFeedback);

            return (
              <div
                key={tableNumber}
                onClick={() => onFeedbackClick(latestFeedback)}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedFeedback?.table_number === tableNumber
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Urgency badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">
                      Table {tableNumber}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgency.color}`}>
                      {urgency.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {dayjs(latestFeedback.created_at).fromNow()}
                  </span>
                </div>

                {/* Rating */}
                {latestFeedback.rating && (
                  <div className={`inline-block px-2 py-1 rounded border text-sm font-medium mb-2 ${getRatingColor(latestFeedback.rating)}`}>
                    Rating: {latestFeedback.rating}/5
                  </div>
                )}

                {/* Question */}
                {latestFeedback.questions?.question && (
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {latestFeedback.questions.question}
                  </p>
                )}

                {/* Additional feedback */}
                {latestFeedback.additional_feedback && (
                  <p className="text-sm text-gray-600 italic">
                    "{latestFeedback.additional_feedback}"
                  </p>
                )}

                {/* Multiple alerts indicator */}
                {tableFeedback.length > 1 && (
                  <div className="mt-2 text-xs text-gray-500">
                    +{tableFeedback.length - 1} more alert{tableFeedback.length > 2 ? 's' : ''}
                  </div>
                )}

                {/* Visual priority indicator */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                    urgency.priority === 3 ? 'bg-red-600' :
                    urgency.priority === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KioskFeedbackList;