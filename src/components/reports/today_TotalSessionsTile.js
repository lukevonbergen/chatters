import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MetricCard } from '../ui/metric-card';
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

        const { data, error } = await supabase
          .from('feedback')
          .select('session_id, is_actioned, dismissed')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        if (error) {
          console.error('Error fetching feedback:', error);
          return;
        }

        const grouped = {};
        for (const row of data || []) {
          if (!grouped[row.session_id]) grouped[row.session_id] = [];
          grouped[row.session_id].push(row);
        }

        const sessions = Object.values(grouped);
        const totalSessions = sessions.length;
        const actionedSessions = sessions.filter(session =>
          session.every(item => item.is_actioned === true || item.dismissed === true)
        ).length;

        setTotal(totalSessions);
        setActioned(actionedSessions);
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
