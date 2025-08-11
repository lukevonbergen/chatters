import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Import kiosk-specific components
import KioskFloorPlan from './components/kiosk/KioskFloorPlan';
import KioskFeedbackList from './components/kiosk/KioskFeedbackList';
import KioskZoneOverview from './components/kiosk/KioskZoneOverview';

dayjs.extend(relativeTime);

const KioskPage = () => {
  const { venueId, venueName, loading: venueLoading } = useVenue();
  const layoutRef = useRef(null);

  // State
  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or zone id
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Auto-return to overview after 10 seconds of inactivity
  useEffect(() => {
    if (currentView !== 'overview') {
      const timer = setTimeout(() => {
        setCurrentView('overview');
        setSelectedFeedback(null);
      }, 10000);
      setInactivityTimer(timer);
      
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (currentView !== 'overview') {
      const timer = setTimeout(() => {
        setCurrentView('overview');
        setSelectedFeedback(null);
      }, 10000);
      setInactivityTimer(timer);
    }
  };

  // Main data loading effect
  useEffect(() => {
    if (!venueId || venueLoading) return;

    const load = async () => {
      await loadZones(venueId);
      await loadTables(venueId);
      await fetchFeedback(venueId);
    };

    load();
  }, [venueId, venueLoading]);

  // Real-time feedback updates
  useEffect(() => {
    if (!venueId) return;

    const channel = supabase
      .channel('kiosk_feedback_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback',
          filter: `venue_id=eq.${venueId}`,
        },
        () => {
          fetchFeedback(venueId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  // Data loading functions (simplified from main Floorplan)
  const loadZones = async (venueId) => {
    const { data } = await supabase.from('zones').select('*').eq('venue_id', venueId).order('order');
    setZones(data || []);
  };

  const loadTables = async (venueId) => {
    const { data } = await supabase.from('table_positions').select('*').eq('venue_id', venueId);
    if (!data) return;
    
    // Set tables with percentage positions first, then convert to pixels after layout is ready
    setTables(data.map(t => ({
      ...t,
      x_px: 0, // Will be calculated later
      y_px: 0  // Will be calculated later
    })));
  };

  // Convert percentage positions to pixels after layout ref is available
  useEffect(() => {
    if (!layoutRef.current || tables.length === 0) return;
    
    const container = layoutRef.current;
    const { width, height } = container.getBoundingClientRect();
    
    // Only update if we don't have pixel positions yet
    const needsUpdate = tables.some(t => t.x_px === 0 && t.y_px === 0 && (t.x_percent || t.y_percent));
    
    if (needsUpdate) {
      setTables(prev => prev.map(t => ({
        ...t,
        x_px: (t.x_percent / 100) * width,
        y_px: (t.y_percent / 100) * height
      })));
    }
  }, [tables, layoutRef.current]);

  const fetchFeedback = async (venueId) => {
    const now = dayjs();
    const cutoff = now.subtract(2, 'hour').toISOString();

    const { data } = await supabase
      .from('feedback')
      .select('*, questions(question)')
      .eq('venue_id', venueId)
      .eq('is_actioned', false) // Only show unresolved feedback
      .gt('created_at', cutoff)
      .order('created_at', { ascending: false });

    const sessionMap = {}, latestSession = {}, ratings = {};
    const feedbackItems = [];

    for (const entry of data || []) {
      const table = entry.table_number;
      if (!table) continue;
      
      // Add to feedback list for left sidebar
      feedbackItems.push(entry);
      
      // Calculate average rating per table (existing logic)
      if (!latestSession[table]) {
        latestSession[table] = entry.session_id;
        sessionMap[table] = [entry];
      } else if (entry.session_id === latestSession[table]) {
        sessionMap[table].push(entry);
      }
    }

    // Calculate ratings for visual indicators
    for (const table in sessionMap) {
      const valid = sessionMap[table].filter(e => e.rating !== null);
      ratings[table] = valid.length > 0 ? valid.reduce((a, b) => a + b.rating, 0) / valid.length : null;
    }

    setFeedbackMap(ratings);
    setFeedbackList(feedbackItems);
  };

  // Event handlers
  const handleZoneSelect = (zoneId) => {
    setCurrentView(zoneId);
    resetInactivityTimer();
  };

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);
    
    // Find the zone for this table
    const table = tables.find(t => t.table_number === feedback.table_number);
    if (table && table.zone_id) {
      setCurrentView(table.zone_id);
    }
    
    resetInactivityTimer();
  };

  const handleTableClick = (tableNumber) => {
    // Highlight the table and show its feedback
    const tableFeedback = feedbackList.filter(f => f.table_number === tableNumber);
    if (tableFeedback.length > 0) {
      setSelectedFeedback(tableFeedback[0]); // Show the most recent
    }
    resetInactivityTimer();
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedFeedback(null);
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  // Exit kiosk mode
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

        {/* Feedback List */}
        <KioskFeedbackList
          feedbackList={feedbackList}
          selectedFeedback={selectedFeedback}
          onFeedbackClick={handleFeedbackClick}
        />
      </div>

      {/* Right Side - Floor Plan */}
      <div className="flex-1 flex flex-col">
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
              <div className="text-sm text-gray-600">
                Auto-return in 10s
              </div>
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
              ref={layoutRef}
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