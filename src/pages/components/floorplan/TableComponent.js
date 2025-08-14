// File: components/floorplan/TableComponent.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';

const MIN_SIZE = 40;
const GRID = 10;

const TableComponent = ({
  table,
  editMode,
  onRemoveTable,
  onTableResize, // (id, width, height) -> parent persists immutably
  onTableMove,   // OPTIONAL: (id, dx, dy) to adjust x/y when resizing from left/top
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Live visual size during drag (no snap while moving)
  const [liveWidth, setLiveWidth] = useState(table.width || 56);
  const [liveHeight, setLiveHeight] = useState(table.height || 56);

  // Stay in sync with parent props unless currently resizing
  useEffect(() => {
    if (!isResizing) {
      setLiveWidth(table.width || 56);
      setLiveHeight(table.height || 56);
    }
  }, [table.width, table.height, isResizing]);

  // UX: prevent text selection while dragging
  useEffect(() => {
    if (!isResizing) return;
    const prev = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    return () => { document.body.style.userSelect = prev; };
  }, [isResizing]);

  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    direction: '',
  });

  // Track the element + pointer being captured so we can release cleanly
  const captureElRef = useRef(null);
  const pointerIdRef = useRef(null);

  const roundToGrid = (v) => Math.round(v / GRID) * GRID;

  const startResize = useCallback((e, direction, circle = false) => {
    e.stopPropagation();

    captureElRef.current = e.currentTarget;
    pointerIdRef.current = e.pointerId;
    captureElRef.current?.setPointerCapture?.(pointerIdRef.current);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: table.width || 56,
      startH: table.height || 56,
      direction,
    };

    setIsResizing(true);

    const onMove = (ev) => {
      const { startX, startY, startW, startH, direction: dir } = dragRef.current;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (circle) {
        const delta = Math.max(dx, dy);
        const newSize = Math.max(MIN_SIZE, startW + delta);
        setLiveWidth(newSize);
        setLiveHeight(newSize);
        return;
      }

      let newW = startW;
      let newH = startH;

      if (dir.includes('right')) newW = Math.max(MIN_SIZE, startW + dx);
      if (dir.includes('left'))  newW = Math.max(MIN_SIZE, startW - dx);
      if (dir.includes('bottom')) newH = Math.max(MIN_SIZE, startH + dy);
      if (dir.includes('top'))    newH = Math.max(MIN_SIZE, startH - dy);

      setLiveWidth(newW);
      setLiveHeight(newH);
    };

    // Track last pointer position for reliable final commit
    const trackLast = (ev) => {
      window.__lastPX = ev.clientX;
      window.__lastPY = ev.clientY;
    };

    const cleanUp = () => {
      const { startX, startY, startW, startH, direction: dir } = dragRef.current;
      const lastX = window.__lastPX ?? startX;
      const lastY = window.__lastPY ?? startY;
      const dx = lastX - startX;
      const dy = lastY - startY;

      // Final size = live size at release, then snap once
      let finalW = roundToGrid(Math.max(MIN_SIZE, liveWidth));
      let finalH = roundToGrid(Math.max(MIN_SIZE, liveHeight));

      // Optional: if caller supports moving, anchor opposite edge when resizing from left/top
      if (onTableMove) {
        let moveDx = 0;
        let moveDy = 0;
        if (dir.includes('left')) {
          const oldW = roundToGrid(startW);
          moveDx = -(finalW - oldW);
        }
        if (dir.includes('top')) {
          const oldH = roundToGrid(startH);
          moveDy = -(finalH - oldH);
        }
        if (moveDx || moveDy) onTableMove(table.id, moveDx, moveDy);
      }

      // Persist once
      onTableResize?.(table.id, finalW, finalH);

      captureElRef.current?.releasePointerCapture?.(pointerIdRef.current);
      captureElRef.current = null;
      pointerIdRef.current = null;

      setIsResizing(false);

      window.removeEventListener('pointermove', trackLast);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', cleanUp);
      window.removeEventListener('pointercancel', cleanUp);
      delete window.__lastPX;
      delete window.__lastPY;
    };

    window.addEventListener('pointermove', trackLast, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', cleanUp, { passive: true });
    window.addEventListener('pointercancel', cleanUp, { passive: true });
  }, [onTableResize, onTableMove, table.id, table.width, table.height, liveWidth, liveHeight]);

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveTable?.(table.id);
  };

  const getShapeClasses = () => {
    const base = 'text-gray-800 bg-white flex items-center justify-center font-semibold border border-gray-300 shadow-sm transition-all duration-200';
    const isCircle = table.shape === 'circle';
    return `${base} ${isCircle ? 'rounded-full' : 'rounded-lg'} ${editMode && !isResizing ? 'hover:scale-105' : ''}`;
  };

  const showHandles = isHovered || isResizing;

  return (
    <div
      className="relative select-none"
      style={{ width: liveWidth, height: liveHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isResizing && setIsHovered(false)}
      title={`Table ${table.table_number}`}
    >
      <div className={getShapeClasses()} style={{ width: '100%', height: '100%' }}>
        {table.table_number}
      </div>

      {editMode && (
        <>
          {/* Remove button */}
          <button
            onClick={handleRemoveClick}
            className={`absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg transition-all duration-200 z-10 ${showHandles ? 'opacity-100' : 'opacity-0'}`}
            title="Remove table"
            type="button"
          >
            ×
          </button>

          {/* Handles for non-circle */}
          {table.shape !== 'circle' && showHandles && (
            <>
              {/* Corners */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"
                   onPointerDown={(e) => startResize(e, 'top-left')} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"
                   onPointerDown={(e) => startResize(e, 'top-right')} />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"
                   onPointerDown={(e) => startResize(e, 'bottom-left')} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
                   onPointerDown={(e) => startResize(e, 'bottom-right')} />
              {/* Edges */}
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

          {/* Circle: uniform scale from bottom-right */}
          {table.shape === 'circle' && showHandles && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
                 onPointerDown={(e) => startResize(e, 'circle', true)} />
          )}

          {/* Hover outline */}
          {showHandles && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg pointer-events-none" />
          )}
        </>
      )}
    </div>
  );
};

export default TableComponent;