import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MetricCard } from '../../ui/metric-card';
import { CheckCircle } from 'lucide-react';

const SessionsActionedTile = ({ venueId }) => {
  const [actioned, setActioned] = useState(0);
  const [total, setTotal] = useState(0);
  const [yesterdayTotal, setYesterdayTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        // Calculate yesterday's date range
        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(startOfDay);

        // Fetch TODAY's feedback sessions
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('session_id, is_actioned, dismissed')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        // Fetch YESTERDAY's feedback sessions
        const { data: yesterdayFeedbackData } = await supabase
          .from('feedback')
          .select('session_id, is_actioned, dismissed')
          .eq('venue_id', venueId)
          .gte('created_at', startOfYesterday.toISOString())
          .lt('created_at', endOfYesterday.toISOString());

        // Fetch TODAY's assistance requests
        const { data: assistanceData, error: assistanceError } = await supabase
          .from('assistance_requests')
          .select('id, status, resolved_at')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        // Fetch YESTERDAY's assistance requests
        const { data: yesterdayAssistanceData } = await supabase
          .from('assistance_requests')
          .select('id, status, resolved_at')
          .eq('venue_id', venueId)
          .gte('created_at', startOfYesterday.toISOString())
          .lt('created_at', endOfYesterday.toISOString());

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

        // Process YESTERDAY's data
        const groupedYesterday = {};
        for (const row of yesterdayFeedbackData || []) {
          if (!groupedYesterday[row.session_id]) groupedYesterday[row.session_id] = [];
          groupedYesterday[row.session_id].push(row);
        }
        const yesterdaySessions = Object.values(groupedYesterday);
        const yesterdayFeedbackTotal = yesterdaySessions.length;
        const yesterdayAssistanceTotal = yesterdayAssistanceData?.length || 0;

        setTotal(totalFeedbackSessions + totalAssistanceRequests);
        setActioned(actionedFeedbackSessions + actionedAssistanceRequests);
        setYesterdayTotal(yesterdayFeedbackTotal + yesterdayAssistanceTotal);
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);


  const percentage = total > 0 ? ((actioned / total) * 100).toFixed(1) : '0.0';

  // Calculate trend vs yesterday
  const calculateTrend = () => {
    if (yesterdayTotal === 0) {
      return total > 0 ? {
        direction: "up",
        positive: true,
        value: `+${total}`,
        text: "vs yesterday"
      } : null;
    }

    const difference = total - yesterdayTotal;
    const percentChange = ((difference / yesterdayTotal) * 100).toFixed(0);

    if (difference === 0) {
      return {
        direction: "neutral",
        positive: true,
        value: "0%",
        text: "vs yesterday"
      };
    }

    return {
      direction: difference > 0 ? "up" : "down",
      positive: true, // More sessions is generally positive
      value: `${difference > 0 ? '+' : ''}${percentChange}%`,
      text: "vs yesterday"
    };
  };

  return (
    <MetricCard
      title="Today's Sessions"
      value={`${actioned}/${total}`}
      description={`${percentage}% resolved today`}
      icon={CheckCircle}
      variant="success"
      loading={loading}
      trend={calculateTrend()}
    />
  );
};

export default SessionsActionedTile;
