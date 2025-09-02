import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MetricCard } from '../../ui/metric-card';
import { CheckCircle } from 'lucide-react';

const SessionsActionedTile = ({ venueId }) => {
  const [actioned, setActioned] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        // Fetch feedback sessions
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('session_id, is_actioned, dismissed')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        // Fetch assistance requests
        const { data: assistanceData, error: assistanceError } = await supabase
          .from('assistance_requests')
          .select('id, status, resolved_at')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        if (feedbackError || assistanceError) {
          console.error('Error fetching data:', feedbackError || assistanceError);
          return;
        }

        // Process feedback sessions
        const grouped = {};
        for (const row of feedbackData || []) {
          if (!grouped[row.session_id]) grouped[row.session_id] = [];
          grouped[row.session_id].push(row);
        }

        const sessions = Object.values(grouped);
        const totalFeedbackSessions = sessions.length;
        const actionedFeedbackSessions = sessions.filter(session =>
          session.every(item => item.is_actioned === true || item.dismissed === true)
        ).length;

        // Process assistance requests
        const totalAssistanceRequests = assistanceData?.length || 0;
        const actionedAssistanceRequests = (assistanceData || []).filter(request =>
          request.status === 'resolved' || request.resolved_at !== null
        ).length;

        setTotal(totalFeedbackSessions + totalAssistanceRequests);
        setActioned(actionedFeedbackSessions + actionedAssistanceRequests);
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);


  const percentage = total > 0 ? ((actioned / total) * 100).toFixed(1) : '0.0';

  return (
    <MetricCard
      title="Today's Sessions"
      value={`${actioned}/${total}`}
      description={`${percentage}% resolved today`}
      icon={CheckCircle}
      variant="success"
      loading={loading}
      trend={
        total > 0 ? {
          text: `${actioned} sessions completed`,
          direction: actioned === total ? "up" : "neutral",
          positive: true
        } : null
      }
    />
  );
};

export default SessionsActionedTile;
