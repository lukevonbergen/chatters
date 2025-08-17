import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Kiosk components
import KioskFloorPlan from './components/kiosk/KioskFloorPlan';
import KioskFeedbackList from './components/kiosk/KioskFeedbackList';
import KioskZoneOverview from './components/kiosk/KioskZoneOverview';
import KioskAssistanceList from './components/kiosk/KioskAssistanceList';

dayjs.extend(relativeTime);

const KioskPage = () => {
  const { venueId, venueName, loading: venueLoading } = useVenue();

  // State
  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or zone id
  const [inactivityTimer, setInactivityTimer] = useState(null); // kept for easy re-enable
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // ==== AUTO-RETURN (10s) — DISABLED ====
  // useEffect(() => {
  //   if (currentView !== 'overview') {
  //     const timer = setTimeout(() => {
  //       setCurrentView('overview');
  //       setSelectedFeedback(null);
  //     }, 10000);
  //     setInactivityTimer(timer);
  //     return () => clearTimeout(timer);
  //   }
  // }, [currentView]);

  // Reset inactivity timer on user interaction — DISABLED
  const resetInactivityTimer = () => {
    // if (inactivityTimer) clearTimeout(inactivityTimer);
    // if (currentView !== 'overview') {
    //   const timer = setTimeout(() => {
    //     setCurrentView('overview');
    //     setSelectedFeedback(null);
    //   }, 10000);
    //   setInactivityTimer(timer);
    // }
  };

  // Initial data load
  useEffect(() => {
    if (!venueId || venueLoading) return;
    const load = async () => {
      await loadZones(venueId);
      await loadTables(venueId);
      await fetchFeedback(venueId);
      await fetchAssistanceRequests(venueId);
    };
    load();
  }, [venueId, venueLoading]);

  // Real-time feedback and assistance updates
  useEffect(() => {
    if (!venueId) return;

    const channel = supabase
      .channel('kiosk_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback', filter: `venue_id=eq.${venueId}` },
        () => fetchFeedback(venueId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assistance_requests', filter: `venue_id=eq.${venueId}` },
        () => fetchAssistanceRequests(venueId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  // Data loading
  const loadZones = async (venueId) => {
    const { data } = await supabase
      .from('zones')
      .select('*')
      .eq('venue_id', venueId)
      .order('order');
    setZones(data || []);
  };

  const loadTables = async (venueId) => {
    const { data } = await supabase
      .from('table_positions')
      .select('*')
      .eq('venue_id', venueId);
    if (!data) return;

    // Keep whatever coords exist; KioskFloorPlan will use x_percent/y_percent
    // against a fixed world, or fallback to x_px/y_px.
    setTables(data);
  };

  const fetchFeedback = async (venueId) => {
    const now = dayjs();
    const cutoff = now.subtract(2, 'hour').toISOString();

    const { data, error } = await supabase
      .from('feedback')
      .select('*, questions(question)')
      .eq('venue_id', venueId)
      .eq('is_actioned', false) // Only show unresolved feedback
      .gt('created_at', cutoff)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return;
    }

    const sessionMap = {};
    const latestSession = {};
    const ratings = {};
    const feedbackItems = [];

    for (const entry of data || []) {
      const table = entry.table_number;
      if (!table) continue;

      // Sidebar list shows raw rows; KioskFeedbackList groups per session
      feedbackItems.push(entry);

      // Build latest session per table for the map (only track most recent session per table)
      if (!latestSession[table] || new Date(entry.created_at) > new Date(latestSession[table])) {
        latestSession[table] = entry.created_at;
        sessionMap[table] = [entry];
      } else if (entry.session_id === sessionMap[table][0]?.session_id) {
        // Add to current latest session if same session_id
        sessionMap[table].push(entry);
      }
    }

    // Average rating per table (visual indicator on floorplan)
    for (const table in sessionMap) {
      const valid = sessionMap[table].filter((e) => e.rating !== null && e.rating !== undefined);
      ratings[table] =
        valid.length > 0 ? valid.reduce((a, b) => a + Number(b.rating || 0), 0) / valid.length : null;
    }

    setFeedbackMap(ratings);
    setFeedbackList(feedbackItems);
  };

  const fetchAssistanceRequests = async (venueId) => {
    const now = dayjs();
    const cutoff = now.subtract(2, 'hour').toISOString();

    const { data } = await supabase
      .from('assistance_requests')
      .select('*')
      .eq('venue_id', venueId)
      .in('status', ['pending', 'acknowledged']) // Only show unresolved requests
      .gt('created_at', cutoff)
      .order('created_at', { ascending: false });

    setAssistanceRequests(data || []);
  };

  // Mark feedback as resolved
  const handleMarkResolved = async (sessionIds, staffMember) => {
    try {
      // Update all feedback items for the given session IDs
      const { error } = await supabase
        .from('feedback')
        .update({
          is_actioned: true,
          resolved_by: staffMember,
          resolved_at: new Date().toISOString()
        })
        .in('session_id', sessionIds);

      if (error) {
        console.error('Error marking feedback as resolved:', error);
        throw error;
      }

      // Refresh feedback data
      await fetchFeedback(venueId);
      
      // Clear selected feedback if it was resolved
      if (selectedFeedback && sessionIds.includes(selectedFeedback.session_id)) {
        setSelectedFeedback(null);
      }

      return true;
    } catch (error) {
      console.error('Failed to resolve feedback:', error);
      throw error;
    }
  };

  // Handle assistance request actions
  const handleAssistanceAction = async (requestId, action) => {
    try {
      const updates = {
        [`${action}_at`]: new Date().toISOString(),
        status: action === 'acknowledge' ? 'acknowledged' : 'resolved'
      };

      const { error } = await supabase
        .from('assistance_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating assistance request:', error);
        throw error;
      }

      // Refresh assistance requests
      await fetchAssistanceRequests(venueId);
      return true;
    } catch (error) {
      console.error('Failed to update assistance request:', error);
      throw error;
    }
  };

  // Event handlers
  const handleZoneSelect = (zoneId) => {
    setCurrentView(zoneId);
    resetInactivityTimer(); // no-op while disabled
  };

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);

    const table = tables.find((t) => t.table_number === feedback.table_number);
    if (table && table.zone_id) {
      setCurrentView(table.zone_id);
    }
    resetInactivityTimer(); // no-op while disabled
  };

  const handleTableClick = (tableNumber) => {
    const tableFeedback = feedbackList.filter((f) => f.table_number === tableNumber);
    if (tableFeedback.length > 0) {
      setSelectedFeedback(tableFeedback[0]); // most recent
    }
    resetInactivityTimer(); // no-op while disabled
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedFeedback(null);
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  const handleExitKiosk = () => {
    if (window.confirm('Exit kiosk mode?')) {
      window.close();
    }
  };

  // Loading state
  if (venueLoading || !venueId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kiosk mode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden" onClick={resetInactivityTimer}>
      {/* Left Sidebar - Feedback List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Staff View</h1>
              <p className="text-sm text-gray-600">{venueName}</p>
            </div>
            <button
              onClick={handleExitKiosk}
              className="text-gray-400 hover:text-gray-600 text-xl"
              title="Exit Kiosk Mode"
            >
              ×
            </button>
          </div>
        </div>

        {/* Assistance Requests */}
        <KioskAssistanceList
          assistanceRequests={assistanceRequests}
          onAssistanceAction={handleAssistanceAction}
        />

        {/* Feedback List */}
        <KioskFeedbackList
          feedbackList={feedbackList}
          selectedFeedback={selectedFeedback}
          onFeedbackClick={handleFeedbackClick}
          onMarkResolved={handleMarkResolved}
          venueId={venueId}
        />
      </div>

      {/* Right Side - Floor Plan */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Zone Navigation */}
        {currentView !== 'overview' && (
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToOverview}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Overview
              </button>
              {/* <div className="text-sm text-gray-600">Auto-return in 10s</div> */}
            </div>
          </div>
        )}

        {/* Floor Plan Area */}
        <div className="flex-1 p-6">
          {currentView === 'overview' ? (
            <KioskZoneOverview
              zones={zones}
              tables={tables}
              feedbackMap={feedbackMap}
              feedbackList={feedbackList}
              onZoneSelect={handleZoneSelect}
            />
          ) : (
            <KioskFloorPlan
              tables={tables}
              selectedZoneId={currentView}
              feedbackMap={feedbackMap}
              selectedFeedback={selectedFeedback}
              onTableClick={handleTableClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskPage;