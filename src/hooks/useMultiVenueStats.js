import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const useMultiVenueStats = (venueIds = [], isMultiSite = false) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venueBreakdowns, setVenueBreakdowns] = useState({});

  useEffect(() => {
    if (!venueIds || venueIds.length === 0 || venueIds.some(id => !id)) {
      setStats(null);
      setLoading(false);
      return;
    }

    fetchStats();
  }, [venueIds, isMultiSite]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      if (isMultiSite && venueIds.length > 1) {
        // Multi-venue aggregated stats
        await fetchMultiVenueStats(todayStart, yesterdayStart);
      } else {
        // Single venue stats (fallback to original logic)
        await fetchSingleVenueStats(venueIds[0], todayStart, yesterdayStart);
      }

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMultiVenueStats = async (todayStart, yesterdayStart) => {
    // Validate venue IDs
    const validVenueIds = venueIds.filter(id => id && typeof id === 'string');
    if (validVenueIds.length === 0) {
      throw new Error('No valid venue IDs provided');
    }

    // Fetch today's feedback for all venues
    const { data: todayFeedback, error: todayFeedbackError } = await supabase
      .from('feedback')
      .select('id, rating, created_at, venue_id')
      .in('venue_id', validVenueIds)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    if (todayFeedbackError) {
      throw todayFeedbackError;
    }

    // Fetch yesterday's feedback for comparison
    const { data: yesterdayFeedback, error: yesterdayFeedbackError } = await supabase
      .from('feedback')
      .select('id, rating, venue_id')
      .in('venue_id', validVenueIds)
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString());

    if (yesterdayFeedbackError) {
      throw yesterdayFeedbackError;
    }

    // Fetch today's assistance requests for all venues
    const { data: todayAssistance, error: todayAssistanceError } = await supabase
      .from('assistance_requests')
      .select('id, created_at, acknowledged_at, resolved_at, venue_id')
      .in('venue_id', validVenueIds)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    if (todayAssistanceError) {
      throw todayAssistanceError;
    }

    // Fetch Google ratings for all venues
    const { data: googleRatings, error: googleRatingsError } = await supabase
      .from('external_ratings')
      .select('venue_id, rating, ratings_count')
      .in('venue_id', validVenueIds)
      .eq('source', 'google');

    if (googleRatingsError) {
      throw googleRatingsError;
    }

    // Fetch TripAdvisor ratings for all venues
    const { data: tripAdvisorRatings, error: tripAdvisorRatingsError } = await supabase
      .from('external_ratings')
      .select('venue_id, rating, ratings_count')
      .in('venue_id', validVenueIds)
      .eq('source', 'tripadvisor');

    if (tripAdvisorRatingsError) {
      throw tripAdvisorRatingsError;
    }

    // Fetch yesterday's assistance for comparison
    const { data: yesterdayAssistance, error: yesterdayAssistanceError } = await supabase
      .from('assistance_requests')
      .select('id, created_at, acknowledged_at, resolved_at, venue_id')
      .in('venue_id', validVenueIds)
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString());

    if (yesterdayAssistanceError) {
      throw yesterdayAssistanceError;
    }

    // Calculate aggregated stats
    const todaySessions = todayFeedback?.length || 0;
    const yesterdaySessions = yesterdayFeedback?.length || 0;
    
    // Average satisfaction across all venues
    const todayRatings = todayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
    const avgSatisfaction = todayRatings.length > 0 
      ? (todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length).toFixed(1)
      : null;

    const yesterdayRatings = yesterdayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
    const yesterdayAvgSatisfaction = yesterdayRatings.length > 0 
      ? yesterdayRatings.reduce((a, b) => a + b, 0) / yesterdayRatings.length
      : null;

    // Response time calculation across all venues
    const resolvedToday = todayAssistance?.filter(a => a.resolved_at) || [];
    const avgResponseTime = resolvedToday.length > 0 
      ? calculateAverageResponseTime(resolvedToday)
      : null;

    const resolvedYesterday = yesterdayAssistance?.filter(a => a.resolved_at) || [];
    const yesterdayAvgResponseTime = resolvedYesterday.length > 0 
      ? calculateAverageResponseTimeMs(resolvedYesterday)
      : null;

    // Completion rate across all venues
    const totalToday = todayAssistance?.length || 0;
    const completedToday = resolvedToday.length;
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : null;

    const totalYesterday = yesterdayAssistance?.length || 0;
    const completedYesterday = resolvedYesterday.length;
    const yesterdayCompletionRate = totalYesterday > 0 ? (completedYesterday / totalYesterday) * 100 : null;

    // Active alerts across all venues
    const activeAlerts = todayAssistance?.filter(a => !a.resolved_at).length || 0;

    // Peak hour analysis across all venues
    const peakHour = calculatePeakHour(todayFeedback || []);

    // Activity level based on total sessions
    const currentActivity = calculateActivityLevel(todaySessions);

    // Calculate trends
    const sessionsTrend = calculateTrend(todaySessions, yesterdaySessions);
    const satisfactionTrend = avgSatisfaction && yesterdayAvgSatisfaction 
      ? calculateTrend(parseFloat(avgSatisfaction), yesterdayAvgSatisfaction, true)
      : null;
    const responseTimeTrend = avgResponseTime && yesterdayAvgResponseTime 
      ? calculateTrend(calculateAverageResponseTimeMs(resolvedToday), yesterdayAvgResponseTime, false, true)
      : null;
    const completionTrend = completionRate && yesterdayCompletionRate 
      ? calculateTrend(completionRate, yesterdayCompletionRate, true)
      : null;

    // Create venue breakdowns for all metrics
    const breakdowns = {};
    for (const venueId of validVenueIds) {
      const venueFeedback = todayFeedback?.filter(f => f.venue_id === venueId) || [];
      const venueRatings = venueFeedback.filter(f => f.rating).map(f => f.rating);
      const venueAvgSatisfaction = venueRatings.length > 0 
        ? (venueRatings.reduce((a, b) => a + b, 0) / venueRatings.length).toFixed(1)
        : null;
      
      // Venue assistance requests
      const venueAssistance = todayAssistance?.filter(a => a.venue_id === venueId) || [];
      const venueResolved = venueAssistance.filter(a => a.resolved_at);
      
      // Venue response time
      const venueAvgResponseTime = venueResolved.length > 0 
        ? calculateAverageResponseTime(venueResolved)
        : null;
      
      // Venue completion rate
      const venueTotal = venueAssistance.length;
      const venueCompleted = venueResolved.length;
      const venueCompletionRate = venueTotal > 0 ? Math.round((venueCompleted / venueTotal) * 100) : null;
      
      // Venue activity level
      const venueCurrentActivity = calculateActivityLevel(venueFeedback.length);
      
      // Venue peak hour
      const venuePeakHour = calculatePeakHour(venueFeedback);
      
      // Venue ratings
      const venueGoogleRating = googleRatings?.find(r => r.venue_id === venueId);
      const venueTripAdvisorRating = tripAdvisorRatings?.find(r => r.venue_id === venueId);
      
      breakdowns[venueId] = {
        sessions: venueFeedback.length,
        avgSatisfaction: venueAvgSatisfaction,
        activeAlerts: venueAssistance.filter(a => !a.resolved_at).length,
        avgResponseTime: venueAvgResponseTime,
        completionRate: venueCompletionRate,
        resolvedToday: venueCompleted,
        currentActivity: venueCurrentActivity,
        peakHour: venuePeakHour,
        googleRating: venueGoogleRating ? parseFloat(venueGoogleRating.rating) : null,
        tripAdvisorRating: venueTripAdvisorRating ? parseFloat(venueTripAdvisorRating.rating) : null
      };
    }

    setVenueBreakdowns(breakdowns);

    setStats({
      todaySessions,
      avgSatisfaction,
      avgResponseTime,
      completionRate,
      activeAlerts,
      resolvedToday: completedToday,
      currentActivity,
      peakHour,
      sessionsTrend: sessionsTrend?.value,
      sessionsTrendDirection: sessionsTrend?.direction,
      satisfactionTrend: satisfactionTrend?.value,
      satisfactionTrendDirection: satisfactionTrend?.direction,
      responseTimeTrend: responseTimeTrend?.value,
      responseTimeTrendDirection: responseTimeTrend?.direction,
      completionTrend: completionTrend?.value,
      completionTrendDirection: completionTrend?.direction,
      isMultiSite: true,
      venueCount: validVenueIds.length
    });
  };

  const fetchSingleVenueStats = async (venueId, todayStart, yesterdayStart) => {
    // Validate venue ID
    if (!venueId || typeof venueId !== 'string') {
      throw new Error('Invalid venue ID provided');
    }

    // Use the original single-venue logic
    const { data: todayFeedback, error: todayFeedbackError } = await supabase
      .from('feedback')
      .select('id, rating, created_at')
      .eq('venue_id', venueId)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    if (todayFeedbackError) {
      throw todayFeedbackError;
    }

    const { data: yesterdayFeedback, error: yesterdayFeedbackError } = await supabase
      .from('feedback')
      .select('id, rating')
      .eq('venue_id', venueId)
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString());

    if (yesterdayFeedbackError) {
      throw yesterdayFeedbackError;
    }

    const { data: todayAssistance } = await supabase
      .from('assistance_requests')
      .select('id, created_at, acknowledged_at, resolved_at')
      .eq('venue_id', venueId)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    const { data: yesterdayAssistance } = await supabase
      .from('assistance_requests')
      .select('id, created_at, acknowledged_at, resolved_at')
      .eq('venue_id', venueId)
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString());

    // Calculate single venue stats (same as original)
    const todaySessions = todayFeedback?.length || 0;
    const yesterdaySessions = yesterdayFeedback?.length || 0;
    
    const todayRatings = todayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
    const avgSatisfaction = todayRatings.length > 0 
      ? (todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length).toFixed(1)
      : null;

    const yesterdayRatings = yesterdayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
    const yesterdayAvgSatisfaction = yesterdayRatings.length > 0 
      ? yesterdayRatings.reduce((a, b) => a + b, 0) / yesterdayRatings.length
      : null;

    const resolvedToday = todayAssistance?.filter(a => a.resolved_at) || [];
    const avgResponseTime = resolvedToday.length > 0 
      ? calculateAverageResponseTime(resolvedToday)
      : null;

    const resolvedYesterday = yesterdayAssistance?.filter(a => a.resolved_at) || [];
    const yesterdayAvgResponseTime = resolvedYesterday.length > 0 
      ? calculateAverageResponseTimeMs(resolvedYesterday)
      : null;

    const totalToday = todayAssistance?.length || 0;
    const completedToday = resolvedToday.length;
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : null;

    const totalYesterday = yesterdayAssistance?.length || 0;
    const completedYesterday = resolvedYesterday.length;
    const yesterdayCompletionRate = totalYesterday > 0 ? (completedYesterday / totalYesterday) * 100 : null;

    const activeAlerts = todayAssistance?.filter(a => !a.resolved_at).length || 0;
    const peakHour = calculatePeakHour(todayFeedback || []);
    const currentActivity = calculateActivityLevel(todaySessions);

    const sessionsTrend = calculateTrend(todaySessions, yesterdaySessions);
    const satisfactionTrend = avgSatisfaction && yesterdayAvgSatisfaction 
      ? calculateTrend(parseFloat(avgSatisfaction), yesterdayAvgSatisfaction, true)
      : null;
    const responseTimeTrend = avgResponseTime && yesterdayAvgResponseTime 
      ? calculateTrend(calculateAverageResponseTimeMs(resolvedToday), yesterdayAvgResponseTime, false, true)
      : null;
    const completionTrend = completionRate && yesterdayCompletionRate 
      ? calculateTrend(completionRate, yesterdayCompletionRate, true)
      : null;

    setStats({
      todaySessions,
      avgSatisfaction,
      avgResponseTime,
      completionRate,
      activeAlerts,
      resolvedToday: completedToday,
      currentActivity,
      peakHour,
      sessionsTrend: sessionsTrend?.value,
      sessionsTrendDirection: sessionsTrend?.direction,
      satisfactionTrend: satisfactionTrend?.value,
      satisfactionTrendDirection: satisfactionTrend?.direction,
      responseTimeTrend: responseTimeTrend?.value,
      responseTimeTrendDirection: responseTimeTrend?.direction,
      completionTrend: completionTrend?.value,
      completionTrendDirection: completionTrend?.direction,
      isMultiSite: false,
      venueCount: 1
    });

    setVenueBreakdowns({});
  };

  // Helper functions (same as original)
  const calculateAverageResponseTime = (resolvedRequests) => {
    if (!resolvedRequests.length) return null;
    
    const totalMs = resolvedRequests.reduce((sum, request) => {
      const created = new Date(request.created_at);
      const resolved = new Date(request.resolved_at);
      return sum + (resolved - created);
    }, 0);
    
    const avgMs = totalMs / resolvedRequests.length;
    const minutes = Math.round(avgMs / 60000);
    
    if (minutes < 1) return '< 1m';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.round(minutes / 60)}h ${minutes % 60}m`;
  };

  const calculateAverageResponseTimeMs = (resolvedRequests) => {
    if (!resolvedRequests.length) return null;
    
    const totalMs = resolvedRequests.reduce((sum, request) => {
      const created = new Date(request.created_at);
      const resolved = new Date(request.resolved_at);
      return sum + (resolved - created);
    }, 0);
    
    return totalMs / resolvedRequests.length;
  };

  const calculatePeakHour = (feedback) => {
    if (!feedback.length) return null;
    
    const hourCounts = {};
    feedback.forEach(f => {
      const hour = new Date(f.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );
    
    const hour12 = parseInt(peakHour) % 12 || 12;
    const ampm = parseInt(peakHour) < 12 ? 'AM' : 'PM';
    return `${hour12}${ampm}`;
  };

  const calculateActivityLevel = (sessions) => {
    if (sessions >= 50) return 'Very High'; // Adjusted for multi-venue
    if (sessions >= 30) return 'High';
    if (sessions >= 15) return 'Medium';
    if (sessions >= 5) return 'Low';
    return 'Very Low';
  };

  const calculateTrend = (current, previous, higherIsBetter = true, lowerIsBetter = false) => {
    if (current === null || previous === null || previous === 0) return null;
    
    const percentChange = ((current - previous) / previous) * 100;
    const absChange = Math.abs(percentChange);
    
    if (absChange < 1) return { value: '~0%', direction: 'neutral' };
    
    const value = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}%`;
    
    let direction;
    if (lowerIsBetter) {
      direction = percentChange < 0 ? 'up' : 'down';
    } else {
      direction = percentChange > 0 ? 'up' : 'down';
    }
    
    return { value, direction };
  };

  return { stats, loading, error, refetch: fetchStats, venueBreakdowns };
};

export default useMultiVenueStats;