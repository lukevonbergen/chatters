import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';

const UnresolvedAlertsTile = ({ venueId }) => {
  const [value, setValue] = useState(0);
  const [yesterdayValue, setYesterdayValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

        // Calculate yesterday's date range
        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(startOfDay);
        const yesterdayTwoHours = new Date(endOfYesterday.getTime() - 2 * 60 * 60 * 1000);

        // Fetch TODAY's feedback sessions
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('session_id, created_at, rating, is_actioned, dismissed')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        // Fetch YESTERDAY's feedback sessions
        const { data: yesterdayFeedbackData } = await supabase
          .from('feedback')
          .select('session_id, created_at, rating, is_actioned, dismissed')
          .eq('venue_id', venueId)
          .gte('created_at', startOfYesterday.toISOString())
          .lt('created_at', endOfYesterday.toISOString());

        // Fetch TODAY's unresolved assistance requests
        const { data: assistanceData, error: assistanceError } = await supabase
          .from('assistance_requests')
          .select('id, created_at, status, resolved_at')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString())
          .neq('status', 'resolved')
          .is('resolved_at', null);

        // Fetch YESTERDAY's unresolved assistance requests
        const { data: yesterdayAssistanceData } = await supabase
          .from('assistance_requests')
          .select('id, created_at, status, resolved_at')
          .eq('venue_id', venueId)
          .gte('created_at', startOfYesterday.toISOString())
          .lt('created_at', endOfYesterday.toISOString())
          .neq('status', 'resolved')
          .is('resolved_at', null);

        if (feedbackError || assistanceError) {
          console.error('Error fetching alerts:', feedbackError || assistanceError);
          return;
        }

        // Process TODAY's feedback sessions for low ratings
        const grouped = {};
        for (const row of feedbackData || []) {
          if (!grouped[row.session_id]) grouped[row.session_id] = [];
          grouped[row.session_id].push(row);
        }

        const sessions = Object.values(grouped);
        const urgentFeedbackCount = sessions.filter(session => {
          const createdAt = new Date(session[0].created_at);
          const isExpired = createdAt < twoHoursAgo;
          const hasLowScore = session.some(i => i.rating !== null && i.rating < 3);
          const isUnresolved = !session.every(i => i.is_actioned === true || i.dismissed === true);
          return !isExpired && hasLowScore && isUnresolved;
        }).length;

        // Count TODAY's unresolved assistance requests older than 30 minutes
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        const urgentAssistanceCount = (assistanceData || []).filter(request => {
          const createdAt = new Date(request.created_at);
          return createdAt < thirtyMinutesAgo;
        }).length;

        setValue(urgentFeedbackCount + urgentAssistanceCount);

        // Process YESTERDAY's feedback sessions for low ratings
        const groupedYesterday = {};
        for (const row of yesterdayFeedbackData || []) {
          if (!groupedYesterday[row.session_id]) groupedYesterday[row.session_id] = [];
          groupedYesterday[row.session_id].push(row);
        }

        const yesterdaySessions = Object.values(groupedYesterday);
        const yesterdayUrgentFeedbackCount = yesterdaySessions.filter(session => {
          const createdAt = new Date(session[0].created_at);
          const isExpired = createdAt < yesterdayTwoHours;
          const hasLowScore = session.some(i => i.rating !== null && i.rating < 3);
          const isUnresolved = !session.every(i => i.is_actioned === true || i.dismissed === true);
          return !isExpired && hasLowScore && isUnresolved;
        }).length;

        // Count YESTERDAY's unresolved assistance requests older than 30 minutes
        const yesterdayThirtyMinutesAgo = new Date(endOfYesterday.getTime() - 30 * 60 * 1000);
        const yesterdayUrgentAssistanceCount = (yesterdayAssistanceData || []).filter(request => {
          const createdAt = new Date(request.created_at);
          return createdAt < yesterdayThirtyMinutesAgo;
        }).length;

        setYesterdayValue(yesterdayUrgentFeedbackCount + yesterdayUrgentAssistanceCount);
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);

  const calculateTrend = () => {
    // No trend if no yesterday data
    if (yesterdayValue === 0 && value === 0) {
      return {
        direction: "neutral",
        positive: true,
        text: "All alerts resolved"
      };
    }

    if (yesterdayValue === 0 && value > 0) {
      return {
        direction: "up",
        positive: false,
        value: `+${value}`,
        text: "vs yesterday"
      };
    }

    const difference = value - yesterdayValue;

    if (difference === 0) {
      return {
        direction: "neutral",
        positive: value === 0,
        value: "0",
        text: "vs yesterday"
      };
    }

    // For alerts, fewer is better (positive = true when going down)
    return {
      direction: difference > 0 ? "up" : "down",
      positive: difference < 0, // Fewer alerts is positive
      value: `${difference > 0 ? '+' : ''}${difference}`,
      text: "vs yesterday"
    };
  };

  return (
    <MetricCard
      title="Unresolved Alerts"
      value={value}
      description="Urgent feedback & assistance requiring attention"
      icon={AlertTriangle}
      variant={value > 0 ? "danger" : "success"}
      loading={loading}
      trend={calculateTrend()}
    />
  );
};

export default UnresolvedAlertsTile;