import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import FeedbackTabs from '../components/FeedbackTabs';
import SessionsActionedTile from '../components/reports/today_TotalSessionsTile';
import UnresolvedAlertsTile from '../components/reports/UnresolvedAlertsTile';
import AvgSatisfactionTile from '../components/reports/AvgSatisfactionTile';
import usePageTitle from '../hooks/usePageTitle';

const DashboardPage = () => {
  usePageTitle('Overview');
  const [venueId, setVenueId] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});
  const [sortOrder, setSortOrder] = useState('desc');
  const [tableFilter, setTableFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      // Step 1: Fetch user record to get account_id
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('account_id')
        .eq('email', user.email)
        .single();

      if (!userRecord?.account_id) {
        navigate('/signin');
        return;
      }

      // Step 2: Fetch the first venue under the same account
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .select('id')
        .eq('account_id', userRecord.account_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!venue?.id) {
        navigate('/settings'); // fallback
        return;
      }

      setVenueId(venue.id);
      await loadQuestionsMap(venue.id);
    };

    init();
  }, [navigate]);

  const loadQuestionsMap = async (venueId) => {
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question')
      .eq('venue_id', venueId);

    const map = {};
    questions?.forEach(q => {
      map[q.id] = q.question;
    });
    setQuestionsMap(map);
  };

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: feedback feed */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Feedback Alerts & History</h2>
              <div className="flex gap-4 items-center">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="">All Tables</option>
                </select>
              </div>
            </div>

            <FeedbackTabs
              venueId={venueId}
              questionsMap={questionsMap}
              sortOrder={sortOrder}
              tableFilter={tableFilter}
            />
          </div>
        </div>

        {/* Right column: metrics */}
        <div className="w-full lg:w-80 space-y-4">
          <SessionsActionedTile venueId={venueId} />
          <UnresolvedAlertsTile venueId={venueId} />
          <AvgSatisfactionTile venueId={venueId} />
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
