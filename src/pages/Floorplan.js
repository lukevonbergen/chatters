import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';
import usePageTitle from '../hooks/usePageTitle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useVenue } from '../context/VenueContext';
dayjs.extend(relativeTime);

const GRID_SIZE = 20;

const Heatmap = () => {
  usePageTitle('Floor Plan');
  const layoutRef = useRef(null);

  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableShape, setNewTableShape] = useState('square');
  const [saving, setSaving] = useState(false);
  const [tableLimit, setTableLimit] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const [selectedTable, setSelectedTable] = useState(null);

  const [feedbackModalData, setFeedbackModalData] = useState([]);
  useEffect(() => {
  if (!selectedTable && venueId) {
    fetchFeedback(venueId); // Re-sync heatmap when drawer closes
  }
}, [selectedTable, venueId]);

  const [staffSelections, setStaffSelections] = useState({});

  const { venueId } = useVenue();

  useEffect(() => {
    if (!venueId) return;

    const load = async () => {
      const { data: venue, error } = await supabase
        .from('venues')
        .select('table_count')
        .eq('id', venueId)
        .single();

      if (error || !venue) {
        console.error('Error loading venue data:', error);
        return;
      }

      setTableLimit(venue.table_count);

      await loadZones(venueId);
      await loadTables(venueId);
      await fetchFeedback(venueId);
      await loadStaff(venueId);
    };

    load();
  }, [venueId]);

  useEffect(() => {
  if (!venueId) return;

  const channel = supabase
    .channel('feedback_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'feedback',
        filter: `venue_id=eq.${venueId}`,
      },
      (payload) => {
        console.log('Realtime feedback update:', payload);
        fetchFeedback(venueId);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [venueId]);

  const handleToggleEdit = () => {
    if (editMode && hasUnsavedChanges && !window.confirm('You have unsaved changes. Exit anyway?')) return;
    setEditMode(!editMode);
  };

  const addTable = () => {
    const number = newTableNumber.trim();
    if (!number || tables.find(t => t.table_number === number)) return alert('Table number must be unique.');
    if (tables.length >= tableLimit) return alert('Max table limit reached.');
    const { width, height } = layoutRef.current.getBoundingClientRect();
    setTables(prev => [...prev, {
      id: `temp-${Date.now()}`,
      table_number: number,
      x_px: Math.round(width / 2),
      y_px: Math.round(height / 2),
      shape: newTableShape,
      venue_id: venueId,
      zone_id: selectedZoneId
    }]);
    setNewTableNumber('');
    setHasUnsavedChanges(true);
  };

  const saveLayout = async () => {
  if (!venueId || !layoutRef.current) return;
  setSaving(true);

  const { width, height } = layoutRef.current.getBoundingClientRect();

  // Build the payload based on local state
  const payload = tables.map(t => ({
    id: t.id.startsWith('temp-') ? uuidv4() : t.id,
    venue_id: t.venue_id,
    table_number: t.table_number,
    x_percent: (t.x_px / width) * 100,
    y_percent: (t.y_px / height) * 100,
    shape: t.shape,
    zone_id: t.zone_id ?? null
  }));

  // 🔍 Get what's already in Supabase
  const { data: existing } = await supabase
    .from('table_positions')
    .select('id')
    .eq('venue_id', venueId);

  const existingIds = new Set((existing || []).map(t => t.id));
  const currentIds = new Set(
    payload
      .filter(t => !t.id.startsWith('temp-')) // exclude new ones
      .map(t => t.id)
  );

  const idsToDelete = [...existingIds].filter(id => !currentIds.has(id));

  // 🗑 Delete tables that were removed locally
  if (idsToDelete.length > 0) {
    await supabase
      .from('table_positions')
      .delete()
      .in('id', idsToDelete);
  }

  // ⬆️ Upsert all current layout
  const { error } = await supabase
    .from('table_positions')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Save layout failed:', error);
    alert('Error saving layout. Check console for details.');
  } else {
    setEditMode(false);
    setHasUnsavedChanges(false);
  }

  setSaving(false);
};


  const clearAllTables = async () => {
    if (!venueId) return;
    if (!window.confirm('Are you sure you want to delete ALL tables?')) return;
    await supabase.from('table_positions').delete().eq('venue_id', venueId);
    setTables([]);
    setHasUnsavedChanges(false);
  };

  const handleZoneRename = (id, name) => setZones(z => z.map(zone => zone.id === id ? { ...zone, name } : zone));
  const saveZoneRename = async (id) => {
    const z = zones.find(z => z.id === id);
    await supabase.from('zones').update({ name: z.name }).eq('id', id);
    setEditingZoneId(null);
  };

  const deleteZone = async (zoneId) => {
    const count = tables.filter(t => t.zone_id === zoneId).length;
    if (count > 0 && !window.confirm(`This zone contains ${count} table(s). Deleting the zone will remove them. Proceed?`)) return;
    await supabase.from('table_positions').delete().eq('zone_id', zoneId);
    await supabase.from('zones').delete().eq('id', zoneId);
    await loadZones(venueId);
    await loadTables(venueId);
  };

  const createNewZone = async () => {
    const { data } = await supabase.from('zones').insert({ name: 'New Zone', venue_id: venueId, order: zones.length + 1 }).select('*').single();
    if (data) { await loadZones(venueId); setSelectedZoneId(data.id); }
  };

  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  const removeTable = async (id) => {
    const table = tables.find(t => t.id === id);
    if (!table) return;

    setTables(prev => prev.filter(t => t.id !== id));

    const isTemp = id.startsWith('temp-');
    if (!isTemp) {
      await supabase
        .from('table_positions')
        .delete()
        .match({
          venue_id: venueId,
          table_number: table.table_number,
        });
    }

    setHasUnsavedChanges(true);
  };

  const loadZones = async (venueId) => {
    const { data } = await supabase.from('zones').select('*').eq('venue_id', venueId);
    setZones(data || []);
    if (data && data.length > 0) setSelectedZoneId(data[0].id);
  };

  const loadTables = async (venueId) => {
    const { data } = await supabase.from('table_positions').select('*').eq('venue_id', venueId);
    const container = layoutRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    setTables(
      (data || []).map(t => ({
        ...t,
        x_px: (t.x_percent / 100) * width,
        y_px: (t.y_percent / 100) * height
      }))
    );
  };

  const fetchFeedback = async (venueId) => {
  const now = dayjs();
  const cutoff = now.subtract(2, 'hour').toISOString();

  const { data } = await supabase
    .from('feedback')
    .select('*')
    .eq('venue_id', venueId)
    .gt('created_at', cutoff) // 👈 Only fetch recent feedback
    .order('created_at', { ascending: false });

  const sessionMap = {}, latestSession = {}, ratings = {};
  for (const entry of data) {
    const table = entry.table_number;
    if (!table) continue;
    if (!latestSession[table]) {
      latestSession[table] = entry.session_id;
      sessionMap[table] = [entry];
    } else if (entry.session_id === latestSession[table]) {
      sessionMap[table].push(entry);
    }
  }

  for (const table in sessionMap) {
    const valid = sessionMap[table].filter(e => e.rating !== null && !e.is_actioned);
    ratings[table] = valid.length > 0 ? valid.reduce((a, b) => a + b.rating, 0) / valid.length : null;
  }

  setFeedbackMap(ratings);
};


  const openFeedbackModal = async (tableNumber) => {
  const now = dayjs();
  const cutoff = now.subtract(2, 'hour').toISOString();

  // Get most recent session (still within last 2 hrs)
  const { data: recent } = await supabase
    .from('feedback')
    .select('session_id, created_at')
    .eq('venue_id', venueId)
    .eq('table_number', tableNumber)
    .gt('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(1);

  const latestSessionId = recent?.[0]?.session_id;
  if (!latestSessionId) return;

  // Get feedback for that session, unresolved only, joined with questions
  const { data } = await supabase
    .from('feedback')
    .select('*, questions(question)')
    .eq('venue_id', venueId)
    .eq('table_number', tableNumber)
    .eq('session_id', latestSessionId)
    .eq('is_actioned', false)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) return;

  setFeedbackModalData(data);
  setSelectedTable(tableNumber);
};

  const loadStaff = async (venueId) => {
    const { data } = await supabase.from('staff').select('id, first_name, last_name').eq('venue_id', venueId);
    setStaffList(data || []);
  };

  const markResolved = async (feedbackId) => {
  const staffId = staffSelections[feedbackId];
  if (!staffId) return alert('Please select a staff member');

  const { error } = await supabase
    .from('feedback')
    .update({
      is_actioned: true,
      resolved_at: new Date(),
      resolved_by: staffId
    })
    .eq('id', feedbackId);

  if (error) {
    console.error('Error resolving feedback:', error.message);
    return alert('Something went wrong marking as resolved.');
  }

  // Remove it from modal state
  setFeedbackModalData(prev => prev.filter(f => f.id !== feedbackId));
};


  const undoResolved = async (feedbackId) => {
    await supabase.from('feedback').update({ is_actioned: false, resolved_at: null, resolved_by: null }).eq('id', feedbackId);
    await fetchFeedback(venueId);
    setFeedbackModalData(prev => prev.map(f => f.id === feedbackId ? { ...f, is_actioned: false, resolved_by: null } : f));
  };

  const FeedbackDrawer = () => {
  const unresolvedCount = feedbackModalData.filter(f => !f.is_actioned).length;

  useEffect(() => {
    if (unresolvedCount === 0) {
      setSelectedTable(null);
    }
  }, [unresolvedCount]);

  const handleBackdropClick = () => {
    setSelectedTable(null);
  };

  const markAllResolved = async () => {
    if (!selectedStaffId) return alert('Please select a staff member');

    const errors = [];
    for (const f of feedbackModalData) {
      const { error } = await supabase
        .from('feedback')
        .update({
          is_actioned: true,
          resolved_at: new Date(),
          resolved_by: selectedStaffId
        })
        .eq('id', f.id);

      if (error) errors.push(f.id);
    }

    if (errors.length > 0) {
      alert(`Some entries failed to update: ${errors.join(', ')}`);
    }

    // Remove resolved items from state
    setFeedbackModalData([]);
    setSelectedTable(null);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={handleBackdropClick}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Feedback for Table {selectedTable}</h3>
            <button onClick={() => setSelectedTable(null)} className="text-gray-500 hover:text-black text-lg">&times;</button>
          </div>

          <div className="mb-6">
            <label htmlFor="staff-selector" className="block text-sm font-medium text-gray-700 mb-1">Resolved by</label>
            <select
              id="staff-selector"
              name="staff-selector"
              className="w-full border border-gray-300 rounded text-sm px-2 py-1"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
            >
              <option value="">Select Staff Member</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.first_name} {staff.last_name}</option>
              ))}
            </select>
          </div>

          {feedbackModalData.map(f => (
            <div key={f.id} className="border rounded-lg p-4 mb-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">
                {dayjs(f.created_at).fromNow()}
              </div>

              {/* Only show question if it exists */}
              {f.questions?.question && (
                <div className="text-sm font-medium mb-1">
                  {f.questions.question}
                </div>
              )}

              {/* Only show rating if it’s a number */}
              {f.rating !== null && f.rating !== undefined && (
                <div className="mb-2">
                  <span className="text-sm">Rating:</span>{' '}
                  <span className="font-semibold">{f.rating}</span>
                </div>
              )}

              {/* Additional Feedback */}
              {f.additional_feedback && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-800 mb-1">Additional Feedback</p>
                  <p className="italic text-gray-700 text-sm">"{f.additional_feedback}"</p>
                </div>
              )}
            </div>
          ))}


          <button
            onClick={markAllResolved}
            disabled={!selectedStaffId}
            className={`w-full text-sm px-3 py-2 rounded mt-4 ${selectedStaffId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Mark All Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Floor Plan</h1>

      <div className="bg-white border rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Manage Floor Plan</h2>
          <button onClick={handleToggleEdit} className="text-blue-600 underline text-sm">{editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}</button>
        </div>

        {editMode && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <input type="text" placeholder="Table #" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1" />
            <select value={newTableShape} onChange={(e) => setNewTableShape(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1">
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="long">Long</option>
            </select>
            <button onClick={addTable} className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900">+ Add Table</button>
            <button onClick={saveLayout} disabled={saving} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Save Layout'}</button>
            <button onClick={clearAllTables} className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50">Clear All Tables</button>
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {zones.map(zone => (
            <div key={zone.id} className="flex items-center gap-1">
              {editMode && editingZoneId === zone.id ? (
                <input
                  value={zone.name}
                  onChange={(e) => handleZoneRename(zone.id, e.target.value)}
                  onBlur={() => saveZoneRename(zone.id)}
                  autoFocus
                  className="px-2 py-1 border rounded text-sm"
                />
              ) : (
                <button
                  onClick={() => setSelectedZoneId(zone.id)}
                  onDoubleClick={() => editMode && setEditingZoneId(zone.id)}
                  className={`px-4 py-1 rounded-full text-sm border transition ${selectedZoneId === zone.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {zone.name}
                </button>
              )}
              {editMode && (
                <button
                  onClick={() => deleteZone(zone.id)}
                  className="text-red-500 text-xs"
                  title="Delete zone"
                >🗑</button>
              )}
            </div>
          ))}
          {editMode && (
            <button onClick={createNewZone} className="text-sm border border-dashed border-gray-400 text-gray-500 rounded-full px-3 py-1 hover:bg-gray-50">+ Add Zone</button>
          )}
        </div>

        <div ref={layoutRef} id="layout-area" className="relative w-full h-[600px] bg-white border rounded">
          {tables.filter(t => t.zone_id === selectedZoneId).map((t) => {
            const avgRating = feedbackMap[t.table_number];
            const feedbackColor = getFeedbackColor(avgRating);
            const tableShapeClasses = t.shape === 'circle' ? 'w-14 h-14 rounded-full bg-gray-700' : t.shape === 'long' ? 'w-28 h-10 rounded bg-gray-700' : 'w-14 h-14 rounded bg-gray-700';

            const node = (
              <div className="absolute">
                <div className="relative">
                  <div
                    className={`text-white flex items-center justify-center font-bold border-2 border-black shadow cursor-pointer ${tableShapeClasses}`}
                    onClick={() => !editMode && openFeedbackModal(t.table_number)}
                  >
                    {t.table_number}
                  </div>
                  {!editMode && (
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${feedbackColor} ${feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''}`}
                      title={avgRating == null ? 'No feedback yet' : `Avg rating: ${avgRating.toFixed(1)}`}
                    />
                  )}
                  {editMode && (
                    <button onClick={() => removeTable(t.id)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                  )}
                </div>
              </div>
            );

            return editMode ? (
              <Draggable
                key={t.id}
                position={{ x: t.x_px, y: t.y_px }}
                bounds="parent"
                onStop={(e, data) => {
                  const x = Math.round(data.x / GRID_SIZE) * GRID_SIZE;
                  const y = Math.round(data.y / GRID_SIZE) * GRID_SIZE;
                  setTables(prev =>
                    prev.map(tab =>
                      tab.id === t.id ? { ...tab, x_px: x, y_px: y } : tab
                    )
                  );
                  setHasUnsavedChanges(true);
                }}
              >
                {node}
              </Draggable>
            ) : (
              <div key={t.id} className="absolute" style={{ left: t.x_px, top: t.y_px }}>
                {node}
              </div>
            );
          })}
        </div>
      </div>

      {selectedTable && <FeedbackDrawer />}
    </PageContainer>
  );
};

export default Heatmap;