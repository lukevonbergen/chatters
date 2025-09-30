import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const useOverviewStats = (venueId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!venueId) {
      setStats(null);
      setLoading(false);
      return;
    }

    fetchStats();
  }, [venueId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      // Fetch today's feedback sessions
      const { data: todayFeedback } = await supabase
        .from('feedback')
        .select('id, rating, created_at')
        .eq('venue_id', venueId)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false });

      // Fetch yesterday's feedback for comparison
      const { data: yesterdayFeedback } = await supabase
        .from('feedback')
        .select('id, rating')
        .eq('venue_id', venueId)
        .gte('created_at', yesterdayStart.toISOString())
        .lt('created_at', todayStart.toISOString());

      // Fetch today's assistance requests
      const { data: todayAssistance } = await supabase
        .from('assistance_requests')
        .select('id, created_at, acknowledged_at, resolved_at')
        .eq('venue_id', venueId)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false });

      // Fetch yesterday's assistance for comparison
      const { data: yesterdayAssistance } = await supabase
        .from('assistance_requests')
        .select('id, created_at, acknowledged_at, resolved_at')
        .eq('venue_id', venueId)
        .gte('created_at', yesterdayStart.toISOString())
        .lt('created_at', todayStart.toISOString());

      // Calculate stats
      const todaySessions = todayFeedback?.length || 0;
      const yesterdaySessions = yesterdayFeedback?.length || 0;
      
      // Average satisfaction
      const todayRatings = todayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
      const avgSatisfaction = todayRatings.length > 0 
        ? (todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length).toFixed(1)
        : null;

      const yesterdayRatings = yesterdayFeedback?.filter(f => f.rating).map(f => f.rating) || [];
      const yesterdayAvgSatisfaction = yesterdayRatings.length > 0 
        ? yesterdayRatings.reduce((a, b) => a + b, 0) / yesterdayRatings.length
        : null;

      // Response time calculation
      const resolvedToday = todayAssistance?.filter(a => a.resolved_at) || [];
      const avgResponseTime = resolvedToday.length > 0 
        ? calculateAverageResponseTime(resolvedToday)
        : null;

      const resolvedYesterday = yesterdayAssistance?.filter(a => a.resolved_at) || [];
      const yesterdayAvgResponseTime = resolvedYesterday.length > 0 
        ? calculateAverageResponseTimeMs(resolvedYesterday)
        : null;

      // Completion rate
      const totalToday = todayAssistance?.length || 0;
      const completedToday = resolvedToday.length;
      const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : null;

      const totalYesterday = yesterdayAssistance?.length || 0;
      const completedYesterday = resolvedYesterday.length;
      const yesterdayCompletionRate = totalYesterday > 0 ? (completedYesterday / totalYesterday) * 100 : null;

      // Active alerts (unresolved assistance requests)
      const activeAlerts = todayAssistance?.filter(a => !a.resolved_at).length || 0;

      // Peak hour analysis
      const peakHour = calculatePeakHour(todayFeedback || []);

      // Activity level
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
        completionTrendDirection: completionTrend?.direction
      });

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

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
    if (sessions >= 20) return 'High';
    if (sessions >= 10) return 'Medium';
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

  return { stats, loading, error, refetch: fetchStats };
};

export default useOverviewStats;