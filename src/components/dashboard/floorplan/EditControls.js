import React, { useState } from 'react';

const EditControls = ({ 
  editMode, 
  hasUnsavedChanges,
  saving,
  onToggleEdit, 
  onAddTable, 
  onSaveLayout, 
  onClearAllTables,
  tables 
}) => {
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableShape, setNewTableShape] = useState('square');

  const handleTableNumberChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNewTableNumber(value);
  };

  const handleAddTable = () => {
    const number = newTableNumber.trim();
    if (!number) {
      alert('Please enter a table number');
      return;
    }
    
    if (tables.find(t => String(t.table_number) === number)) {
      alert('Table number already exists. Please choose a different number.');
      return;
    }

    onAddTable(number, newTableShape);
    setNewTableNumber('');
    setNewTableShape('square');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTable();
    }
  };

  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to delete all ${tables.length} tables? This action cannot be undone.`)) {
      onClearAllTables();
    }
  };

  return (
    <div className="mb-4">
      {/* Edit Mode Controls - Compact Version */}
      {editMode ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Add Table Controls */}
            <input
              type="text"
              placeholder="Table #"
              value={newTableNumber}
              onChange={handleTableNumberChange}
              onKeyPress={handleKeyPress}
              className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={newTableShape}
              onChange={(e) => setNewTableShape(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="long">Rectangle</option>
            </select>
            
            <button
              onClick={handleAddTable}
              disabled={!newTableNumber.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              + Add
            </button>

            <div className="h-6 w-px bg-blue-200" />

            {/* Save Button */}
            <button
              onClick={onSaveLayout}
              disabled={saving || !hasUnsavedChanges}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>

            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 font-medium">
                Unsaved changes
              </span>
            )}

            {/* Right side buttons */}
            <div className="flex-1" />
            
            {tables.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            )}

            <button
              onClick={onToggleEdit}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Exit Edit
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            View mode - Click edit to modify the layout
          </p>
          <button
            onClick={onToggleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Edit Layout
          </button>
        </div>
      )}
    </div>
  );
};

export default EditControls;