import React, { useState } from 'react';

const TableComponent = ({ table, editMode, onRemoveTable, onTableResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = (e, direction) => {
    console.log('Mouse down on handle:', direction); // Debug log
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = table.width || 56;
    const startHeight = table.height || 56;

    console.log('Starting resize:', { startWidth, startHeight, startX, startY }); // Debug log

    const handleMouseMove = (e) => {
      console.log('Mouse move:', e.clientX, e.clientY); // Debug log
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

      console.log('New dimensions:', { newWidth, newHeight }); // Debug log

      // Immediately update parent state
      if (onTableResize) {
        onTableResize(table.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      console.log('Mouse up - ending resize'); // Debug log
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCircleResize = (e) => {
    console.log('Circle resize started'); // Debug log
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
      
      console.log('Circle new size:', newSize); // Debug log
      
      // Immediately update parent state
      if (onTableResize) {
        onTableResize(table.id, newSize, newSize);
      }
    };

    const handleMouseUp = () => {
      console.log('Circle resize ended'); // Debug log
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

  // Show handles when hovered OR when resizing
  const showHandles = isHovered || isResizing;

  return (
    <div 
      className="relative select-none"
      style={{ width: currentWidth, height: currentHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isResizing && setIsHovered(false)}
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
            className={`absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg transition-all duration-200 z-10 ${
              showHandles ? 'opacity-100' : 'opacity-0'
            }`}
            title="Remove table"
            type="button"
          >
            ×
          </button>

          {/* Resize handles - only show for non-circle shapes */}
          {table.shape !== 'circle' && showHandles && (
            <>
              {/* Corner handles */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'top-left')}
                title="Resize top-left"
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'top-right')}
                title="Resize top-right"
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
                title="Resize bottom-left"
              />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
                title="Resize bottom-right"
              />

              {/* Edge handles */}
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'top')}
                title="Resize top"
              />
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                title="Resize bottom"
              />
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'left')}
                title="Resize left"
              />
              <div
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, 'right')}
                title="Resize right"
              />
            </>
          )}

          {/* For circles, only show a uniform scale handle */}
          {table.shape === 'circle' && showHandles && (
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize z-20"
              onMouseDown={handleCircleResize}
              title="Resize circle"
            />
          )}

          {/* Hover outline */}
          {showHandles && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg pointer-events-none" />
          )}
        </>
      )}

      {/* Debug info */}
      {editMode && (
        <div className="absolute -bottom-8 left-0 text-xs text-gray-500 bg-white px-1 rounded">
          {currentWidth}×{currentHeight} | Hovering: {isHovered ? 'Y' : 'N'} | Resizing: {isResizing ? 'Y' : 'N'}
        </div>
      )}
    </div>
  );
};

// Demo component to test the TableComponent
const TableDemo = () => {
  const [tables, setTables] = useState([
    { id: 1, table_number: 'T1', width: 80, height: 60, shape: 'rectangle' },
    { id: 2, table_number: 'T2', width: 70, height: 70, shape: 'circle' }
  ]);
  const [editMode, setEditMode] = useState(true);

  const handleTableResize = (tableId, newWidth, newHeight) => {
    console.log('Parent received resize:', { tableId, newWidth, newHeight });
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId 
          ? { ...table, width: newWidth, height: newHeight }
          : table
      )
    );
  };

  const handleRemoveTable = (tableId) => {
    setTables(prevTables => prevTables.filter(table => table.id !== tableId));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-4">
        <button 
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </button>
      </div>
      
      <div className="relative bg-white border-2 border-gray-300 rounded-lg" style={{ width: 600, height: 400 }}>
        {tables.map(table => (
          <div
            key={table.id}
            className="absolute"
            style={{ left: table.id * 120, top: table.id * 80 }}
          >
            <TableComponent
              table={table}
              editMode={editMode}
              onTableResize={handleTableResize}
              onRemoveTable={handleRemoveTable}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableDemo;