import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Users, Star, Clock, Target, AlertTriangle, CheckCircle, Activity, TrendingUp, ArrowLeft } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';
import { MetricCard, ChartCard } from '../../components/dashboard/layout/ModernCard';

const OverviewDetails = () => {
  const navigate = useNavigate();
  const { selectedVenueIds, isAllVenuesMode, allVenues } = useVenue();
  const [venueStats, setVenueStats] = useState({});
  const [expandedVenues, setExpandedVenues] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Allow access regardless of number of venues selected
  // (This page can show portfolio overview for single or multiple venues)

  // Fetch detailed stats for each venue
  useEffect(() => {
    const fetchVenueStats = async () => {
      if (selectedVenueIds.length === 0) return;

      setLoading(true);
      const stats = {};

      try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        // Fetch stats for each venue
        for (const venueId of selectedVenueIds) {
          // Today's feedback
          const { data: todayFeedback } = await supabase
            .from('feedback')
            .select('id, session_id, rating, created_at, resolved_at, is_actioned')
            .eq('venue_id', venueId)
            .gte('created_at', todayStart.toISOString());

          // Yesterday's feedback for trend
          const { data: yesterdayFeedback } = await supabase
            .from('feedback')
            .select('id, session_id')
            .eq('venue_id', venueId)
            .gte('created_at', yesterdayStart.toISOString())
            .lt('created_at', todayStart.toISOString());

          // Active assistance requests (alerts)
          const { data: activeAssistance } = await supabase
            .from('assistance_requests')
            .select('id')
            .eq('venue_id', venueId)
            .eq('status', 'pending');

          // Resolved assistance today
          const { data: resolvedAssistance } = await supabase
            .from('assistance_requests')
            .select('id')
            .eq('venue_id', venueId)
            .eq('status', 'resolved')
            .gte('resolved_at', todayStart.toISOString());

          // Calculate metrics
          const todaySessionIds = new Set(todayFeedback?.map(f => f.session_id) || []);
          const todaySessions = todaySessionIds.size;

          const yesterdaySessionIds = new Set(yesterdayFeedback?.map(f => f.session_id) || []);
          const yesterdaySessions = yesterdaySessionIds.size;
          const sessionsTrend = yesterdaySessions > 0
            ? (((todaySessions - yesterdaySessions) / yesterdaySessions) * 100).toFixed(1)
            : 0;

          const todayRatings = todayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
          const avgSatisfaction = todayRatings.length > 0
            ? (todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length).toFixed(1)
            : null;

          // Calculate average response time
          const resolvedFeedback = todayFeedback?.filter(f => f.resolved_at) || [];
          let avgResponseTime = '--';
          if (resolvedFeedback.length > 0) {
            const totalMinutes = resolvedFeedback.reduce((sum, f) => {
              const created = new Date(f.created_at);
              const resolved = new Date(f.resolved_at);
              return sum + (resolved - created) / (1000 * 60);
            }, 0);
            const avgMinutes = totalMinutes / resolvedFeedback.length;
            avgResponseTime = avgMinutes < 60
              ? `${Math.round(avgMinutes)}m`
              : `${(avgMinutes / 60).toFixed(1)}h`;
          }

          // Calculate completion rate
          const totalFeedback = todayFeedback?.length || 0;
          const completedFeedback = todayFeedback?.filter(f => f.is_actioned || f.resolved_at).length || 0;
          const completionRate = totalFeedback > 0
            ? Math.round((completedFeedback / totalFeedback) * 100)
            : null;

          // Calculate peak hour
          const hourCounts = {};
          todayFeedback?.forEach(f => {
            const hour = new Date(f.created_at).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          });
          const peakHour = Object.keys(hourCounts).length > 0
            ? Object.entries(hourCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0]
            : null;
          const peakHourDisplay = peakHour ? `${peakHour}:00` : '--';

          const venue = allVenues.find(v => v.id === venueId);
          stats[venueId] = {
            name: venue?.name || 'Unknown Venue',
            todaySessions,
            avgSatisfaction,
            avgResponseTime,
            completionRate,
            activeAlerts: activeAssistance?.length || 0,
            resolvedToday: resolvedAssistance?.length || 0,
            currentActivity: todaySessions > 20 ? 'High' : todaySessions > 10 ? 'Medium' : 'Low',
            peakHour: peakHourDisplay,
            sessionsTrend: Math.abs(sessionsTrend),
            sessionsTrendDirection: sessionsTrend > 0 ? 'up' : 'down',
            totalFeedback,
            ratingBreakdown: {
              5: todayRatings.filter(r => r === 5).length,
              4: todayRatings.filter(r => r === 4).length,
              3: todayRatings.filter(r => r === 3).length,
              2: todayRatings.filter(r => r === 2).length,
              1: todayRatings.filter(r => r === 1).length,
            }
          };
        }

        setVenueStats(stats);
      } catch (error) {
        console.error('Error fetching venue stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueStats();
  }, [selectedVenueIds, allVenues]);

  const toggleVenue = (venueId) => {
    const newExpanded = new Set(expandedVenues);
    if (newExpanded.has(venueId)) {
      newExpanded.delete(venueId);
    } else {
      newExpanded.add(venueId);
    }
    setExpandedVenues(newExpanded);
  };

  const expandAll = () => {
    setExpandedVenues(new Set(selectedVenueIds));
  };

  const collapseAll = () => {
    setExpandedVenues(new Set());
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
          <p className="text-gray-600 text-lg">
            {isAllVenuesMode ? (
              <>Comprehensive performance metrics for <span className="font-semibold">all venues</span></>
            ) : selectedVenueIds.length === 1 ? (
              <>Performance metrics for <span className="font-semibold">your venue</span></>
            ) : (
              <>Comprehensive performance metrics for <span className="font-semibold">{selectedVenueIds.length} selected venues</span></>
            )}
          </p>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
            <p className="text-gray-600 text-lg">
              {isAllVenuesMode ? (
                <>Comprehensive performance metrics for <span className="font-semibold">all venues</span></>
              ) : selectedVenueIds.length === 1 ? (
                <>Performance metrics for <span className="font-semibold">your venue</span></>
              ) : (
                <>Comprehensive performance metrics for <span className="font-semibold">{selectedVenueIds.length} selected venues</span></>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={expandAll}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Venue Breakdown */}
      <div className="space-y-6">
        {selectedVenueIds.map((venueId) => {
          const stats = venueStats[venueId];
          if (!stats) return null;

          const isExpanded = expandedVenues.has(venueId);

          return (
            <ChartCard key={venueId} className="overflow-hidden shadow-sm">
              {/* Venue Header */}
              <button
                onClick={() => toggleVenue(venueId)}
                className="w-full flex items-center justify-between p-8 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-gray-900">{stats.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.todaySessions} sessions · {stats.totalFeedback} feedback items
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {/* Venue Details */}
              {isExpanded && (
                <div className="px-8 pb-8 border-t border-gray-100">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                    <MetricCard
                      icon={Users}
                      title="Today's Sessions"
                      value={stats.todaySessions.toString()}
                      subtitle="Customer interactions"
                      color="blue"
                      trend={stats.sessionsTrend}
                      trendDirection={stats.sessionsTrendDirection}
                    />

                    <MetricCard
                      icon={Star}
                      title="Satisfaction Score"
                      value={stats.avgSatisfaction ? `${stats.avgSatisfaction}/5` : '--'}
                      subtitle="Today's average"
                      color="amber"
                    />

                    <MetricCard
                      icon={Clock}
                      title="Avg Response Time"
                      value={stats.avgResponseTime}
                      subtitle="To all feedback"
                      color="green"
                    />

                    <MetricCard
                      icon={Target}
                      title="Completion Rate"
                      value={stats.completionRate ? `${stats.completionRate}%` : '--'}
                      subtitle="Issues resolved"
                      color="purple"
                    />

                    <MetricCard
                      icon={AlertTriangle}
                      title="Active Alerts"
                      value={stats.activeAlerts.toString()}
                      subtitle="Requiring attention"
                      color={stats.activeAlerts > 0 ? 'red' : 'green'}
                    />

                    <MetricCard
                      icon={CheckCircle}
                      title="Resolved Today"
                      value={stats.resolvedToday.toString()}
                      subtitle="Issues closed"
                      color="green"
                    />

                    <MetricCard
                      icon={Activity}
                      title="Current Activity"
                      value={stats.currentActivity}
                      subtitle="Traffic level"
                      color="indigo"
                    />

                    <MetricCard
                      icon={TrendingUp}
                      title="Today's Peak"
                      value={stats.peakHour}
                      subtitle="Busiest time"
                      color="purple"
                    />
                  </div>

                  {/* Rating Breakdown */}
                  {stats.avgSatisfaction && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = stats.ratingBreakdown[rating];
                          const percentage = stats.totalFeedback > 0
                            ? Math.round((count / stats.totalFeedback) * 100)
                            : 0;

                          return (
                            <div key={rating} className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 w-20">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-semibold text-gray-700">{rating} Star</span>
                              </div>
                              <div className="flex-1 h-7 bg-white rounded-full overflow-hidden shadow-sm">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="w-24 text-right">
                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                                <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ChartCard>
          );
        })}
      </div>
    </div>
  );
};

export default OverviewDetails;
