// ReportsPage.js — Refactored to use individual tile components with grouped sections

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import {
  CheckCircle,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  LayoutGrid,
  TrendingUp
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

// Import report tile components
import ActionCompletionRateTile from '../components/reports/ActionCompletionRateTile';
import SatisfactionTrendTile from '../components/reports/SatisfactionTrendTile';
import AverageResolutionTimeTile from '../components/reports/AverageResolutionTimeTile';
import TablePerformanceRankingTile from '../components/reports/TablePerformanceRankingTile';
import RatingDistributionTile from '../components/reports/RatingDistributionTile';
import MetricCard from '../components/reports/MetricCard';
import PerformanceSummaryTile from '../components/reports/PerformanceSummaryTile';

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

  // Section title component
  const SectionTitle = ({ title, description }) => (
    <div className="mb-4">
      <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-1">{title}</h2>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
  );

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

        {/* Performance Dashboard */}
        <SectionTitle 
          title="Performance Dashboard" 
          description="Key metrics showing your team's response performance and customer satisfaction trends"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <ActionCompletionRateTile 
            actionedCount={actionedCount} 
            totalCount={totalCount} 
          />
          
          <SatisfactionTrendTile 
            satisfactionTrend={satisfactionTrend} 
          />
          
          <AverageResolutionTimeTile 
            venueId={venueId} 
          />
        </div>

        {/* Customer Insights */}
        <SectionTitle 
          title="Customer Insights" 
          description="Detailed analysis of customer feedback patterns and satisfaction distribution"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <RatingDistributionTile 
            venueId={venueId} 
          />
          
          <TablePerformanceRankingTile 
            venueId={venueId} 
          />
        </div>

        {/* Quick Metrics */}
        <SectionTitle 
          title="Quick Metrics" 
          description="At-a-glance summary of key feedback statistics"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
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

        {/* Performance Summary */}
        <SectionTitle 
          title="Performance Summary" 
          description="Consolidated overview of your venue's feedback performance"
        />
        <PerformanceSummaryTile 
          totalCount={totalCount}
          recentCount={recentCount}
          completionRate={completionRate}
          alertsCount={alertsCount}
        />
      </div>
    </PageContainer>
  );
};

export default ReportsPage;