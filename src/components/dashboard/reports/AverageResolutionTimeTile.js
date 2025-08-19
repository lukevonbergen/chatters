import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const AverageResolutionTimeTile = ({ venueId }) => {
  const [averageTime, setAverageTime] = useState(0);
  const [totalResolved, setTotalResolved] = useState(0);
  const [timeFilter, setTimeFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;

    switch (filter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date();
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(0);
        endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : new Date();
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const fetchResolutionTimes = async () => {
    if (!venueId) return;
    
    const { startDate, endDate } = getDateRange(timeFilter);

    const { data, error } = await supabase
      .from('feedback')
      .select('created_at, resolved_at')
      .eq('venue_id', venueId)
      .not('resolved_at', 'is', null)
      .gte('resolved_at', startDate)
      .lte('resolved_at', endDate);

    if (error) {
      console.error('Error fetching resolution times:', error);
      return;
    }

    if (!data || data.length === 0) {
      setAverageTime(0);
      setTotalResolved(0);
      return;
    }

    const resolutionTimes = data.map(item => {
      const created = new Date(item.created_at);
      const resolved = new Date(item.resolved_at);
      return (resolved - created) / (1000 * 60); // Convert to minutes
    });

    const avgTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
    
    setAverageTime(avgTime);
    setTotalResolved(data.length);
  };

  useEffect(() => {
    fetchResolutionTimes();
  }, [venueId, timeFilter, customStartDate, customEndDate]);

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else { // 24 hours or more
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  const getProgressPercentage = () => {
    // Assuming target resolution time of 2 hours (120 minutes)
    // Invert the percentage so faster resolution = higher percentage
    const targetMinutes = 120;
    if (averageTime === 0) return 100;
    const percentage = Math.max(0, ((targetMinutes - averageTime) / targetMinutes) * 100);
    return Math.min(100, percentage);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    setIsCustom(filter === 'custom');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Average Resolution Time</h2>
            <p className="text-gray-600 text-sm">
              Time taken to resolve customer feedback.
            </p>
          </div>
        </div>
        
        {/* Time Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['today', 'week', 'month', 'ytd', 'custom'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeFilter === filter
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'ytd' ? 'YTD' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        {isCustom && (
          <div className="flex gap-2 mt-3 items-center">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Progress Circle */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 lg:w-40 lg:h-40">
            <CircularProgressbar
              value={getProgressPercentage()}
              text={formatTime(averageTime)}
              styles={{
                path: { stroke: getProgressColor(), strokeWidth: 3 },
                text: { fill: '#111827', fontSize: '14px', fontWeight: 'bold' },
                trail: { stroke: '#f3f4f6', strokeWidth: 3 }
              }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">
            {totalResolved} feedback items resolved
            {timeFilter === 'today' && ' today'}
            {timeFilter === 'week' && ' this week'}
            {timeFilter === 'month' && ' this month'}
            {timeFilter === 'ytd' && ' year to date'}
            {timeFilter === 'custom' && customStartDate && customEndDate && 
              ` from ${customStartDate} to ${customEndDate}`}
          </p>

          {/* Performance Indicator */}
          {totalResolved > 0 && (
            <div className={`text-xs font-medium ${
              getProgressPercentage() >= 80 ? 'text-green-600' : 
              getProgressPercentage() >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getProgressPercentage() >= 80 && '🎯 Excellent response time'}
              {getProgressPercentage() >= 60 && getProgressPercentage() < 80 && '⚡ Good response time'}
              {getProgressPercentage() < 60 && '⏰ Room for improvement'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AverageResolutionTimeTile;