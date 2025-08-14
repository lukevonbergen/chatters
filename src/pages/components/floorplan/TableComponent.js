import React from 'react';

const TableComponent = ({ table, editMode, onRemoveTable }) => {
  const getShapeClasses = (shape) => {
    const base = 'text-gray-800 bg-white flex items-center justify-center font-semibold border border-gray-300 shadow-sm transition-all duration-200';
    switch (shape) {
      case 'circle':
        return `${base} w-14 h-14 rounded-full ${editMode ? 'hover:scale-105' : ''}`;
      case 'long':
        return `${base} w-28 h-10 rounded-lg text-sm ${editMode ? 'hover:scale-105' : ''}`;
      default:
        return `${base} w-14 h-14 rounded-lg ${editMode ? 'hover:scale-105' : ''}`;
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveTable?.(table.id);
  };

  return (
    <div className="relative group select-none">
      <div
        className={`${getShapeClasses(table.shape)} ${editMode ? 'cursor-move' : 'cursor-default'}`}
        title={`Table ${table.table_number}`}
      >
        {table.table_number}
      </div>

      {editMode && (
        <button
          onClick={handleRemoveClick}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
          title="Remove table"
          type="button"
        >
          ×
        </button>
      )}

      {editMode && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      )}
    </div>
  );
};

export default TableComponent;