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
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

const ReportsPage = () => {
  usePageTitle('Reports');
  const navigate = useNavigate();
  const { venueId } = useVenue();
  const [feedbackSessions, setFeedbackSessions] = useState([]);

  useEffect(() => {
    if (!venueId) return;
    fetchFeedback(venueId);
    setupRealtime(venueId);
  }, [venueId]);

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

  const setupRealtime = (venueId) => {
    supabase.channel('feedback-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`
      }, () => fetchFeedback(venueId))
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
      <div className="max-w-none lg:max-w-6xl">
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

        {/* Completion Rate - Featured Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
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
            <div className="flex-1 text-center lg:text-left">
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

        {/* Satisfaction Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Customer Satisfaction Trend</h2>
            <p className="text-gray-600 text-sm">
              Daily average satisfaction scores over time.
            </p>
          </div>
          
          {satisfactionTrend.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={satisfactionTrend}>
                  <XAxis 
                    dataKey="day" 
                    stroke="#6B7280" 
                    fontSize={12}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    stroke="#6B7280" 
                    fontSize={12} 
                    allowDecimals={false}
                    tick={{ fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#000000" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#000000' }}
                    activeDot={{ r: 6, fill: '#000000' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-base lg:text-lg mb-2">No trend data available</p>
                <p className="text-sm">Satisfaction trends will appear as feedback is collected</p>
              </div>
            </div>
          )}
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