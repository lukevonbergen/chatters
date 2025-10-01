import React, { useMemo, useState } from 'react';

const FeedbackTab = ({ feedbackSessions, assistanceRequests }) => {
  const [dateFilter, setDateFilter] = useState('all');
  const getFilteredSessions = (sessions, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'thisWeek': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return sessions.filter(session => new Date(session.createdAt) >= startOfWeek);
      }
      case 'last7':
        return sessions.filter(session => new Date(session.createdAt) >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
      case 'last14':
        return sessions.filter(session => new Date(session.createdAt) >= new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000));
      default:
        return sessions;
    }
  };

  const feedbackData = useMemo(() => {
    const filteredFeedback = getFilteredSessions(feedbackSessions, dateFilter);
    const filteredAssistance = getFilteredSessions(assistanceRequests, dateFilter);
    const allFilteredSessions = [...filteredFeedback, ...filteredAssistance];
    const dailyFeedback = {};
    
    allFilteredSessions.forEach(session => {
      const date = new Date(session.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyFeedback[dateKey]) {
        const day = date.getDate();
        const suffix = day === 1 || day === 21 || day === 31 ? 'st' 
                    : day === 2 || day === 22 ? 'nd' 
                    : day === 3 || day === 23 ? 'rd' 
                    : 'th';
        const displayDate = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }).replace(/(\d+)/, `$1${suffix}`);
        
        dailyFeedback[dateKey] = {
          date: dateKey,
          displayDate,
          totalSessions: 0,
          feedbackSessions: 0,
          assistanceRequests: 0,
          totalRatings: 0,
          ratingSum: 0,
          urgentSessions: 0,
          actionedSessions: 0
        };
      }
      
      // Count all sessions
      dailyFeedback[dateKey].totalSessions += 1;
      
      // Track if session is actioned
      if (session.isActioned) {
        dailyFeedback[dateKey].actionedSessions += 1;
      }
      
      if (session.type === 'feedback') {
        // This is a feedback session with ratings
        dailyFeedback[dateKey].feedbackSessions += 1;
        
        // Check if this session has any low ratings (urgent feedback - below 3 stars)
        const hasUrgentRating = session.items?.some(item => 
          item.rating !== null && item.rating >= 1 && item.rating < 3
        );
        if (hasUrgentRating) {
          dailyFeedback[dateKey].urgentSessions += 1;
        }
        
        // Calculate ratings for this session
        session.items?.forEach(item => {
          if (item.rating !== null && item.rating >= 1 && item.rating <= 5) {
            dailyFeedback[dateKey].totalRatings += 1;
            dailyFeedback[dateKey].ratingSum += item.rating;
          }
        });
      } else if (session.type === 'assistance') {
        // This is an assistance request (no ratings)
        dailyFeedback[dateKey].assistanceRequests += 1;
      }
    });
    
    // Calculate averages and sort by date (newest first)
    return Object.values(dailyFeedback)
      .map(day => ({
        ...day,
        averageRating: day.totalRatings > 0 
          ? (day.ratingSum / day.totalRatings).toFixed(1) 
          : 'N/A',
        responseRate: day.totalSessions > 0 
          ? ((day.actionedSessions / day.totalSessions) * 100).toFixed(0) + '%'
          : '0%'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [feedbackSessions, assistanceRequests, dateFilter]);

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-1">
              Feedback Overview
            </h2>
            <p className="text-sm text-gray-600">
              Daily breakdown of feedback received, ratings, and action completion rates
            </p>
          </div>
          
          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="thisWeek">This Week</option>
              <option value="last7">Last 7 Days</option>
              <option value="last14">Last 14 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Date
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Feedback Left
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Avg Rating
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Assistance Requests
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Response Rate
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Urgent Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {feedbackData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 mb-1">No feedback data</p>
                      <p className="text-xs text-gray-500">Feedback will appear here as it's collected</p>
                    </div>
                  </td>
                </tr>
              ) : (
                feedbackData.map((day, index) => (
                  <tr 
                    key={day.date} 
                    className={`hover:bg-blue-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {day.displayDate}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center border-r border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">
                        {day.totalSessions}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center border-r border-gray-100">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        day.averageRating === 'N/A' 
                          ? 'bg-gray-100 text-gray-600' 
                          : parseFloat(day.averageRating) >= 4 
                            ? 'bg-green-100 text-green-700'
                            : parseFloat(day.averageRating) >= 3
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                      }`}>
                        {day.averageRating}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center border-r border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">
                        {day.assistanceRequests}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center border-r border-gray-100">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        parseInt(day.responseRate) >= 80 
                          ? 'bg-green-100 text-green-700'
                          : parseInt(day.responseRate) >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {day.responseRate}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className={`text-sm font-semibold ${
                        day.urgentSessions > 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {day.urgentSessions}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {feedbackData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Days
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {feedbackData.length}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Feedback
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {feedbackData.reduce((sum, day) => sum + day.totalSessions, 0)}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Avg Daily Feedback
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {feedbackData.length > 0 
                ? (feedbackData.reduce((sum, day) => sum + day.totalSessions, 0) / feedbackData.length).toFixed(1)
                : '0'
              }
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Overall Response Rate
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {feedbackData.length > 0 
                ? Math.round((feedbackData.reduce((sum, day) => sum + day.actionedSessions, 0) / feedbackData.reduce((sum, day) => sum + day.totalSessions, 0)) * 100) + '%'
                : '0%'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackTab;