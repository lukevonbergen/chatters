import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StaffLeaderboard = () => {
  const { venueId } = useVenue();
  usePageTitle('Staff Leaderboard');
  const [staffStats, setStaffStats] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7d');

  const fetchStaffLeaderboard = async (venueId) => {
    let fromDate;
    const now = dayjs();
    if (timeFilter === '7d') fromDate = now.subtract(7, 'day').toISOString();
    if (timeFilter === '30d') fromDate = now.subtract(30, 'day').toISOString();

    let feedbackQuery = supabase
      .from('feedback')
      .select('id, session_id, resolved_by, resolved_at, is_actioned')
      .eq('venue_id', venueId);

    if (fromDate) feedbackQuery = feedbackQuery.gte('resolved_at', fromDate);

    const { data: feedbackData, error: feedbackError } = await feedbackQuery;
    if (feedbackError) return;

    const sessionMap = {};
    for (const entry of feedbackData) {
      if (!entry.session_id) continue;
      if (!sessionMap[entry.session_id]) sessionMap[entry.session_id] = [];
      sessionMap[entry.session_id].push(entry);
    }

    const sessionCounts = {};
    for (const items of Object.values(sessionMap)) {
      const allActioned = items.every(i => i.is_actioned);
      const resolver = items[0]?.resolved_by;
      if (allActioned && resolver) {
        sessionCounts[resolver] = (sessionCounts[resolver] || 0) + 1;
      }
    }

    const staffIds = Object.keys(sessionCounts);
    if (staffIds.length === 0) return setStaffStats([]);

    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, first_name, last_name')
      .in('id', staffIds);

    if (staffError) return;

    const combined = staffData.map((s, index) => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      count: sessionCounts[s.id] || 0,
      rank: index + 1
    })).sort((a, b) => b.count - a.count);

    setStaffStats(combined);
  };

  useEffect(() => {
    if (venueId) fetchStaffLeaderboard(venueId);
  }, [venueId, timeFilter]);

  const rankSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Leaderboard</h1>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {staffStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {staffStats.slice(0, 3).map((s, i) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600 mb-4">
                {s.name.split(' ').map(word => word[0]).join('').toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{s.name}</h2>
              <p className="text-sm text-gray-500 mb-4">Feedback Resolved</p>
              <div className="flex justify-between items-center w-full border-t pt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{s.count}</div>
                  <div className="text-xs text-gray-500">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{s.rank}<sup>{rankSuffix(s.rank)}</sup></div>
                  <div className="text-xs text-gray-500">Rank</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-16">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4129/4129335.png"
            alt="No data"
            className="w-24 mx-auto mb-4 opacity-60"
          />
          <h3 className="text-lg font-semibold">No feedback resolved yet</h3>
          <p className="text-sm">Encourage your team to action feedback to appear here!</p>
        </div>
      )}
    </PageContainer>
  );
};

export default StaffLeaderboard;