// ReportsPage.js — Refactored with tabbed interface like SettingsPage

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';

// Import tab components
import BusinessImpactTab from '../../components/dashboard/reports/BusinessImpactTab';
import PerformanceDashboardTab from '../../components/dashboard/reports/PerformanceDashboardTab';
import CustomerInsightsTab from '../../components/dashboard/reports/CustomerInsightsTab';
import QuickMetricsTab from '../../components/dashboard/reports/QuickMetricsTab';
import FeedbackTab from '../../components/dashboard/reports/FeedbackTab';

const ReportsPage = () => {
  usePageTitle('Reports');
  const navigate = useNavigate();
  const { venueId } = useVenue();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('Feedback');
  // Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data state
  const [feedbackSessions, setFeedbackSessions] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);

  useEffect(() => {
    if (!venueId) return;
    fetchData(venueId);
    setupRealtime(venueId);
  }, [venueId]);

  const fetchData = async (venueId) => {
    // Fetch feedback sessions
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId);

    const grouped = {};
    for (const row of feedbackData || []) {
      if (!grouped[row.session_id]) grouped[row.session_id] = [];
      grouped[row.session_id].push(row);
    }

    const sessions = Object.values(grouped).map(items => ({
      type: 'feedback',
      isActioned: items.every(i => i.is_actioned),
      createdAt: items[0].created_at,
      table: items[0].table_number,
      items,
      lowScore: items.some(i => i.rating !== null && i.rating <= 2)
    }));

    // Fetch assistance requests
    const { data: assistanceData } = await supabase
      .from('assistance_requests')
      .select('*')
      .eq('venue_id', venueId);

    const assistanceRequests = (assistanceData || []).map(request => ({
      type: 'assistance',
      isActioned: request.status === 'resolved' || request.acknowledged_at !== null,
      createdAt: request.created_at,
      table: request.table_number,
      items: [], // No rating items for assistance requests
      lowScore: false
    }));

    setFeedbackSessions(sessions);
    setAssistanceRequests(assistanceRequests);
  };

  const setupRealtime = (venueId) => {
    supabase.channel('feedback-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`
      }, () => fetchData(venueId))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'assistance_requests',
        filter: `venue_id=eq.${venueId}`
      }, () => fetchData(venueId))
      .subscribe();
  };

  // Calculate derived data
  const allSessions = [...feedbackSessions, ...assistanceRequests];
  const actionedCount = feedbackSessions.filter(s => s.isActioned).length;
  const totalCount = feedbackSessions.length;
  const alertsCount = feedbackSessions.filter(s => s.lowScore && !s.isActioned).length;
  const recentCount = allSessions.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const uniqueTables = [...new Set(allSessions.map(s => s.table))];
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

  // Navigation items
  const navItems = [
    { id: 'Feedback', label: 'Feedback' },
    { id: 'Performance', label: 'Performance' },
    { id: 'Business', label: 'Impact' },
    { id: 'Insights', label: 'Insights' },
    { id: 'Metrics', label: 'Metrics' },
  ];

  // Close mobile menu when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Props to pass to tab components
  const tabProps = {
    venueId,
    feedbackSessions,
    assistanceRequests,
    allSessions,
    actionedCount,
    totalCount,
    alertsCount,
    recentCount,
    uniqueTables,
    completionRate,
    averageRating,
    satisfactionTrend,
    allRatings,
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Performance':
        return <PerformanceDashboardTab {...tabProps} />;
      case 'Business':
        return <BusinessImpactTab {...tabProps} />;
      case 'Insights':
        return <CustomerInsightsTab {...tabProps} />;
      case 'Metrics':
        return <QuickMetricsTab {...tabProps} />;
      case 'Feedback':
        return <FeedbackTab {...tabProps} />;
      default:
        return <PerformanceDashboardTab {...tabProps} />;
    }
  };

  if (!venueId) {
    return null;
  }

  return (
    <PageContainer>
      <div className="max-w-none lg:max-w-7xl">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Reports</h1>
              <p className="text-gray-600 text-sm lg:text-base">Track customer feedback performance and satisfaction metrics.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Real-time
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-6">
          <div className="relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span className="block truncate">
                {navItems.find(item => item.id === activeTab)?.label || 'Select Tab'}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>

            {isMobileMenuOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      activeTab === item.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportsPage;