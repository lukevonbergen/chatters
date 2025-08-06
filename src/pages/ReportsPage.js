// ReportsPage.js — Refactored to use useVenue() instead of email lookup

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PageContainer from '../components/PageContainer';
import {
  CheckCircle,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  LayoutGrid,
  TrendingUp,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

const ReportsPage = () => {
  usePageTitle('Reports');
  const navigate = useNavigate();
  const { venueId } = useVenue();
  const [feedbackSessions, setFeedbackSessions] = useState([]);
  
  // Average Resolution Time states
  const [averageTime, setAverageTime] = useState(0);
  const [totalResolved, setTotalResolved] = useState(0);
  const [timeFilter, setTimeFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (!venueId) return;
    fetchFeedback(venueId);
    fetchResolutionTimes(venueId);
    setupRealtime(venueId);
  }, [venueId]);

  useEffect(() => {
    if (!venueId) return;
    fetchResolutionTimes(venueId);
  }, [venueId, timeFilter, customStartDate, customEndDate]);

  const fetchFeedback = async (venueId) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId);

    const grouped = {};
    for (const row of data || []) {
      if (!grouped[row.session_id]) grouped[row.session_id] = [];
      grouped[row.session_id].push(row);
    }

    const sessions = Object.values(grouped).map(items => ({
      isActioned: items.every(i => i.is_actioned),
      createdAt: items[0].created_at,
      table: items[0].table_number,
      items,
      lowScore: items.some(i => i.rating !== null && i.rating <= 2)
    }));

    setFeedbackSessions(sessions);
  };

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

  const fetchResolutionTimes = async (venueId) => {
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

  const setupRealtime = (venueId) => {
    supabase.channel('feedback-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`
      }, () => {
        fetchFeedback(venueId);
        fetchResolutionTimes(venueId);
      })
      .subscribe();
  };

  const actionedCount = feedbackSessions.filter(s => s.isActioned).length;
  const totalCount = feedbackSessions.length;
  const alertsCount = feedbackSessions.filter(s => s.lowScore && !s.isActioned).length;
  const recentCount = feedbackSessions.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const uniqueTables = [...new Set(feedbackSessions.map(s => s.table))];
  const completionRate = totalCount > 0 ? ((actionedCount / totalCount) * 100).toFixed(1) : 0;

  const allRatings = feedbackSessions.flatMap(session => session.items?.map(i => i.rating).filter(r => r !== null && r >= 1 && r <= 5) || []);
  const averageRating = allRatings.length > 0 ? (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(2) : 'N/A';

  const getDailySatisfactionTrend = (sessions) => {
    const dayMap = {};
    sessions.forEach(session => {
      const date = new Date(session.createdAt);
      const key = date.toISOString().split('T')[0];
      const ratings = session.items?.map(i => i.rating).filter(r => r !== null && r >= 1 && r <= 5) || [];
      if (!dayMap[key]) dayMap[key] = [];
      dayMap[key].push(...ratings);
    });

    return Object.entries(dayMap).map(([day, ratings]) => {
      const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : 0;
      return { day, average: parseFloat(avg) };
    });
  };

  const satisfactionTrend = getDailySatisfactionTrend(feedbackSessions);

  const MetricCard = ({ title, value, icon: Icon, description, variant = 'default' }) => {
    const variantStyles = {
      default: 'border-gray-200',
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      danger: 'border-red-200 bg-red-50',
      info: 'border-blue-200 bg-blue-50'
    };

    const iconStyles = {
      default: 'text-gray-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600',
      info: 'text-blue-600'
    };

    return (
      <div className={`bg-white border rounded-lg p-4 lg:p-6 ${variantStyles[variant]}`}>
        <div className="flex items-start space-x-3 lg:space-x-4">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${iconStyles[variant]}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      <div className="max-w-none lg:max-w-7xl">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Reports Overview</h1>
              <p className="text-gray-600 text-sm">
                Track customer feedback performance and satisfaction metrics.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Real-time
              </span>
            </div>
          </div>
        </div>

        {/* Top Row: Completion Rate, Satisfaction Trend, and Average Resolution Time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Action Completion Rate */}
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

          {/* Satisfaction Trend Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
            <div className="mb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Satisfaction Trend</h2>
              <p className="text-gray-600 text-sm">
                Daily average satisfaction scores over time.
              </p>
            </div>
            
            {satisfactionTrend.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={satisfactionTrend}>
                    <XAxis 
                      dataKey="day"
                      stroke="#6B7280" 
                      fontSize={11}
                      tick={{ fill: '#6B7280' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        });
                      }}
                      interval={Math.max(Math.floor(satisfactionTrend.length / 6), 0)}
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      stroke="#6B7280" 
                      fontSize={11} 
                      allowDecimals={false}
                      tick={{ fill: '#6B7280' }}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [value, 'Rating']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        });
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#000000" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#000000', strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: '#000000', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm mb-1">No trend data available</p>
                  <p className="text-xs">Trends will appear as feedback is collected</p>
                </div>
              </div>
            )}
          </div>

          {/* Average Resolution Time */}
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
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <MetricCard 
            title="Total Feedback Sessions" 
            value={totalCount} 
            icon={BarChart3} 
            description="All customer feedback received"
            variant="info"
          />
          <MetricCard 
            title="Sessions Actioned" 
            value={actionedCount} 
            icon={CheckCircle} 
            description="Feedback that has been addressed"
            variant="success"
          />
          <MetricCard 
            title="Unresolved Alerts" 
            value={alertsCount} 
            icon={AlertTriangle} 
            description="Low scores requiring attention"
            variant={alertsCount > 0 ? "danger" : "default"}
          />
          <MetricCard 
            title="Feedback This Week" 
            value={recentCount} 
            icon={CalendarClock} 
            description="Recent customer responses"
            variant="default"
          />
          <MetricCard 
            title="Tables Participated" 
            value={uniqueTables.length} 
            icon={LayoutGrid} 
            description="Different table locations"
            variant="default"
          />
          <MetricCard 
            title="Avg. Satisfaction" 
            value={averageRating} 
            icon={TrendingUp} 
            description="Overall rating (1-5 scale)"
            variant={parseFloat(averageRating) >= 4 ? "success" : parseFloat(averageRating) >= 3 ? "warning" : "danger"}
          />
        </div>

        {/* Summary Statistics */}
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
      </div>
    </PageContainer>
  );
};

export default ReportsPage;