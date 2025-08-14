// File: components/floorplan/TableComponent.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';

const MIN_SIZE = 40;
const GRID = 10;

const TableComponent = ({ table, editMode, onRemoveTable, onTableResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Local live size while dragging (falls back to props when not dragging)
  const [liveWidth, setLiveWidth] = useState(table.width || 56);
  const [liveHeight, setLiveHeight] = useState(table.height || 56);

  // Keep local size in sync when parent changes props (e.g. undo/redo, load)
  useEffect(() => {
    if (!isResizing) {
      setLiveWidth(table.width || 56);
      setLiveHeight(table.height || 56);
    }
  }, [table.width, table.height, isResizing]);

  const wrapperRef = useRef(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    direction: '',
  });

  const roundToGrid = (v) => Math.round(v / GRID) * GRID;

  const startResize = useCallback((e, direction, circle = false) => {
    e.stopPropagation();
    // Pointer events: capture on the target so we don't lose events off the handle
    e.currentTarget.setPointerCapture?.(e.pointerId);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: table.width || 56,
      startH: table.height || 56,
      direction,
    };

    setIsResizing(true);

    const onMove = (ev) => {
      const { startX, startY, startW, startH } = dragRef.current;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (circle) {
        const delta = Math.max(dx, dy);
        const newSize = Math.max(MIN_SIZE, roundToGrid(startW + delta));
        setLiveWidth(newSize);
        setLiveHeight(newSize);
        onTableResize?.(table.id, newSize, newSize);
        return;
      }

      let newW = startW;
      let newH = startH;

      const dir = dragRef.current.direction;
      if (dir.includes('right')) newW = Math.max(MIN_SIZE, startW + dx);
      if (dir.includes('left'))  newW = Math.max(MIN_SIZE, startW - dx);
      if (dir.includes('bottom')) newH = Math.max(MIN_SIZE, startH + dy);
      if (dir.includes('top'))    newH = Math.max(MIN_SIZE, startH - dy);

      newW = roundToGrid(newW);
      newH = roundToGrid(newH);

      setLiveWidth(newW);
      setLiveHeight(newH);
      onTableResize?.(table.id, newW, newH);
    };

    const onUp = (ev) => {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      setIsResizing(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
  }, [onTableResize, table.id, table.width, table.height]);

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveTable?.(table.id);
  };

  const getShapeClasses = () => {
    const base = 'text-gray-800 bg-white flex items-center justify-center font-semibold border border-gray-300 shadow-sm transition-all duration-200';
    const isCircle = table.shape === 'circle';
    return `${base} ${isCircle ? 'rounded-full' : 'rounded-lg'} ${editMode && !isResizing ? 'hover:scale-105' : ''}`;
  };

  const currentWidth = liveWidth;
  const currentHeight = liveHeight;
  const showHandles = isHovered || isResizing;

  return (
    <div 
      ref={wrapperRef}
      className="relative select-none"
      style={{ width: currentWidth, height: currentHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isResizing && setIsHovered(false)}
      title={`Table ${table.table_number}`}
    >
      <div className={getShapeClasses()} style={{ width: '100%', height: '100%' }}>
        {table.table_number}
      </div>

      {editMode && (
        <>
          <button
            onClick={handleRemoveClick}
            className={`absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg transition-all duration-200 z-10 ${showHandles ? 'opacity-100' : 'opacity-0'}`}
            title="Remove table"
            type="button"
          >
            ×
          </button>

          {table.shape !== 'circle' && showHandles && (
            <>
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"
                   onPointerDown={(e) => startResize(e, 'top-left')} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"
                   onPointerDown={(e) => startResize(e, 'top-right')} />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"
                   onPointerDown={(e) => startResize(e, 'bottom-left')} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
                   onPointerDown={(e) => startResize(e, 'bottom-right')} />

              {/* Edge handles */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize"
                   onPointerDown={(e) => startResize(e, 'top')} />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize"
                   onPointerDown={(e) => startResize(e, 'bottom')} />
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize"
                   onPointerDown={(e) => startResize(e, 'left')} />
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize"
                   onPointerDown={(e) => startResize(e, 'right')} />
            </>
          )}

          {table.shape === 'circle' && showHandles && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
                 onPointerDown={(e) => startResize(e, 'circle', true)} />
          )}

          {showHandles && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg pointer-events-none" />
          )}
        </>
      )}
    </div>
  );
};

export default TableComponent;
