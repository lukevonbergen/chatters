import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';

const UnresolvedAlertsTile = ({ venueId }) => {
  const [value, setValue] = useState(0);
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

        // Fetch feedback sessions
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('session_id, created_at, rating, is_actioned, dismissed')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        // Fetch unresolved assistance requests
        const { data: assistanceData, error: assistanceError } = await supabase
          .from('assistance_requests')
          .select('id, created_at, status, resolved_at')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString())
          .neq('status', 'resolved')
          .is('resolved_at', null);

        if (feedbackError || assistanceError) {
          console.error('Error fetching alerts:', feedbackError || assistanceError);
          return;
        }

        // Process feedback sessions for low ratings
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

        // Count unresolved assistance requests older than 30 minutes
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        const urgentAssistanceCount = (assistanceData || []).filter(request => {
          const createdAt = new Date(request.created_at);
          return createdAt < thirtyMinutesAgo;
        }).length;

        setValue(urgentFeedbackCount + urgentAssistanceCount);
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);


  return (
    <MetricCard
      title="Unresolved Alerts"
      value={value}
      description="Urgent feedback & assistance requiring attention"
      icon={AlertTriangle}
      variant={value > 0 ? "danger" : "success"}
      loading={loading}
      trend={
        value > 0 ? {
          text: `${value} sessions need attention`,
          direction: "up",
          positive: false
        } : {
          text: "All alerts resolved",
          direction: "neutral", 
          positive: true
        }
      }
    />
  );
};

export default UnresolvedAlertsTile;