import React, { useState } from 'react';

const ZoneSelector = ({ 
  zones, 
  selectedZoneId, 
  editMode, 
  onZoneSelect, 
  onZoneRename, 
  onZoneDelete, 
  onCreateZone 
}) => {
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleRenameStart = (zone) => {
    setEditingZoneId(zone.id);
    setEditingName(zone.name);
  };

  const handleRenameSubmit = (zoneId) => {
    if (editingName.trim()) {
      onZoneRename(zoneId, editingName.trim());
    }
    setEditingZoneId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingZoneId(null);
    setEditingName('');
  };

  const handleKeyPress = (e, zoneId) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(zoneId);
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Zones</h3>
        {editMode && (
          <button
            onClick={onCreateZone}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Zone
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {zones.map(zone => (
          <div key={zone.id} className="flex items-center group">
            {editMode && editingZoneId === zone.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameSubmit(zone.id)}
                onKeyDown={(e) => handleKeyPress(e, zone.id)}
                autoFocus
                className="px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                style={{ width: `${Math.max(editingName.length, 8)}ch` }}
              />
            ) : (
              <button
                onClick={() => onZoneSelect(zone.id)}
                onDoubleClick={() => editMode && handleRenameStart(zone)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedZoneId === zone.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                title={editMode ? 'Double-click to rename' : `Switch to ${zone.name}`}
              >
                {zone.name}
              </button>
            )}
            
            {editMode && editingZoneId !== zone.id && (
              <button
                onClick={() => onZoneDelete(zone.id)}
                className="ml-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                title="Delete zone"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      
      {zones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No zones created yet</p>
          {editMode && (
            <button
              onClick={onCreateZone}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create your first zone
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoneSelector;