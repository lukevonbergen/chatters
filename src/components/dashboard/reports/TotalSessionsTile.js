import React, { useEffect, useState } from 'react';
import { BarChart } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

const TotalSessionsTile = ({ venueId }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('session_id')
        .eq('venue_id', venueId);

      const sessionIds = new Set((data || []).map(row => row.session_id));
      setValue(sessionIds.size);
    };

    fetch();
  }, [venueId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 flex items-center space-x-4">
      <BarChart className="w-6 h-6 text-blue-600" />
      <div>
        <p className="text-sm text-gray-600">Total Feedback Sessions</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default TotalSessionsTile;