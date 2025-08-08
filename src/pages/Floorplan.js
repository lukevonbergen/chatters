import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import { v4 as uuidv4 } from 'uuid';
import usePageTitle from '../hooks/usePageTitle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useVenue } from '../context/VenueContext';

// Import new components
import FloorPlanCanvas from './components/floorplan/FloorPlanCanvas';
import ZoneSelector from './components/floorplan/ZoneSelector';
import EditControls from './components/floorplan/EditControls';
import MobileNotice from './components/floorplan/MobileNotice';

dayjs.extend(relativeTime);

const Floorplan = () => {
  usePageTitle('Floor Plan');
  const { venueId } = useVenue();
  const layoutRef = useRef(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // State
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [tables, setTables] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [feedbackModalData, setFeedbackModalData] = useState([]);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Less than lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Main data loading effect
  useEffect(() => {
    if (!venueId || isMobile) return;

    const load = async () => {
      await loadZones(venueId);
      await loadTables(venueId);
      await fetchFeedback(venueId);
      await loadStaff(venueId);
    };

    load();
  }, [venueId, isMobile]);

  // Re-sync feedback when drawer closes
  useEffect(() => {
    if (!selectedTable && venueId && !isMobile) {
      fetchFeedback(venueId);
    }
  }, [selectedTable, venueId, isMobile]);

  // Real-time feedback updates
  useEffect(() => {
    if (!venueId || isMobile) return;

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
  }, [venueId, isMobile]);

  // Data loading functions
  const loadZones = async (venueId) => {
    const { data } = await supabase.from('zones').select('*').eq('venue_id', venueId).order('order');
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
      .gt('created_at', cutoff)
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

  const loadStaff = async (venueId) => {
    try {
      // Get staff members (these are users who can log in - managers, etc.)
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, first_name, last_name, role')
        .eq('venue_id', venueId);

      // Get employees (these are employee records)
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role')
        .eq('venue_id', venueId);

      if (staffError) {
        console.error('Error fetching staff:', staffError);
      }

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
      }

      // Combine both arrays and add a source indicator
      const combinedStaffList = [
        ...(staffData || []).map(person => ({
          ...person,
          source: 'staff',
          display_name: `${person.first_name} ${person.last_name}`,
          role_display: person.role || 'Staff Member'
        })),
        ...(employeesData || []).map(person => ({
          ...person,
          source: 'employee',
          display_name: `${person.first_name} ${person.last_name}`,
          role_display: person.role || 'Employee'
        }))
      ].sort((a, b) => a.display_name.localeCompare(b.display_name)); // Sort alphabetically

      console.log('Combined staff list:', combinedStaffList);
      setStaffList(combinedStaffList);
    } catch (error) {
      console.error('Error in loadStaff:', error);
      setStaffList([]);
    }
  };

  // Event handlers
  const handleToggleEdit = () => {
    if (editMode && hasUnsavedChanges && !window.confirm('You have unsaved changes. Exit anyway?')) return;
    setEditMode(!editMode);
    setHasUnsavedChanges(false);
  };

  const handleAddTable = (tableNumber, shape) => {
    const { width, height } = layoutRef.current.getBoundingClientRect();
    setTables(prev => [...prev, {
      id: `temp-${Date.now()}`,
      table_number: tableNumber,
      x_px: Math.round(width / 2),
      y_px: Math.round(height / 2),
      shape: shape,
      venue_id: venueId,
      zone_id: selectedZoneId
    }]);
    setHasUnsavedChanges(true);
  };

  const handleTableDrag = (tableId, x, y) => {
    setTables(prev =>
      prev.map(tab =>
        tab.id === tableId ? { ...tab, x_px: x, y_px: y } : tab
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleRemoveTable = async (id) => {
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

  const handleSaveLayout = async () => {
    if (!venueId || !layoutRef.current) return;
    setSaving(true);

    const { width, height } = layoutRef.current.getBoundingClientRect();

    const payload = tables.map(t => ({
      id: t.id.startsWith('temp-') ? uuidv4() : t.id,
      venue_id: t.venue_id,
      table_number: t.table_number,
      x_percent: (t.x_px / width) * 100,
      y_percent: (t.y_px / height) * 100,
      shape: t.shape,
      zone_id: t.zone_id ?? null
    }));

    const { data: existing } = await supabase
      .from('table_positions')
      .select('id')
      .eq('venue_id', venueId);

    const existingIds = new Set((existing || []).map(t => t.id));
    const currentIds = new Set(
      payload
        .filter(t => !t.id.startsWith('temp-'))
        .map(t => t.id)
    );

    const idsToDelete = [...existingIds].filter(id => !currentIds.has(id));

    if (idsToDelete.length > 0) {
      await supabase
        .from('table_positions')
        .delete()
        .in('id', idsToDelete);
    }

    const { error } = await supabase
      .from('table_positions')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Save layout failed:', error);
      alert('Error saving layout. Check console for details.');
    } else {
      setEditMode(false);
      setHasUnsavedChanges(false);
      await loadTables(venueId); // Reload to get proper IDs
    }

    setSaving(false);
  };

  const handleClearAllTables = async () => {
    if (!venueId) return;
    await supabase.from('table_positions').delete().eq('venue_id', venueId);
    setTables([]);
    setHasUnsavedChanges(false);
  };

  // Zone handlers
  const handleZoneSelect = (zoneId) => {
    setSelectedZoneId(zoneId);
  };

  const handleZoneRename = async (zoneId, newName) => {
    await supabase.from('zones').update({ name: newName }).eq('id', zoneId);
    setZones(prev => prev.map(zone => zone.id === zoneId ? { ...zone, name: newName } : zone));
  };

  const handleZoneDelete = async (zoneId) => {
    const count = tables.filter(t => t.zone_id === zoneId).length;
    if (count > 0 && !window.confirm(`This zone contains ${count} table(s). Deleting the zone will remove them. Proceed?`)) return;
    
    await supabase.from('table_positions').delete().eq('zone_id', zoneId);
    await supabase.from('zones').delete().eq('id', zoneId);
    await loadZones(venueId);
    await loadTables(venueId);
  };

  const handleCreateZone = async () => {
    const { data } = await supabase
      .from('zones')
      .insert({ name: 'New Zone', venue_id: venueId, order: zones.length + 1 })
      .select('*')
      .single();
    
    if (data) {
      await loadZones(venueId);
      setSelectedZoneId(data.id);
    }
  };

  // Feedback handlers
  const handleTableClick = async (tableNumber) => {
    const now = dayjs();
    const cutoff = now.subtract(2, 'hour').toISOString();

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

    setFeedbackModalData([]);
    setSelectedTable(null);
  };

  // Feedback Drawer Component
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

    // Get the selected staff member details for display
    const selectedStaffMember = staffList.find(staff => staff.id === selectedStaffId);

    return (
      <div className="fixed inset-0 z-40 bg-black/50" onClick={handleBackdropClick}>
        <div
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Feedback for Table {selectedTable}
              </h3>
              <button 
                onClick={() => setSelectedTable(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <label htmlFor="staff-selector" className="block text-sm font-medium text-gray-700 mb-2">
                Resolved by
              </label>
              <select
                id="staff-selector"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <option value="">Select Team Member</option>
                
                {/* Group staff members if we have both staff and employees */}
                {staffList.some(person => person.source === 'staff') && (
                  <optgroup label="Managers & Staff">
                    {staffList
                      .filter(person => person.source === 'staff')
                      .map(staff => (
                        <option key={`staff-${staff.id}`} value={staff.id}>
                          {staff.display_name} ({staff.role_display})
                        </option>
                      ))
                    }
                  </optgroup>
                )}
                
                {staffList.some(person => person.source === 'employee') && (
                  <optgroup label="Employees">
                    {staffList
                      .filter(person => person.source === 'employee')
                      .map(employee => (
                        <option key={`employee-${employee.id}`} value={employee.id}>
                          {employee.display_name} ({employee.role_display})
                        </option>
                      ))
                    }
                  </optgroup>
                )}
                
                {/* If no grouping needed, show all together */}
                {!staffList.some(person => person.source === 'staff') || 
                 !staffList.some(person => person.source === 'employee') ? (
                  staffList.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.display_name} ({person.role_display})
                    </option>
                  ))
                ) : null}
              </select>
              
              {/* Show selected staff member info */}
              {selectedStaffMember && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {selectedStaffMember.display_name} - {selectedStaffMember.role_display}
                  {selectedStaffMember.source === 'employee' && (
                    <span className="ml-1 text-blue-600">(Employee)</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              {feedbackModalData.map(f => (
                <div key={f.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-2">
                    {dayjs(f.created_at).fromNow()}
                  </div>

                  {f.questions?.question && (
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {f.questions.question}
                    </div>
                  )}

                  {f.rating !== null && f.rating !== undefined && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Rating: </span>
                      <span className={`font-semibold ${
                        f.rating <= 2 ? 'text-red-600' : 
                        f.rating <= 3 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {f.rating}/5
                      </span>
                    </div>
                  )}

                  {f.additional_feedback && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Additional Feedback:</p>
                      <p className="text-sm text-gray-600 italic">"{f.additional_feedback}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={markAllResolved}
              disabled={!selectedStaffId}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                selectedStaffId 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedStaffMember ? (
                `Mark Resolved by ${selectedStaffMember.display_name}`
              ) : (
                'Select Team Member to Resolve'
              )}
            </button>

            {/* Summary info */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              {unresolvedCount} unresolved feedback item{unresolvedCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show mobile notice on small screens
  if (isMobile) {
    return <MobileNotice />;
  }

  return (
    <PageContainer>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Floor Plan</h1>
        <p className="text-gray-600 text-sm lg:text-base">Organize table layout and manage real-time feedback alerts.</p>
      </div>
      
      <EditControls
        editMode={editMode}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        tables={tables}
        onToggleEdit={handleToggleEdit}
        onAddTable={handleAddTable}
        onSaveLayout={handleSaveLayout}
        onClearAllTables={handleClearAllTables}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ZoneSelector
          zones={zones}
          selectedZoneId={selectedZoneId}
          editMode={editMode}
          onZoneSelect={handleZoneSelect}
          onZoneRename={handleZoneRename}
          onZoneDelete={handleZoneDelete}
          onCreateZone={handleCreateZone}
        />

        <FloorPlanCanvas
          ref={layoutRef}
          tables={tables}
          selectedZoneId={selectedZoneId}
          editMode={editMode}
          feedbackMap={feedbackMap}
          onTableDrag={handleTableDrag}
          onTableClick={handleTableClick}
          onRemoveTable={handleRemoveTable}
        />
      </div>

      {selectedTable && <FeedbackDrawer />}
    </PageContainer>
  );
};

export default Floorplan;