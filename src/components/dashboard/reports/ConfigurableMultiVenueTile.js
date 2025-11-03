import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { useVenue } from '../../../context/VenueContext';
import { Settings, X, BarChart3, TrendingUp, Star, AlertTriangle, Award, ThumbsUp } from 'lucide-react';

const METRIC_CONFIG = {
  total_feedback: {
    title: 'Total Feedback Count',
    icon: BarChart3,
    fetchData: async (venueIds, dateRange) => {
      const { data } = await supabase
        .from('feedback')
        .select('session_id, venue_id')
        .in('venue_id', venueIds)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      // Group by venue and count unique sessions
      const venueStats = {};
      venueIds.forEach(id => venueStats[id] = new Set());

      (data || []).forEach(item => {
        if (venueStats[item.venue_id]) {
          venueStats[item.venue_id].add(item.session_id);
        }
      });

      return Object.entries(venueStats).map(([venueId, sessions]) => ({
        venueId,
        value: sessions.size,
        displayValue: sessions.size.toString()
      }));
    }
  },

  resolved_feedback: {
    title: 'Total Resolved Feedback',
    icon: ThumbsUp,
    fetchData: async (venueIds, dateRange) => {
      const { data } = await supabase
        .from('feedback')
        .select('session_id, venue_id, is_actioned, dismissed')
        .in('venue_id', venueIds)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      // Group by venue and session
      const venueSessions = {};
      venueIds.forEach(id => venueSessions[id] = {});

      (data || []).forEach(item => {
        if (!venueSessions[item.venue_id][item.session_id]) {
          venueSessions[item.venue_id][item.session_id] = [];
        }
        venueSessions[item.venue_id][item.session_id].push(item);
      });

      return Object.entries(venueSessions).map(([venueId, sessions]) => {
        const sessionArray = Object.values(sessions);
        const total = sessionArray.length;
        const resolved = sessionArray.filter(session =>
          session.every(item => item.is_actioned === true || item.dismissed === true)
        ).length;
        const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

        return {
          venueId,
          value: resolved,
          displayValue: `${resolved} (${percentage}%)`
        };
      });
    }
  },

  avg_satisfaction: {
    title: 'Average Satisfaction',
    icon: Star,
    fetchData: async (venueIds, dateRange) => {
      const { data } = await supabase
        .from('feedback')
        .select('venue_id, rating')
        .in('venue_id', venueIds)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .not('rating', 'is', null);

      // Group by venue and calculate average
      const venueRatings = {};
      venueIds.forEach(id => venueRatings[id] = []);

      (data || []).forEach(item => {
        if (venueRatings[item.venue_id]) {
          venueRatings[item.venue_id].push(item.rating);
        }
      });

      return Object.entries(venueRatings).map(([venueId, ratings]) => {
        const avg = ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
          : 'N/A';

        return {
          venueId,
          value: ratings.length > 0 ? parseFloat(avg) : 0,
          displayValue: avg !== 'N/A' ? `${avg}/5` : 'N/A'
        };
      });
    }
  },

  unresolved_alerts: {
    title: 'Unresolved Alerts',
    icon: AlertTriangle,
    fetchData: async (venueIds, dateRange) => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('session_id, venue_id, created_at, rating, is_actioned, dismissed')
        .in('venue_id', venueIds)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      const { data: assistanceData } = await supabase
        .from('assistance_requests')
        .select('id, venue_id, created_at, status, resolved_at')
        .in('venue_id', venueIds)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .neq('status', 'resolved')
        .is('resolved_at', null);

      // Process feedback by venue
      const venueSessions = {};
      venueIds.forEach(id => venueSessions[id] = {});

      (feedbackData || []).forEach(item => {
        if (!venueSessions[item.venue_id][item.session_id]) {
          venueSessions[item.venue_id][item.session_id] = [];
        }
        venueSessions[item.venue_id][item.session_id].push(item);
      });

      // Count urgent feedback per venue
      const venueAlerts = {};
      venueIds.forEach(id => venueAlerts[id] = 0);

      Object.entries(venueSessions).forEach(([venueId, sessions]) => {
        const sessionArray = Object.values(sessions);
        const urgentCount = sessionArray.filter(session => {
          const createdAt = new Date(session[0].created_at);
          const isExpired = createdAt < twoHoursAgo;
          const hasLowScore = session.some(i => i.rating !== null && i.rating < 3);
          const isUnresolved = !session.every(i => i.is_actioned === true || i.dismissed === true);
          return !isExpired && hasLowScore && isUnresolved;
        }).length;
        venueAlerts[venueId] += urgentCount;
      });

      // Count urgent assistance requests per venue
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      (assistanceData || []).forEach(request => {
        const createdAt = new Date(request.created_at);
        if (createdAt < thirtyMinutesAgo) {
          venueAlerts[request.venue_id] = (venueAlerts[request.venue_id] || 0) + 1;
        }
      });

      return Object.entries(venueAlerts).map(([venueId, count]) => ({
        venueId,
        value: count,
        displayValue: count.toString()
      }));
    }
  },

  best_staff: {
    title: 'Best Staff Member',
    icon: Award,
    fetchData: async (venueIds, dateRange) => {
      // Fetch resolved feedback sessions (using resolved_by like the staff leaderboard)
      const { data, error } = await supabase
        .from('feedback')
        .select('venue_id, session_id, resolved_by')
        .in('venue_id', venueIds)
        .not('resolved_by', 'is', null)
        .gte('resolved_at', dateRange.from.toISOString())
        .lte('resolved_at', dateRange.to.toISOString());

      if (error) {
        console.error('Error fetching staff feedback:', error);
        return venueIds.map(venueId => ({
          venueId,
          value: 0,
          displayValue: 'No data'
        }));
      }

      // Group by venue and count sessions per staff member
      const venueStaffSessions = {};
      venueIds.forEach(id => venueStaffSessions[id] = {});

      (data || []).forEach(item => {
        if (item.session_id && item.resolved_by) {
          if (!venueStaffSessions[item.venue_id][item.resolved_by]) {
            venueStaffSessions[item.venue_id][item.resolved_by] = new Set();
          }
          venueStaffSessions[item.venue_id][item.resolved_by].add(item.session_id);
        }
      });

      // Fetch employee names (staff are in employees table)
      const staffIds = new Set();
      Object.values(venueStaffSessions).forEach(venueStaff => {
        Object.keys(venueStaff).forEach(staffId => staffIds.add(staffId));
      });

      const { data: employeeData } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .in('id', [...staffIds]);

      const employeeMap = {};
      (employeeData || []).forEach(employee => {
        employeeMap[employee.id] = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown';
      });

      // Calculate results for each venue
      return venueIds.map(venueId => {
        const staff = venueStaffSessions[venueId];
        const staffArray = Object.entries(staff).map(([staffId, sessions]) => ({
          staffId,
          count: sessions.size,
          name: employeeMap[staffId] || 'Unknown'
        }));

        if (staffArray.length === 0) {
          return {
            venueId,
            value: 0,
            displayValue: 'No data'
          };
        }

        const best = staffArray.reduce((max, current) =>
          current.count > max.count ? current : max
        );

        return {
          venueId,
          value: best.count,
          displayValue: `${best.name} (${best.count})`
        };
      });
    }
  },

  google_rating: {
    title: 'Google Rating',
    icon: Star,
    fetchData: async (venueIds) => {
      const { data } = await supabase
        .from('external_ratings')
        .select('venue_id, rating')
        .in('venue_id', venueIds)
        .eq('source', 'google');

      const venueRatings = {};
      venueIds.forEach(id => venueRatings[id] = null);

      (data || []).forEach(item => {
        venueRatings[item.venue_id] = item.rating;
      });

      return Object.entries(venueRatings).map(([venueId, rating]) => ({
        venueId,
        value: rating ? parseFloat(rating) : 0,
        displayValue: rating ? `${parseFloat(rating).toFixed(1)}/5` : 'N/A'
      }));
    }
  },

  tripadvisor_rating: {
    title: 'TripAdvisor Rating',
    icon: Star,
    fetchData: async (venueIds) => {
      const { data } = await supabase
        .from('external_ratings')
        .select('venue_id, rating')
        .in('venue_id', venueIds)
        .eq('source', 'tripadvisor');

      const venueRatings = {};
      venueIds.forEach(id => venueRatings[id] = null);

      (data || []).forEach(item => {
        venueRatings[item.venue_id] = item.rating;
      });

      return Object.entries(venueRatings).map(([venueId, rating]) => ({
        venueId,
        value: rating ? parseFloat(rating) : 0,
        displayValue: rating ? `${parseFloat(rating).toFixed(1)}/5` : 'N/A'
      }));
    }
  }
};

