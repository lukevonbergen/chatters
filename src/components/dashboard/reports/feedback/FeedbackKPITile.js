import React from 'react';
import { MessageSquare, Star, CheckCircle2, AlertCircle } from 'lucide-react';

const FeedbackKPITile = ({ feedbackData, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (feedbackData.totalSessions === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">No feedback data available</p>
          <p className="text-gray-400 text-xs mt-1">for this period</p>
        </div>
      </div>
    );
  }

  const resolutionRate = feedbackData.totalSessions > 0
    ? Math.round((feedbackData.resolvedCount / feedbackData.totalSessions) * 100)
    : 0;

  return (
    <>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Total Sessions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{feedbackData.totalSessions}</div>
          <div className="text-xs text-blue-700 mt-1">Total Sessions</div>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {feedbackData.avgRating.toFixed(1)}
            <span className="text-sm text-yellow-700 ml-1">/5</span>
          </div>
          <div className="text-xs text-yellow-700 mt-1">Avg Rating</div>
        </div>

        {/* Resolved */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{feedbackData.resolvedCount}</div>
          <div className="text-xs text-green-700 mt-1">
            Resolved ({resolutionRate}%)
          </div>
        </div>

        {/* Unresolved */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{feedbackData.unresolvedCount}</div>
          <div className="text-xs text-red-700 mt-1">Unresolved</div>
        </div>
      </div>

      {/* Venue Breakdown (if multiple venues) */}
      {feedbackData.venueBreakdown && feedbackData.venueBreakdown.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Venue Breakdown</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {feedbackData.venueBreakdown.map(venue => (
              <div key={venue.venueId} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{venue.venueName}</span>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-gray-600 text-xs">{venue.sessionCount} sessions</span>
                  <span className="font-semibold text-gray-900 min-w-[3rem] text-right">
                    {venue.avgRating.toFixed(1)}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackKPITile;
