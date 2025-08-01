// DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import FeedbackTabs from '../components/FeedbackTabs';
import SessionsActionedTile from '../components/reports/today_TotalSessionsTile';
import UnresolvedAlertsTile from '../components/reports/UnresolvedAlertsTile';
import AvgSatisfactionTile from '../components/reports/AvgSatisfactionTile';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

const DashboardPage = () => {
  usePageTitle('Overview');
  const { venueId, loading } = useVenue(); // Add loading from VenueContext
  const [questionsMap, setQuestionsMap] = useState({});
  const [sortOrder, setSortOrder] = useState('desc');
  const [tableFilter, setTableFilter] = useState('');
  const [tableOptions, setTableOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!venueId) return;
    loadQuestionsMap(venueId);
    loadTableOptions(venueId);
    setTableFilter('');
    setSortOrder('desc');
  }, [venueId]);

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

  const loadTableOptions = async (venueId) => {
    const { data: tables } = await supabase
      .from('table_positions')
      .select('table_number')
      .eq('venue_id', venueId);

    setTableOptions(tables?.map(t => t.table_number) || []);
  };

  // Show loading state instead of returning null
  if (loading || !venueId) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <span className="text-gray-500">Loading...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="flex flex-col lg:flex-row gap-8">
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
                  {tableOptions.map((tableNum) => (
                    <option key={tableNum} value={tableNum}>
                      Table {tableNum}
                    </option>
                  ))}
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