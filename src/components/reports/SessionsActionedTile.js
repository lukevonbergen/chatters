// src/components/tiles/SessionsActionedTile.js
import React, { useEffect, useState } from 'react';
import supabase from '../../utils/supabase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SessionsActionedTile = ({ venueId }) => {
  const [actioned, setActioned] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!venueId) return;

    const fetch = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('venue_id', venueId);

      if (error) {
        console.error('Error fetching feedback:', error);
        return;
      }

      // Group feedback by session
      const grouped = {};
      for (const row of data || []) {
        if (!grouped[row.session_id]) grouped[row.session_id] = [];
        grouped[row.session_id].push(row);
      }

      const sessions = Object.values(grouped);

      // Only include sessions with at least one rating ≤ 2
      const alertSessions = sessions.filter(session =>
        session.some(i => i.rating !== null && i.rating <= 2)
      );

      const actionedAlerts = alertSessions.filter(session =>
        session.every(i => i.is_actioned)
      ).length;

      setTotal(alertSessions.length);
      setActioned(actionedAlerts);
    };

    fetch();
  }, [venueId]);

  const percentage = total > 0 ? ((actioned / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border text-center flex flex-col items-center justify-center">
      <div className="w-28 h-28 mb-4">
        <CircularProgressbar
          value={parseFloat(percentage)}
          text={`${percentage}%`}
          styles={buildStyles({
            pathColor: '#10B981',
            textColor: '#111827',
            textSize: '18px',
            trailColor: '#e5e7eb',
          })}
        />
      </div>
      <p className="text-sm text-gray-700">
        {actioned} of {total} sessions have been actioned
      </p>
    </div>
  );
};

export default SessionsActionedTile;
