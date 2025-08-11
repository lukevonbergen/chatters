import React, { forwardRef, useMemo, useRef, useState, useEffect } from 'react';

// Custom slow pulse animation
const slowPulseStyle = {
  animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
};

const pulseKeyframes = `
@keyframes slow-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

const PADDING = 120;       // padding around world bounds
const TABLE_W = 64;        // base table width used for bounds
const TABLE_H = 64;        // base table height used for bounds

const KioskFloorPlan = forwardRef(({ 
  tables, 
  selectedZoneId, 
  feedbackMap, 
  selectedFeedback,
  onTableClick 
}, outerRef) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const filtered = useMemo(() => tables.filter(t => t.zone_id === selectedZoneId), [tables, selectedZoneId]);

  // Compute world bounds from table coords
  const world = useMemo(() => {
    if (!filtered.length) {
      return { minX: 0, minY: 0, width: 1000, height: 700, norm: [] };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of filtered) {
      const w = t.shape === 'long' ? 128 : TABLE_W;
      const h = t.shape === 'long' ? 48  : TABLE_H;
      minX = Math.min(minX, t.x_px);
      minY = Math.min(minY, t.y_px);
      maxX = Math.max(maxX, t.x_px + w);
      maxY = Math.max(maxY, t.y_px + h);
    }
    const width  = Math.max(1, (maxX - minX) + PADDING * 2);
    const height = Math.max(1, (maxY - minY) + PADDING * 2);

    // Normalize each table to world coords so (minX,minY) sits at PADDING
    const norm = filtered.map(t => ({
      ...t,
      normX: (t.x_px - minX) + PADDING,
      normY: (t.y_px - minY) + PADDING
    }));

    return { minX, minY, width, height, norm };
  }, [filtered]);

  // Pan/zoom handlers
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.max(0.2, Math.min(3, z * delta)));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const startDrag = (e) => {
    // only when dragging background
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setScrollStart({ x: scrollRef.current.scrollLeft, y: scrollRef.current.scrollTop });
      document.body.style.cursor = 'grabbing';
    }
  };
  const onDrag = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    scrollRef.current.scrollLeft = scrollStart.x - dx;
    scrollRef.current.scrollTop  = scrollStart.y - dy;
  };
  const endDrag = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    }
  };
  useEffect(() => {
    if (!isDragging) return;
    const mm = (e) => onDrag(e);
    const mu = () => endDrag();
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    return () => {
      document.removeEventListener('mousemove', mm);
      document.removeEventListener('mouseup', mu);
    };
  }, [isDragging, dragStart, scrollStart]);

  const getFeedbackStatus = (avg) => {
    if (avg == null) return { borderColor: 'border-gray-800', bgColor: 'bg-gray-700', status: 'no-feedback' };
    if (avg > 4) return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    if (avg >= 2.5) return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    return { borderColor: 'border-red-500', bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  const getTableShapeClasses = (shape, feedbackStatus, isSelected) => {
    const base = `text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-300 cursor-pointer ${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;
    const selection = isSelected ? 'scale-110 shadow-xl ring-4 ring-blue-300' : '';
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};
    switch (shape) {
      case 'circle':
        return { className: `${base} w-16 h-16 rounded-full hover:bg-gray-600 hover:scale-105 ${selection}`, style: pulseStyle };
      case 'long':
        return { className: `${base} w-32 h-12 rounded-lg hover:bg-gray-600 hover:scale-105 text-sm ${selection}`, style: pulseStyle };
      default:
        return { className: `${base} w-16 h-16 rounded-lg hover:bg-gray-600 hover:scale-105 ${selection}`, style: pulseStyle };
    }
  };

  const isSelected = (n) => selectedFeedback?.table_number === n;

  return (
    <>
      <style>{pulseKeyframes}</style>

      {/* Root fills available space; ref is attached here so KioskPage can measure it */}
      <div
        ref={outerRef}
        className="flex-1 min-h-0 flex flex-col bg-gray-100 rounded-lg border border-gray-200"
      >
        {/* Top bar (compact) */}
        <div className="flex-shrink-0 px-4 py-2 bg-white border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Zone Details</h2>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Ctrl/Cmd + Scroll to zoom</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Scroll/pan container */}
        <div
          ref={scrollRef}
          className={`flex-1 overflow-auto relative ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onMouseDown={startDrag}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* World canvas sized to bounds */}
          <div
            className="relative bg-gray-50"
            style={{
              width: world.width * zoom,
              height: world.height * zoom,
              transformOrigin: '0 0'
            }}
          >
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #94a3b8 2px, transparent 2px)`,
                backgroundSize: '30px 30px'
              }}
            />

            {/* Empty state */}
            {!filtered.length && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No tables in this zone</p>
                </div>
              </div>
            )}

            {/* Tables */}
            {world.norm.map((t) => {
              const avg = feedbackMap[t.table_number];
              const feedbackStatus = getFeedbackStatus(avg);
              const cfg = getTableShapeClasses(t.shape, feedbackStatus, isSelected(t.table_number));
              return (
                <div
                  key={t.id}
                  className="absolute"
                  style={{
                    left: t.normX * zoom,
                    top: t.normY * zoom
                  }}
                >
                  <div
                    className={cfg.className}
                    style={cfg.style}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTableClick(t.table_number);
                    }}
                  >
                    {t.table_number}
                  </div>

                  {isSelected(t.table_number) && (
                    <div className="absolute -inset-4 border-4 border-blue-400 rounded-lg opacity-50 pointer-events-none animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
});

KioskFloorPlan.displayName = 'KioskFloorPlan';
export default KioskFloorPlan;