import React, { forwardRef, useMemo, useRef, useState, useEffect, useCallback } from 'react';

const slowPulseStyle = { animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' };
const pulseKeyframes = `@keyframes slow-pulse{0%,100%{opacity:1}50%{opacity:.3}}`;

// Logical design space for % coords
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1000;

// Zoom constraints
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

const KioskFloorPlan = forwardRef(({ tables, selectedZoneId, feedbackMap, selectedFeedback, assistanceMap, onTableClick }, outerRef) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Simplified map state
  const [zoom, setZoom] = useState(0.5);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const filtered = useMemo(() => {
    const result = tables.filter(t => t.zone_id === selectedZoneId);
    return result;
  }, [tables, selectedZoneId]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const update = () => {
      const rect = el.getBoundingClientRect();
      const newSize = { width: rect.width, height: rect.height };
      setContainerSize(newSize);
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

  // Process tables with simpler coordinate system
  const processedTables = useMemo(() => {
    return filtered.map(t => {
      // Convert percentages to world coordinates
      const worldX = t.x_percent != null ? (t.x_percent / 100) * WORLD_WIDTH : (t.x_px ?? 0);
      const worldY = t.y_percent != null ? (t.y_percent / 100) * WORLD_HEIGHT : (t.y_px ?? 0);
      const w = t.width || 56;
      const h = t.height || 56;
      
      return { ...t, worldX, worldY, w, h };
    });
  }, [filtered]);

  // Simple fit to screen
  const fitToScreen = useCallback(() => {
    if (!processedTables.length || !containerSize.width || !containerSize.height) {
      return;
    }
    
    // Find bounds of all tables
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const table of processedTables) {
      minX = Math.min(minX, table.worldX);
      minY = Math.min(minY, table.worldY);
      maxX = Math.max(maxX, table.worldX + table.w);
      maxY = Math.max(maxY, table.worldY + table.h);
    }
    
    // Add some padding
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Calculate zoom to fit
    const scaleX = containerSize.width / contentWidth;
    const scaleY = containerSize.height / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);
    
    // Center the content
    const scaledContentWidth = contentWidth * newZoom;
    const scaledContentHeight = contentHeight * newZoom;
    
    const centerX = (containerSize.width - scaledContentWidth) / 2 - minX * newZoom;
    const centerY = (containerSize.height - scaledContentHeight) / 2 - minY * newZoom;
    
    setZoom(newZoom);
    setPanOffset({ x: centerX, y: centerY });
  }, [processedTables, containerSize]);

  // Auto-fit when data changes
  useEffect(() => {
    if (processedTables.length > 0 && containerSize.width > 0) {
      setTimeout(fitToScreen, 100);
    }
  }, [selectedZoneId, processedTables.length, containerSize.width, fitToScreen]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  
  // Mouse wheel zoom with trackpad sensitivity adjustment
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    // Detect trackpad vs mouse wheel based on deltaY magnitude
    // Trackpads typically send smaller, more frequent deltas
    const isTrackpad = Math.abs(e.deltaY) < 50;
    const sensitivity = isTrackpad ? 0.005 : 0.01; // Increased trackpad sensitivity from 0.002 to 0.005
    
    const delta = e.deltaY > 0 ? -sensitivity : sensitivity;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    
    if (newZoom !== zoom) {
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
  const getTableStatus = (tableNumber, feedbackAvg) => {
    // Assistance requests take priority over feedback
    const assistanceStatus = assistanceMap?.[tableNumber];
    if (assistanceStatus === 'pending') {
      return { borderColor: 'border-orange-500', bgColor: 'bg-gray-700', status: 'assistance-pending' };
    }
    if (assistanceStatus === 'acknowledged') {
      return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'assistance-acknowledged' };
    }
    
    // Fall back to feedback status
    if (feedbackAvg == null) return { borderColor: 'border-gray-800', bgColor: 'bg-gray-700', status: 'no-feedback' };
    if (feedbackAvg > 4) return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    if (feedbackAvg >= 2.5) return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    return { borderColor: 'border-red-500', bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  const getTableShapeClasses = (table, tableStatus) => {
    const baseClass = `text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-200 cursor-pointer ${tableStatus.bgColor} ${tableStatus.borderColor}`;
    // Pulse for unhappy feedback or pending assistance
    const pulseStyle = (tableStatus.status === 'unhappy' || tableStatus.status === 'assistance-pending') ? slowPulseStyle : {};
    
    switch (table.shape) {
      case 'circle': 
        return { 
          className: `${baseClass} rounded-full hover:bg-gray-600`, 
          style: pulseStyle
        };
      case 'long':   
        return { 
          className: `${baseClass} rounded-lg hover:bg-gray-600 text-sm`, 
          style: pulseStyle
        };
      default:       
        return { 
          className: `${baseClass} rounded-lg hover:bg-gray-600`, 
          style: pulseStyle
        };
    }
  };

  return (
    <>
      <style>{pulseKeyframes}</style>

      <div ref={outerRef} className="flex-1 min-h-0 flex flex-col bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden h-full">
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

        {/* Map Container - PROPER FLEX HEIGHT */}
        <div
          ref={containerRef}
          className="flex-1 min-h-0 relative overflow-hidden bg-gray-50"
          onMouseDown={startPan}
          onWheel={handleWheel}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
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
          {processedTables.length === 0 && (
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
          {processedTables.map((table) => {
            const avg = feedbackMap[table.table_number];
            const tableStatus = getTableStatus(table.table_number, avg);
            const cfg = getTableShapeClasses(table, tableStatus);
            
            const isSelectedTable = selectedFeedback?.table_number === table.table_number;
            
            // Calculate screen position
            const screenX = table.worldX * zoom + panOffset.x;
            const screenY = table.worldY * zoom + panOffset.y;
            const screenWidth = table.w * zoom;
            const screenHeight = table.h * zoom;
            
            return (
              <div
                key={table.id}
                className="absolute select-none"
                style={{
                  left: screenX,
                  top: screenY,
                  width: screenWidth,
                  height: screenHeight,
                  transform: isSelectedTable ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isSelectedTable ? 10 : 1,
                  filter: isSelectedTable ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' : 'none',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div
                  className={cfg.className}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: `${Math.max(8, Math.min(16, screenWidth * 0.3))}px`,
                    ...cfg.style
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