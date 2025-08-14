// File: components/floorplan/TableComponent.jsx
import React, { useState, useEffect, useRef } from 'react';

const TableComponent = ({ table, editMode, onRemoveTable, onTableResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef(null);

  const handleMouseDown = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = table.width || 56;
    const startHeight = table.height || 56;

    const handleMouseMove = (e) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) {
        newWidth = Math.max(40, startWidth + (e.clientX - startX));
      }
      if (direction.includes('left')) {
        newWidth = Math.max(40, startWidth - (e.clientX - startX));
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(40, startHeight + (e.clientY - startY));
      }
      if (direction.includes('top')) {
        newHeight = Math.max(40, startHeight - (e.clientY - startY));
      }

      // Round to grid
      newWidth = Math.round(newWidth / 10) * 10;
      newHeight = Math.round(newHeight / 10) * 10;

      // Immediately update parent state
      if (onTableResize) {
        onTableResize(table.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCircleResize = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = table.width || 56;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const delta = Math.max(deltaX, deltaY);
      
      const newSize = Math.max(40, Math.round((startSize + delta) / 10) * 10);
      
      // Immediately update parent state
      if (onTableResize) {
        onTableResize(table.id, newSize, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveTable?.(table.id);
  };

  const getShapeClasses = () => {
    const base = 'text-gray-800 bg-white flex items-center justify-center font-semibold border border-gray-300 shadow-sm transition-all duration-200';
    const isCircle = table.shape === 'circle';
    return `${base} ${isCircle ? 'rounded-full' : 'rounded-lg'} ${editMode && !isResizing ? 'hover:scale-105' : ''}`;
  };

  // Use the dimensions from the table prop directly
  const currentWidth = table.width || 56;
  const currentHeight = table.height || 56;

  return (
    <div 
      className="relative group select-none"
      style={{ width: currentWidth, height: currentHeight }}
    >
      <div
        className={getShapeClasses()}
        style={{ width: '100%', height: '100%' }}
        title={`Table ${table.table_number}`}
      >
        {table.table_number}
      </div>

      {editMode && (
        <>
          {/* Remove button */}
          <button
            onClick={handleRemoveClick}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 z-10"
            title="Remove table"
            type="button"
          >
            ×
          </button>

          {/* Resize handles - only show for non-circle shapes */}
          {table.shape !== 'circle' && (
            <>
              {/* Corner handles */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'top-left')}
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'top-right')}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
              />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
              />

              {/* Edge handles */}
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'top')}
              />
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'bottom')}
              />
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'left')}
              />
              <div
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => handleMouseDown(e, 'right')}
              />
            </>
          )}

          {/* For circles, only show a uniform scale handle */}
          {table.shape === 'circle' && (
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100"
              onMouseDown={handleCircleResize}
            />
          )}

          {/* Hover outline */}
          <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </>
      )}
    </div>
  );
};

export default TableComponent;