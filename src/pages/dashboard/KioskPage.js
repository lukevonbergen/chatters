import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useVenue } from '../../context/VenueContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Kiosk components
import KioskFloorPlan from '../../components/dashboard/kiosk/KioskFloorPlan';
import KioskFeedbackList from '../../components/dashboard/kiosk/KioskFeedbackList';
import KioskZoneOverview from '../../components/dashboard/kiosk/KioskZoneOverview';
import KioskAssistanceList from '../../components/dashboard/kiosk/KioskAssistanceList';

dayjs.extend(relativeTime);

const KioskPage = () => {
  const { venueId, venueName, loading: venueLoading } = useVenue();

  // State
  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [assistanceMap, setAssistanceMap] = useState({});
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or zone id
  const [inactivityTimer, setInactivityTimer] = useState(null); // kept for easy re-enable
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('assistance'); // 'assistance' or 'feedback'

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

    console.log('Setting up real-time subscription for venue:', venueId);

    const channel = supabase
      .channel(`kiosk_updates_${venueId}`) // More specific channel name
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'feedback', 
          filter: `venue_id=eq.${venueId}` 
        },
        (payload) => {
          console.log('🔥 REAL-TIME: New feedback detected:', payload);
          console.log('Payload details:', JSON.stringify(payload, null, 2));
          fetchFeedback(venueId);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'feedback', 
          filter: `venue_id=eq.${venueId}` 
        },
        (payload) => {
          console.log('🔥 REAL-TIME: Feedback updated:', payload);
          console.log('Update payload details:', JSON.stringify(payload, null, 2));
          fetchFeedback(venueId);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'assistance_requests', 
          filter: `venue_id=eq.${venueId}` 
        },
        (payload) => {
          console.log('🔥 REAL-TIME: New assistance request:', payload);
          console.log('Assistance payload details:', JSON.stringify(payload, null, 2));
          fetchAssistanceRequests(venueId);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'assistance_requests', 
          filter: `venue_id=eq.${venueId}` 
        },
        (payload) => {
          console.log('🔥 REAL-TIME: Assistance request updated:', payload);
          console.log('Update assistance payload:', JSON.stringify(payload, null, 2));
          fetchAssistanceRequests(venueId);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error - falling back to polling');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  // Fallback polling in case real-time doesn't work
  useEffect(() => {
    if (!venueId) return;

    const pollInterval = setInterval(() => {
      fetchFeedback(venueId);
      fetchAssistanceRequests(venueId);
    }, 30000); // Poll every 30 seconds as fallback

    return () => clearInterval(pollInterval);
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

    console.log('🔍 Fetching assistance requests for venue:', venueId);
    console.log('🕐 Current time:', now.toISOString());
    console.log('⏰ Cutoff time (2h ago):', cutoff);
    console.log('📊 Status filter:', ['pending', 'acknowledged']);

    // First, let's see ALL assistance requests for this venue (no filters)
    const { data: allData, error: allError } = await supabase
      .from('assistance_requests')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    console.log('🗂️ ALL assistance requests for venue:', allData);

    // Temporary fix: Remove staff joins to get basic functionality working
    const { data, error } = await supabase
      .from('assistance_requests')
      .select('*')
      .eq('venue_id', venueId)
      .in('status', ['pending', 'acknowledged']) // Only show unresolved requests
      .gt('created_at', cutoff)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching assistance requests:', error);
    } else {
      console.log('✅ Filtered assistance requests:', data);
      console.log(`📈 Found ${data?.length || 0} requests matching filters`);
    }

    // Build assistance map for table coloring (table_number -> status)
    const assistanceTableMap = {};
    for (const request of data || []) {
      const tableNum = request.table_number;
      if (!assistanceTableMap[tableNum] || request.status === 'pending') {
        // Prioritize pending over acknowledged
        assistanceTableMap[tableNum] = request.status;
      }
    }

    setAssistanceRequests(data || []);
    setAssistanceMap(assistanceTableMap);
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
  const handleAssistanceAction = async (requestId, action, notes = null) => {
    try {
      console.log(`Attempting to ${action} assistance request ${requestId}`);
      
      // Get current staff ID
      let currentStaffId = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const userId = session.user.id;
          const { data: staffRow, error } = await supabase
            .from('staff')
            .select('id')
            .eq('user_id', userId)
            .eq('venue_id', venueId)
            .single();

          if (!error && staffRow) {
            currentStaffId = staffRow.id;
          }
        }
      } catch (error) {
        console.error('Failed to load staff ID for action:', error);
      }
      
      const now = new Date().toISOString();
      const updates = {
        status: action === 'acknowledge' ? 'acknowledged' : 'resolved'
      };

      // Set the correct timestamp field based on action
      if (action === 'acknowledge') {
        updates.acknowledged_at = now;
        if (currentStaffId) {
          updates.acknowledged_by = currentStaffId;
        }
      } else if (action === 'resolve') {
        updates.resolved_at = now;
        if (currentStaffId) {
          updates.resolved_by = currentStaffId;
        }
        if (notes) {
          updates.notes = notes;
        }
      }

      console.log('Update payload:', updates);

      const { data, error } = await supabase
        .from('assistance_requests')
        .update(updates)
        .eq('id', requestId)
        .select(); // Add select to see what was updated

      if (error) {
        console.error('Supabase error updating assistance request:', error);
        alert(`Failed to ${action} request: ${error.message}`);
        return false;
      }

      console.log('Successfully updated assistance request:', data);

      // Refresh assistance requests
      await fetchAssistanceRequests(venueId);
      return true;
    } catch (error) {
      console.error('Failed to update assistance request:', error);
      alert(`Error: ${error.message}`);
      return false;
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
      {/* Left Sidebar - Tabbed Lists */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('assistance')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'assistance'
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Assistance</span>
                {assistanceRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {assistanceRequests.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Feedback</span>
                {feedbackList.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {feedbackList.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'assistance' && (
            <KioskAssistanceList
              assistanceRequests={assistanceRequests}
              onAssistanceAction={handleAssistanceAction}
            />
          )}
          {activeTab === 'feedback' && (
            <KioskFeedbackList
              feedbackList={feedbackList}
              selectedFeedback={selectedFeedback}
              onFeedbackClick={handleFeedbackClick}
              onMarkResolved={handleMarkResolved}
              venueId={venueId}
            />
          )}
        </div>
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
              assistanceMap={assistanceMap}
              onZoneSelect={handleZoneSelect}
            />
          ) : (
            <KioskFloorPlan
              tables={tables}
              selectedZoneId={currentView}
              feedbackMap={feedbackMap}
              selectedFeedback={selectedFeedback}
              assistanceMap={assistanceMap}
              onTableClick={handleTableClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskPage;