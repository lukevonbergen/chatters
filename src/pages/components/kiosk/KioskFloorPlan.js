import React, { forwardRef, useRef, useState, useEffect } from 'react';

// Custom slow pulse animation
const slowPulseStyle = {
  animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
};

const pulseKeyframes = `
@keyframes slow-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
`;

const KioskFloorPlan = forwardRef(({ 
  tables, 
  selectedZoneId, 
  feedbackMap, 
  selectedFeedback,
  onTableClick 
}, ref) => {
  
  const scrollContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [tableScale, setTableScale] = useState(1);
  
  const filteredTables = tables.filter(t => t.zone_id === selectedZoneId);
  
  // Calculate canvas size based on viewport
  useEffect(() => {
    const updateCanvasSize = () => {
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Calculate scale to fit all tables within canvas
  useEffect(() => {
    if (filteredTables.length === 0 || canvasSize.width === 0) return;

    // Find the bounds of all tables
    const tableBounds = filteredTables.reduce((bounds, table) => ({
      minX: Math.min(bounds.minX, table.x_px),
      maxX: Math.max(bounds.maxX, table.x_px + 64), // Add table width
      minY: Math.min(bounds.minY, table.y_px),
      maxY: Math.max(bounds.maxY, table.y_px + 64), // Add table height
    }), { 
      minX: Infinity, 
      maxX: -Infinity, 
      minY: Infinity, 
      maxY: -Infinity 
    });

    if (bounds.minX === Infinity) return;

    const contentWidth = tableBounds.maxX - tableBounds.minX;
    const contentHeight = tableBounds.maxY - tableBounds.minY;

    // Calculate scale to fit content in canvas with some padding
    const padding = 100;
    const scaleX = (canvasSize.width - padding) / contentWidth;
    const scaleY = (canvasSize.height - padding) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

    setTableScale(scale);
  }, [filteredTables, canvasSize]);

  // Zoom and scroll with mouse wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, zoom * zoomDelta));
        setZoom(newZoom);
      } else if (e.shiftKey) {
        // Horizontal scroll with Shift + wheel
        container.scrollLeft += e.deltaY;
      } else {
        // Normal scroll
        container.scrollTop += e.deltaY;
        container.scrollLeft += e.deltaX;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom]);

  // Drag scrolling
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('floor-plan-canvas') || 
        e.target.classList.contains('grid-pattern')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setScrollStart({
        x: scrollContainerRef.current.scrollLeft,
        y: scrollContainerRef.current.scrollTop
      });
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    scrollContainerRef.current.scrollLeft = scrollStart.x - deltaX;
    scrollContainerRef.current.scrollTop = scrollStart.y - deltaY;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    }
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, scrollStart]);

  const getFeedbackStatus = (avg) => {
    if (avg === null || avg === undefined) {
      return {
        borderColor: 'border-gray-800', // No feedback submitted
        bgColor: 'bg-gray-700',
        status: 'no-feedback'
      };
    }
    if (avg > 4) {
      return {
        borderColor: 'border-green-500', // Table Happy
        bgColor: 'bg-gray-700',
        status: 'happy'
      };
    }
    if (avg >= 2.5) {
      return {
        borderColor: 'border-yellow-500', // Table Needs Attention
        bgColor: 'bg-gray-700',
        status: 'attention'
      };
    }
    return {
      borderColor: 'border-red-500', // Table Unhappy
      bgColor: 'bg-gray-700',
      status: 'unhappy'
    };
  };

  const getTableShapeClasses = (shape, feedbackStatus, isSelected) => {
    const baseClasses = `text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-300 cursor-pointer ${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;
    
    // Selection and alert styling
    const selectionClass = isSelected ? 'scale-110 shadow-xl ring-4 ring-blue-300' : '';
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};
    
    switch (shape) {
      case 'circle':
        return {
          className: `${baseClasses} w-16 h-16 rounded-full hover:bg-gray-600 hover:scale-105 ${selectionClass}`,
          style: pulseStyle
        };
      case 'long':
        return {
          className: `${baseClasses} w-32 h-12 rounded-lg hover:bg-gray-600 hover:scale-105 text-sm ${selectionClass}`,
          style: pulseStyle
        };
      default: // square
        return {
          className: `${baseClasses} w-16 h-16 rounded-lg hover:bg-gray-600 hover:scale-105 ${selectionClass}`,
          style: pulseStyle
        };
    }
  };

  const isTableSelected = (tableNumber) => {
    return selectedFeedback?.table_number === tableNumber;
  };

  const hasTableAlert = (tableNumber) => {
    const rating = feedbackMap[tableNumber];
    return rating !== null && rating !== undefined && rating <= 3;
  };

  return (
    <>
      {/* Inject keyframes */}
      <style>{pulseKeyframes}</style>
      
      <div className="h-screen w-screen flex flex-col bg-gray-100">
        {/* Compact Header */}
        <div className="flex-shrink-0 p-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Zone Details</h2>
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                💡 Ctrl+scroll to zoom • Drag to pan
              </div>
              <div className="text-sm text-gray-600">
                Zoom: {Math.round(zoom * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Full Screen Canvas */}
        <div 
          ref={scrollContainerRef}
          className={`flex-1 overflow-auto ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} relative`}
          onMouseDown={handleMouseDown}
          style={{ 
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div 
            ref={canvasRef}
            className="floor-plan-canvas bg-gray-50 relative w-full h-full"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              minWidth: '100%',
              minHeight: '100%'
            }}
          >
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none grid-pattern"
              style={{
                backgroundImage: `
                  radial-gradient(circle, #94a3b8 2px, transparent 2px)
                `,
                backgroundSize: '30px 30px',
              }}
            />
            
            {/* Empty state */}
            {filteredTables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No tables in this zone</p>
                  <p className="text-sm text-gray-400">
                    Contact your administrator to add tables to this zone
                  </p>
                </div>
              </div>
            )}

            {/* Tables - Auto-scaled and centered */}
            {filteredTables.length > 0 && (
              <div 
                className="absolute"
                style={{
                  transform: `scale(${tableScale})`,
                  transformOrigin: '0 0',
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${(Math.max(...filteredTables.map(t => t.x_px)) + Math.min(...filteredTables.map(t => t.x_px))) / 2 * tableScale}px`,
                  marginTop: `-${(Math.max(...filteredTables.map(t => t.y_px)) + Math.min(...filteredTables.map(t => t.y_px))) / 2 * tableScale}px`
                }}
              >
                {filteredTables.map((table) => {
                  const avgRating = feedbackMap[table.table_number];
                  const feedbackStatus = getFeedbackStatus(avgRating);
                  const isSelected = isTableSelected(table.table_number);
                  const tableShapeConfig = getTableShapeClasses(table.shape, feedbackStatus, isSelected);

                  return (
                    <div 
                      key={table.id} 
                      className="absolute table-element" 
                      style={{ left: table.x_px, top: table.y_px }}
                    >
                      <div
                        className={tableShapeConfig.className}
                        style={tableShapeConfig.style}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTableClick(table.table_number);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {table.table_number}
                      </div>

                      {/* Selection highlight */}
                      {isSelected && (
                        <div className="absolute -inset-4 border-4 border-blue-400 rounded-lg opacity-50 pointer-events-none animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

KioskFloorPlan.displayName = 'KioskFloorPlan';

export default KioskFloorPlan;