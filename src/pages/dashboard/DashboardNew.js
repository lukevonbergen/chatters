import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import perfLogger from '../../utils/performanceLogger';
import OverviewStats from '../../components/dashboard/overview/OverviewStats';
import RecentActivity from '../../components/dashboard/overview/RecentActivity';
import GoogleRatingTrendCard from '../../components/dashboard/reports/GoogleRatingTrendCard';
import TripAdvisorRatingTrendCard from '../../components/dashboard/reports/TripAdvisorRatingTrendCard';
import ConfigurableMultiVenueTile from '../../components/dashboard/reports/ConfigurableMultiVenueTile';
import MetricSelectorModal from '../../components/dashboard/modals/MetricSelectorModal';
import { ChartCard, ActivityCard } from '../../components/dashboard/layout/ModernCard';
import { DateRangeSelector, overviewPresetRanges } from '../../components/ui/date-range-selector';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Activity, TrendingUp, Calendar, Users, Star, BarChart3, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardNew = () => {
  usePageTitle('Overview');
  const {
    venueId,
    venueName,
    allVenues,
    userRole,
    selectedVenueIds,
    isAllVenuesMode
  } = useVenue();

  // Log page load
  useEffect(() => {
    perfLogger.start('DashboardNew:PageLoad', { venueId, venueName });
    return () => {
      perfLogger.end('DashboardNew:PageLoad');
    };
  }, []);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userTiles, setUserTiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTilePosition, setEditingTilePosition] = useState(null);
  const [dateRangePreset, setDateRangePreset] = useState('today');
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    return { from: today, to: endOfDay };
  });

  // Multi-venue aggregated stats
  const [aggregatedStats, setAggregatedStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const isMultiVenue = selectedVenueIds.length > 1;

  useEffect(() => {
    loadUserName();
    loadUserTiles();
    if (!venueId) return;

    // Load recent activity
    loadRecentActivity();

    // Real-time subscription for assistance requests
    const subscription = supabase
      .channel(`dashboard-activity-${venueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assistance_requests',
          filter: `venue_id=eq.${venueId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const request = payload.new;
            toast((t) => (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    New Assistance Request
                  </div>
                  <div className="text-xs text-gray-600">
                    Table {request.table_number} needs help
                  </div>
                </div>
              </div>
            ), {
              duration: 5000,
              style: {
                background: '#FFF7ED',
                border: '1px solid #FB923C',
                color: '#EA580C'
              }
            });
          }
          loadRecentActivity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback',
          filter: `venue_id=eq.${venueId}`
        },
        () => {
          loadRecentActivity();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [venueId]);

  // Fetch aggregated stats when venue selection changes
  useEffect(() => {
    if (isMultiVenue && selectedVenueIds.length > 0) {
      fetchAggregatedStats(selectedVenueIds);
    }
  }, [selectedVenueIds, isMultiVenue]);

  const loadUserName = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError) {
        if (auth.user?.email) {
          const emailName = auth.user.email.split('@')[0];
          const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setUserName(capitalizedName);
        }
      } else {
        if (userData.first_name) {
          setUserName(userData.first_name);
        } else if (auth.user?.email) {
          const emailName = auth.user.email.split('@')[0];
          const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setUserName(capitalizedName);
        }
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const loadRecentActivity = async () => {
    if (!venueId) return;

    try {
      setActivityLoading(true);

      // Get recent feedback and assistance requests
      const { data: feedback } = await supabase
        .from('feedback')
        .select('id, table_number, rating, additional_feedback, created_at')
        .eq('venue_id', venueId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: assistance } = await supabase
        .from('assistance_requests')
        .select('id, table_number, created_at, acknowledged_at, resolved_at')
        .eq('venue_id', venueId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort activities
      const allActivities = [
        ...(feedback || []),
        ...(assistance || [])
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setRecentActivity(allActivities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch aggregated stats across multiple venues
  const fetchAggregatedStats = async (venueIds) => {
    if (!venueIds || venueIds.length === 0) return;

    try {
      setStatsLoading(true);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      // Fetch today's feedback for all selected venues
      const { data: todayFeedback } = await supabase
        .from('feedback')
        .select('id, session_id, rating, created_at, resolved_at, is_actioned, venue_id')
        .in('venue_id', venueIds)
        .gte('created_at', todayStart.toISOString());

      // Fetch yesterday's feedback for comparison
      const { data: yesterdayFeedback } = await supabase
        .from('feedback')
        .select('id, session_id, rating, resolved_at, is_actioned, venue_id')
        .in('venue_id', venueIds)
        .gte('created_at', yesterdayStart.toISOString())
        .lt('created_at', todayStart.toISOString());

      // Fetch today's assistance requests
      const { data: todayAssistance } = await supabase
        .from('assistance_requests')
        .select('id, created_at, acknowledged_at, resolved_at, venue_id')
        .in('venue_id', venueIds)
        .gte('created_at', todayStart.toISOString());

      // Calculate aggregated stats
      const todaySessionIds = new Set(todayFeedback?.map(f => f.session_id) || []);
      const todaySessions = todaySessionIds.size;

      const yesterdaySessionIds = new Set(yesterdayFeedback?.map(f => f.session_id) || []);
      const yesterdaySessions = yesterdaySessionIds.size;

      // Average satisfaction
      const todayRatings = todayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
      const avgSatisfaction = todayRatings.length > 0
        ? (todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length).toFixed(1)
        : null;

      // Active alerts (unresolved assistance requests)
      const activeAlerts = todayAssistance?.filter(a => !a.resolved_at).length || 0;

      // Resolved today (both feedback and assistance)
      const resolvedFeedback = todayFeedback?.filter(f => f.resolved_at && f.is_actioned).length || 0;
      const resolvedAssistance = todayAssistance?.filter(a => a.resolved_at).length || 0;
      const resolvedToday = resolvedFeedback + resolvedAssistance;

      // Response time calculation
      const resolvedAssistanceToday = todayAssistance?.filter(a => a.resolved_at) || [];
      const assistanceResponseTimes = resolvedAssistanceToday.map(a => {
        const created = new Date(a.created_at);
        const resolved = new Date(a.resolved_at);
        return (resolved - created) / (1000 * 60); // minutes
      });

      const resolvedFeedbackToday = todayFeedback?.filter(f => f.resolved_at && f.is_actioned) || [];
      const feedbackResponseTimes = resolvedFeedbackToday.map(f => {
        const created = new Date(f.created_at);
        const resolved = new Date(f.resolved_at);
        return (resolved - created) / (1000 * 60); // minutes
      });

      const allResponseTimes = [...assistanceResponseTimes, ...feedbackResponseTimes];
      const avgResponseTime = allResponseTimes.length > 0
        ? Math.round(allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length) + ' min'
        : '--';

      // Completion rate
      const totalItems = todayFeedback?.length + todayAssistance?.length || 0;
      const completionRate = totalItems > 0
        ? Math.round((resolvedToday / totalItems) * 100)
        : 0;

      // Calculate trends
      const sessionsTrend = yesterdaySessions > 0
        ? Math.round(((todaySessions - yesterdaySessions) / yesterdaySessions) * 100)
        : 0;

      setAggregatedStats({
        todaySessions,
        avgSatisfaction,
        avgResponseTime,
        completionRate,
        activeAlerts,
        resolvedToday,
        currentActivity: todaySessions > 20 ? 'High' : todaySessions > 10 ? 'Medium' : 'Low',
        sessionsTrend: Math.abs(sessionsTrend),
        sessionsTrendDirection: sessionsTrend > 0 ? 'up' : 'down'
      });
    } catch (error) {
      console.error('Error fetching aggregated stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUserTiles = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from('user_dashboard_tiles')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading user tiles:', error);
        return;
      }

      setUserTiles(data || []);
    } catch (error) {
      console.error('Error in loadUserTiles:', error);
    }
  };

  const handleAddTile = () => {
    setEditingTilePosition(null);
    setIsModalOpen(true);
  };

  const handleChangeTileMetric = (position) => {
    setEditingTilePosition(position);
    setIsModalOpen(true);
  };

  const handleMetricSelect = async (metricType) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      if (editingTilePosition !== null) {
        // Update existing tile
        const { error } = await supabase
          .from('user_dashboard_tiles')
          .update({ metric_type: metricType })
          .eq('user_id', userId)
          .eq('position', editingTilePosition);

        if (error) {
          console.error('Error updating tile:', error);
          toast.error('Failed to update tile');
          return;
        }

        toast.success('Tile updated successfully');
      } else {
        // Add new tile
        const nextPosition = userTiles.length;

        const { error } = await supabase
          .from('user_dashboard_tiles')
          .insert({
            user_id: userId,
            metric_type: metricType,
            position: nextPosition
          });

        if (error) {
          console.error('Error adding tile:', error);
          toast.error('Failed to add tile');
          return;
        }

        toast.success('Tile added successfully');
      }

      loadUserTiles();
    } catch (error) {
      console.error('Error in handleMetricSelect:', error);
      toast.error('An error occurred');
    }
  };

  const handleRemoveTile = async (position) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { error } = await supabase
        .from('user_dashboard_tiles')
        .delete()
        .eq('user_id', userId)
        .eq('position', position);

      if (error) {
        console.error('Error removing tile:', error);
        toast.error('Failed to remove tile');
        return;
      }

      toast.success('Tile removed successfully');

      // Reorder remaining tiles
      const remainingTiles = userTiles.filter(t => t.position !== position);
      for (let i = 0; i < remainingTiles.length; i++) {
        if (remainingTiles[i].position !== i) {
          await supabase
            .from('user_dashboard_tiles')
            .update({ position: i })
            .eq('user_id', userId)
            .eq('id', remainingTiles[i].id);
        }
      }

      loadUserTiles();
    } catch (error) {
      console.error('Error in handleRemoveTile:', error);
      toast.error('An error occurred');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDateRangeChange = ({ preset, range }) => {
    setDateRangePreset(preset);
    // Set end of day for 'to' date
    const endOfDay = new Date(range.to);
    endOfDay.setHours(23, 59, 59, 999);
    setDateRange({ from: range.from, to: endOfDay });
  };

  const getMultiVenueGreeting = () => {
    if (allVenues.length <= 1) return '';
    
    if (userRole === 'master') {
      return `You're managing ${allVenues.length} venues`;
    }
    return `You have access to ${allVenues.length} venues`;
  };

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAllVenuesMode ? (
                <>Viewing metrics across <span className="font-semibold text-gray-800">all venues</span></>
              ) : isMultiVenue ? (
                <>Viewing metrics for <span className="font-semibold text-gray-800">{selectedVenueIds.length} selected venues</span></>
              ) : (
                <>Welcome back to <span className="font-semibold text-gray-800">{venueName}</span></>
              )}
            </p>
          </div>
        </div>

        {getMultiVenueGreeting() && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mt-4">
            <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              {getMultiVenueGreeting()}
            </p>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      {isMultiVenue ? (
        <OverviewStats
          multiVenueStats={aggregatedStats}
          isMultiSite={true}
        />
      ) : (
        <OverviewStats />
      )}

      {/* Configurable Multi-Venue Tiles */}
      {(userTiles.length > 0 || userTiles.length < 3) && (
        <ChartCard
          title="Multi-Venue Overview"
          subtitle="Track metrics across all your venues"
          titleRight={
            <DateRangeSelector
              value={dateRangePreset}
              onChange={handleDateRangeChange}
              presets={overviewPresetRanges}
            />
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTiles.map((tile) => (
              <ConfigurableMultiVenueTile
                key={tile.id}
                metricType={tile.metric_type}
                position={tile.position}
                dateRange={dateRange}
                onRemove={() => handleRemoveTile(tile.position)}
                onChangeMetric={() => handleChangeTileMetric(tile.position)}
              />
            ))}

            {userTiles.length < 3 && (
              <button
                onClick={handleAddTile}
                className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
              >
                <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-full transition-colors">
                  <Plus className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                    Add Metric Tile
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Track metrics across all venues
                  </p>
                </div>
              </button>
            )}
          </div>
        </ChartCard>
      )}

      {/* Platform Ratings Trends - Hidden when multiple venues selected */}
      {!isMultiVenue && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GoogleRatingTrendCard venueId={venueId} />
          <TripAdvisorRatingTrendCard venueId={venueId} />
        </div>
      )}

      {/* Recent Activity - Full Width */}
      <ChartCard
        title="Recent Activity"
        subtitle="Customer interactions from the last 24 hours"
      >
        <RecentActivity
          activities={recentActivity}
          loading={activityLoading}
          selectedVenues={[venueId]}
          isMultiSite={false}
          allVenues={allVenues}
        />
      </ChartCard>

      {/* Metric Selector Modal */}
      <MetricSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleMetricSelect}
        currentMetric={
          editingTilePosition !== null
            ? userTiles.find(t => t.position === editingTilePosition)?.metric_type
            : null
        }
        existingMetrics={userTiles.map(t => t.metric_type)}
      />
    </div>
  );
};

export default DashboardNew;