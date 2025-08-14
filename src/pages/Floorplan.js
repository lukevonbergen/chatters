import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import { v4 as uuidv4 } from 'uuid';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

// Components
import FloorPlanCanvas from './components/floorplan/FloorPlanCanvas';
import ZoneSelector from './components/floorplan/ZoneSelector';
import EditControls from './components/floorplan/EditControls';
import MobileNotice from './components/floorplan/MobileNotice';

const Floorplan = () => {
  usePageTitle('Floor Plan');
  const { venueId } = useVenue();
  const layoutRef = useRef(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Designer state
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [tables, setTables] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false); // default to view mode
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    };

    load();
  }, [venueId, isMobile]);

  // Data loading functions
  const loadZones = async (venueId) => {
    const { data } = await supabase
      .from('zones')
      .select('*')
      .eq('venue_id', venueId)
      .order('order');
    setZones(data || []);
    if (data && data.length > 0) setSelectedZoneId(data[0].id);
  };

  const loadTables = async (venueId) => {
    const { data } = await supabase
      .from('table_positions')
      .select('*')
      .eq('venue_id', venueId);

    const container = layoutRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();

    setTables(
      (data || []).map((t) => ({
        ...t,
        x_px: (t.x_percent / 100) * width,
        y_px: (t.y_percent / 100) * height,
      }))
    );
  };

  // Event handlers
  const handleToggleEdit = () => {
    if (editMode && hasUnsavedChanges && !window.confirm('You have unsaved changes. Exit anyway?')) return;
    setEditMode(!editMode);
    setHasUnsavedChanges(false);
  };

  const handleAddTable = (tableNumber, shape) => {
    const container = layoutRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    setTables((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        table_number: tableNumber,
        x_px: Math.round(width / 2),
        y_px: Math.round(height / 2),
        shape,
        venue_id: venueId,
        zone_id: selectedZoneId,
      },
    ]);
    setHasUnsavedChanges(true);
  };

  const handleTableDrag = (tableId, x, y) => {
    setTables((prev) => prev.map((tab) => (tab.id === tableId ? { ...tab, x_px: x, y_px: y } : tab)));
    setHasUnsavedChanges(true);
  };

  const handleRemoveTable = async (id) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    setTables((prev) => prev.filter((t) => t.id !== id));

    const isTemp = id.startsWith('temp-');
    if (!isTemp) {
      await supabase.from('table_positions').delete().match({
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

    const payload = tables.map((t) => ({
      id: t.id.startsWith('temp-') ? uuidv4() : t.id,
      venue_id: t.venue_id,
      table_number: t.table_number,
      x_percent: (t.x_px / width) * 100,
      y_percent: (t.y_px / height) * 100,
      shape: t.shape,
      zone_id: t.zone_id ?? null,
    }));

    const { data: existing } = await supabase
      .from('table_positions')
      .select('id')
      .eq('venue_id', venueId);

    const existingIds = new Set((existing || []).map((t) => t.id));
    const currentIds = new Set(payload.filter((t) => typeof t.id === 'string' && !t.id.startsWith('temp-')).map((t) => t.id));
    const idsToDelete = [...existingIds].filter((id) => !currentIds.has(id));

    if (idsToDelete.length > 0) {
      await supabase.from('table_positions').delete().in('id', idsToDelete);
    }

    const { error } = await supabase.from('table_positions').upsert(payload, { onConflict: 'id' });

    if (error) {
      alert('Error saving layout. Check console for details.');
      console.error(error);
    } else {
      setEditMode(false); // return to view mode after saving
      setHasUnsavedChanges(false);
      await loadTables(venueId); // Reload to get persisted IDs/positions
    }

    setSaving(false);
  };

  const handleClearAllTables = async () => {
    if (!venueId) return;
    if (!window.confirm('Delete all tables in this venue?')) return;

    await supabase.from('table_positions').delete().eq('venue_id', venueId);
    setTables([]);
    setHasUnsavedChanges(false);
  };

  // Zone handlers
  const handleZoneSelect = (zoneId) => setSelectedZoneId(zoneId);

  const handleZoneRename = async (zoneId, newName) => {
    await supabase.from('zones').update({ name: newName }).eq('id', zoneId);
    setZones((prev) => prev.map((zone) => (zone.id === zoneId ? { ...zone, name: newName } : zone)));
  };

  const handleZoneDelete = async (zoneId) => {
    const count = tables.filter((t) => t.zone_id === zoneId).length;
    if (count > 0 && !window.confirm(`This zone contains ${count} table(s). Deleting the zone will remove them. Proceed?`))
      return;

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

  // Show mobile notice on small screens
  if (isMobile) {
    return <MobileNotice />;
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Floor Plan</h1>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
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
          onTableDrag={handleTableDrag}
          onRemoveTable={handleRemoveTable}
        />
      </div>
    </PageContainer>
  );
};

export default Floorplan;