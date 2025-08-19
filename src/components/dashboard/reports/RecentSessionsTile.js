import React, { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

const RecentSessionsTile = ({ venueId }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('venue_id', venueId);

      const grouped = {};
      for (const row of data || []) {
        if (!grouped[row.session_id]) grouped[row.session_id] = row;
      }

      const count = Object.values(grouped).filter(s => new Date(s.created_at) > oneWeekAgo).length;
      setValue(count);
    };

    fetch();
  }, [venueId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 flex items-center space-x-4">
      <CalendarClock className="w-6 h-6 text-purple-600" />
      <div>
        <p className="text-sm text-gray-600">Feedback This Week</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default RecentSessionsTile;