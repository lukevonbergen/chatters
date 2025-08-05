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
    
    if (tables.find(t => t.table_number === number)) {
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
    <div className="mb-6">
      {/* Edit Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Floor Plan Manager</h2>
          <p className="text-sm text-gray-600">
            {editMode ? 'Drag tables to reposition them' : 'Click tables to view customer feedback'}
          </p>
        </div>
        
        <button
          onClick={onToggleEdit}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            editMode
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {editMode ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit Edit Mode
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Layout
            </span>
          )}
        </button>
      </div>

      {/* Edit Mode Controls */}
      {editMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {/* Add Table Section */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Table</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Table number (e.g. 15)"
                  value={newTableNumber}
                  onChange={handleTableNumberChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={newTableShape}
                onChange={(e) => setNewTableShape(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="long">Rectangle</option>
              </select>
              
              <button
                onClick={handleAddTable}
                disabled={!newTableNumber.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Table
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-blue-200">
            <button
              onClick={onSaveLayout}
              disabled={saving || !hasUnsavedChanges}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Layout
                </>
              )}
            </button>

            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 font-medium">
                You have unsaved changes
              </span>
            )}

            <div className="flex-1" />

            {tables.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All ({tables.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditControls;