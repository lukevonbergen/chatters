import React from 'react';

const TableComponent = ({ table, editMode, feedbackMap, onTableClick, onRemoveTable }) => {
  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  const getTableShapeClasses = (shape) => {
    const baseClasses = 'text-white flex items-center justify-center font-bold border-2 border-gray-800 shadow-lg transition-all duration-200';
    
    switch (shape) {
      case 'circle':
        return `${baseClasses} w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600`;
      case 'long':
        return `${baseClasses} w-28 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm`;
      default: // square
        return `${baseClasses} w-14 h-14 rounded-lg bg-gray-700 hover:bg-gray-600`;
    }
  };

  const avgRating = feedbackMap[table.table_number];
  const feedbackColor = getFeedbackColor(avgRating);
  const tableShapeClasses = getTableShapeClasses(table.shape);

  const handleTableClick = () => {
    if (!editMode) {
      onTableClick(table.table_number);
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveTable(table.id);
  };

  return (
    <div className="relative group">
      <div
        className={`${tableShapeClasses} ${!editMode ? 'cursor-pointer' : ''} ${editMode ? 'hover:scale-105' : ''}`}
        onClick={handleTableClick}
        title={editMode ? `Table ${table.table_number}` : `View feedback for Table ${table.table_number}`}
      >
        {table.table_number}
      </div>
      
      {/* Feedback indicator */}
      {!editMode && (
        <div
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${feedbackColor} ${
            feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''
          } shadow-sm`}
          title={avgRating == null ? 'No recent feedback' : `Average rating: ${avgRating.toFixed(1)}/5`}
        />
      )}
      
      {/* Remove button in edit mode */}
      {editMode && (
        <button
          onClick={handleRemoveClick}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
          title="Remove table"
        >
          ×
        </button>
      )}
      
      {/* Edit mode visual indicator */}
      {editMode && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      )}
    </div>
  );
};

export default TableComponent;