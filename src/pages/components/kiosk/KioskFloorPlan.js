import React, { forwardRef, useMemo, useRef, useState, useEffect, useCallback } from 'react';

const slowPulseStyle = { animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' };
const pulseKeyframes = `@keyframes slow-pulse{0%,100%{opacity:1}50%{opacity:.3}}`;

// Logical design space for % coords
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1000;
const PADDING = 50;

// Zoom constraints
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

const KioskFloorPlan = forwardRef(({ tables, selectedZoneId, feedbackMap, selectedFeedback, onTableClick }, outerRef) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Map-style state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const filtered = useMemo(() => tables.filter(t => t.zone_id === selectedZoneId), [tables, selectedZoneId]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { 
      ro.disconnect(); 
      window.removeEventListener('resize', update); 
    };
  }, []);

  // Process tables for rendering
  const processedTables = useMemo(() => {
    if (!filtered.length) return { items: [], bounds: { minX: 0, minY: 0, maxX: WORLD_WIDTH, maxY: WORLD_HEIGHT } };
    
    const items = filtered.map(t => {
      const baseX = t.x_percent != null ? (t.x_percent / 100) * WORLD_WIDTH : (t.x_px ?? 0);
      const baseY = t.y_percent != null ? (t.y_percent / 100) * WORLD_HEIGHT : (t.y_px ?? 0);
      const w = t.width || 56;
      const h = t.height || 56;
      
      return { ...t, baseX, baseY, w, h };
    });

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const it of items) {
      minX = Math.min(minX, it.baseX);
      minY = Math.min(minY, it.baseY);
      maxX = Math.max(maxX, it.baseX + it.w);
      maxY = Math.max(maxY, it.baseY + it.h);
    }
    
    // Add padding
    minX -= PADDING;
    minY -= PADDING;
    maxX += PADDING;
    maxY += PADDING;

    return { items, bounds: { minX, minY, maxX, maxY } };
  }, [filtered]);

  // Auto-fit when zone changes
  useEffect(() => {
    if (processedTables.items.length > 0 && containerSize.width > 0 && containerSize.height > 0) {
      fitToScreen();
    }
  }, [selectedZoneId, containerSize, processedTables.items.length]);

  // Fit all tables to screen
  const fitToScreen = useCallback(() => {
    if (!processedTables.items.length || !containerSize.width || !containerSize.height) return;
    
    const { bounds } = processedTables;
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    // Calculate zoom to fit content in container
    const zoomX = containerSize.width / contentWidth;
    const zoomY = containerSize.height / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, MAX_ZOOM);
    
    // Center the content
    const scaledWidth = contentWidth * newZoom;
    const scaledHeight = contentHeight * newZoom;
    const centerX = (containerSize.width - scaledWidth) / 2 - bounds.minX * newZoom;
    const centerY = (containerSize.height - scaledHeight) / 2 - bounds.minY * newZoom;
    
    setZoom(newZoom);
    setPanOffset({ x: centerX, y: centerY });
  }, [processedTables, containerSize]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  
  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    
    if (newZoom !== zoom) {
      // Zoom towards mouse position
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomRatio = newZoom / zoom;
      const newPanX = mouseX - (mouseX - panOffset.x) * zoomRatio;
      const newPanY = mouseY - (mouseY - panOffset.y) * zoomRatio;
      
      setZoom(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    }
  }, [zoom, panOffset]);

  // Pan controls
  const startPan = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: panOffset.x, y: panOffset.y });
    document.body.style.cursor = 'grabbing';
  };

  const onPan = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanOffset({
      x: panStart.x + dx,
      y: panStart.y + dy
    });
  }, [isDragging, dragStart, panStart]);

  const endPan = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  }, []);

  // Mouse event handlers
  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', onPan);
    document.addEventListener('mouseup', endPan);
    return () => {
      document.removeEventListener('mousemove', onPan);
      document.removeEventListener('mouseup', endPan);
    };
  }, [isDragging, onPan, endPan]);

  // Table rendering helpers
  const getFeedbackStatus = (avg) => {
    if (avg == null) return { borderColor: 'border-gray-800', bgColor: 'bg-gray-700', status: 'no-feedback' };
    if (avg > 4) return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    if (avg >= 2.5) return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    return { borderColor: 'border-red-500', bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  const getTableShapeClasses = (table, feedbackStatus) => {
    const baseClass = `text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-200 cursor-pointer ${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};
    
    const width = table.w;
    const height = table.h;
    
    switch (table.shape) {
      case 'circle': 
        return { 
          className: `${baseClass} rounded-full hover:bg-gray-600`, 
          style: { width: `${width}px`, height: `${height}px`, ...pulseStyle }
        };
      case 'long':   
        return { 
          className: `${baseClass} rounded-lg hover:bg-gray-600 text-sm`, 
          style: { width: `${width}px`, height: `${height}px`, ...pulseStyle }
        };
      default:       
        return { 
          className: `${baseClass} rounded-lg hover:bg-gray-600`, 
          style: { width: `${width}px`, height: `${height}px`, ...pulseStyle }
        };
    }
  };

  return (
    <>
      <style>{pulseKeyframes}</style>

      <div ref={outerRef} className="flex-1 min-h-0 flex flex-col bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-2 bg-white border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Zone Details</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-16 right-4 z-20 flex flex-col gap-1 bg-white rounded-lg border border-gray-300 shadow-lg">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-200"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-200"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          <button
            onClick={fitToScreen}
            className="p-2 hover:bg-gray-100"
            title="Fit to Screen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>

        {/* Map Container */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-gray-50 cursor-grab"
          onMouseDown={startPan}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
              backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
              backgroundPosition: `${panOffset.x % (30 * zoom)}px ${panOffset.y % (30 * zoom)}px`
            }}
          />

          {/* Empty State */}
          {processedTables.items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm font-medium">No tables in this zone</p>
                <p className="text-xs text-gray-400">Tables will appear here when added to this zone</p>
              </div>
            </div>
          )}

          {/* Tables */}
          {processedTables.items.map((table) => {
            const avg = feedbackMap[table.table_number];
            const feedbackStatus = getFeedbackStatus(avg);
            const cfg = getTableShapeClasses(table, feedbackStatus);
            
            const isSelectedTable = selectedFeedback?.table_number === table.table_number;
            
            return (
              <div
                key={table.id}
                className="absolute select-none"
                style={{
                  left: table.baseX * zoom + panOffset.x,
                  top: table.baseY * zoom + panOffset.y,
                  transform: isSelectedTable ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isSelectedTable ? 10 : 1,
                  filter: isSelectedTable ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' : 'none',
                  fontSize: `${Math.max(0.6, Math.min(1.2, zoom))}rem`
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div
                  className={cfg.className}
                  style={{
                    width: `${table.w * zoom}px`,
                    height: `${table.h * zoom}px`,
                    ...cfg.style,
                    fontSize: 'inherit'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTableClick(table.table_number);
                  }}
                  title={`Table ${table.table_number}${avg ? ` - Rating: ${avg.toFixed(1)}/5` : ' - No feedback'}`}
                >
                  {table.table_number}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

KioskFloorPlan.displayName = 'KioskFloorPlan';
export default KioskFloorPlan;