const ConfigurableMultiVenueTile = ({ metricType, position, onRemove, onChangeMetric, dateRange }) => {
  const { allVenues } = useVenue();
  const [venueStats, setVenueStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = METRIC_CONFIG[metricType];
  const Icon = config?.icon || BarChart3;

  useEffect(() => {
    if (!allVenues || allVenues.length === 0 || !dateRange) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const venueIds = allVenues.map(v => v.id);
        const stats = await config.fetchData(venueIds, dateRange);

        // Sort by value descending
        const sortedStats = stats.sort((a, b) => b.value - a.value);

        // Add venue names
        const statsWithNames = sortedStats.map(stat => {
          const venue = allVenues.find(v => v.id === stat.venueId);
          return {
            ...stat,
            venueName: venue?.name || 'Unknown Venue'
          };
        });

        setVenueStats(statsWithNames);
      } catch (error) {
        console.error('Error fetching venue stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [allVenues, metricType, dateRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="flex gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">{config.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onChangeMetric}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Change metric"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove tile"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Venue Breakdown */}
      <div className="space-y-2">
        {venueStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          venueStats.map((stat) => (
            <div
              key={stat.venueId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{stat.venueName}</span>
              <span className="text-sm font-semibold text-gray-900">{stat.displayValue}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConfigurableMultiVenueTile;
