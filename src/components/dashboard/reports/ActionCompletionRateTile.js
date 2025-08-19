import React, { useState, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';
import { CheckCircle2 } from 'lucide-react';

const ActionCompletionRateTile = ({ venueId, actionedCount: propActionedCount, totalCount: propTotalCount }) => {
  const [actionedCount, setActionedCount] = useState(propActionedCount || 0);
  const [totalCount, setTotalCount] = useState(propTotalCount || 0);
  const [loading, setLoading] = useState(!propActionedCount && !propTotalCount);

  useEffect(() => {
    if (!propActionedCount && !propTotalCount && venueId) {
      loadActionCompletionData();
    }
  }, [venueId, propActionedCount, propTotalCount]);

  const loadActionCompletionData = async () => {
    setLoading(true);
    try {
      // Get all feedback for this venue
      const { data: allFeedback, error } = await supabase
        .from('feedback')
        .select('id, session_id, is_actioned, dismissed')
        .eq('venue_id', venueId);

      if (error) throw error;

      // Group by session_id to count sessions, not individual feedback items
      const sessions = {};
      allFeedback.forEach(feedback => {
        if (!sessions[feedback.session_id]) {
          sessions[feedback.session_id] = [];
        }
        sessions[feedback.session_id].push(feedback);
      });

      // Count sessions where all feedback items are actioned OR dismissed
      let actionedSessions = 0;
      const totalSessions = Object.keys(sessions).length;

      Object.values(sessions).forEach(sessionFeedback => {
        const allActioned = sessionFeedback.every(item => item.is_actioned === true);
        const allDismissed = sessionFeedback.every(item => item.dismissed === true);
        
        if (allActioned || allDismissed) {
          actionedSessions++;
        }
      });

      setActionedCount(actionedSessions);
      setTotalCount(totalSessions);
    } catch (error) {
      console.error('Error loading action completion data:', error);
      setActionedCount(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = totalCount > 0 ? ((actionedCount / totalCount) * 100).toFixed(1) : 0;

  const getVariant = (rate) => {
    if (rate >= 90) return "success";
    if (rate >= 70) return "warning";
    if (rate >= 50) return "info";
    return "danger";
  };

  return (
    <MetricCard
      title="Completion Rate"
      value={`${completionRate}%`}
      description={`${actionedCount || 0}/${totalCount || 0} sessions resolved`}
      icon={CheckCircle2}
      variant={getVariant(parseFloat(completionRate))}
      loading={loading}
      trend={
        totalCount > 0 ? {
          text: parseFloat(completionRate) >= 80 ? "Great performance" : "Room for improvement",
          direction: parseFloat(completionRate) >= 80 ? "up" : "down",
          positive: parseFloat(completionRate) >= 80
        } : null
      }
    />
  );
};

export default ActionCompletionRateTile;