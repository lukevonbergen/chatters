import React, { forwardRef, useMemo, useRef, useState, useEffect } from 'react';

// Custom slow pulse animation
const slowPulseStyle = { animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' };
const pulseKeyframes = `
@keyframes slow-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

// Fixed logical canvas (change if you want a different design size)
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1000;
const PADDING = 120;
const TABLE_W = 64;
const TABLE_H = 64;

const KioskFloorPlan = forwardRef(({ 
  tables, 
  selectedZoneId, 
  feedbackMap, 
  selectedFeedback, // not used for floorplan highlight (sidebar keeps selection)
  onTableClick 
}, outerRef) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const filtered = useMemo(
    () => tables.filter(t => t.zone_id === selectedZoneId),
    [tables, selectedZoneId]
  );

  // Build a world using a fixed logical canvas.
  // If x_percent/y_percent exist, use them relative to WORLD_*; otherwise fall back to x_px/y_px.
  const world = useMemo(() => {
    if (!filtered.length) {
      return { width: WORLD_WIDTH + PADDING * 2, height: WORLD_HEIGHT + PADDING * 2, norm: [] };
    }

    const base = filtered.map(t => {
      const baseX = t.x_percent != null ? (t.x_percent / 100) * WORLD_WIDTH : t.x_px ?? 0;
      const baseY = t.y_percent != null ? (t.y_percent / 100) * WORLD_HEIGHT : t.y_px ?? 0;
      return { ...t, baseX, baseY };
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of base) {
      const w = t.shape === 'long' ? 128 : TABLE_W;
      const h = t.shape === 'long' ? 48  : TABLE_H;
      minX = Math.min(minX, t.baseX);
      minY = Math.min(minY, t.baseY);
      maxX = Math.max(maxX, t.baseX + w);
      maxY = Math.max(maxY, t.baseY + h);
    }

    // World is the larger of: fixed logical size OR the content bounds.
    const contentW = (maxX - minX);
    const contentH = (maxY - minY);
    const worldW = Math.max(WORLD_WIDTH, contentW) + PADDING * 2;
    const worldH = Math.max(WORLD_HEIGHT, contentH) + PADDING * 2;

    // Normalise to world coords with padding
    const norm = base.map(t => ({
      ...t,
      normX: (t.baseX - minX) + PADDING,
      normY: (t.baseY - minY) + PADDING
    }));

    return { width: worldW, height: worldH, norm };
  }, [filtered]);

  // Measure container to decide if panning is needed
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const isPannable = world.width > containerSize.width || world.height > containerSize.height;

  // Drag to pan only when pannable
  const startDrag = (e) => {
    if (!isPannable) return;
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
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };
  useEffect(() => {
    if (!isDragging) return;
    const mm = (e) => onDrag(e);
    const mu = () => endDrag();
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    return () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
  }, [isDragging, dragStart, scrollStart]);

  const getFeedbackStatus = (avg) => {
    if (avg == null) return { borderColor: 'border-gray-800', bgColor: 'bg-gray-700', status: 'no-feedback' };
    if (avg > 4) return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    if (avg >= 2.5) return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    return { borderColor: 'border-red-500', bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  const getTableShapeClasses = (shape, feedbackStatus) => {
    const base = `text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-200 cursor-pointer ${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};
    switch (shape) {
      case 'circle':
        return { className: `${base} w-16 h-16 rounded-full hover:bg-gray-600`, style: pulseStyle };
      case 'long':
        return { className: `${base} w-32 h-12 rounded-lg hover:bg-gray-600 text-sm`, style: pulseStyle };
      default:
        return { className: `${base} w-16 h-16 rounded-lg hover:bg-gray-600`, style: pulseStyle };
    }
  };

  return (
    <>
      <style>{pulseKeyframes}</style>

      <div
        ref={outerRef}
        className="flex-1 min-h-0 flex flex-col bg-gray-100 rounded-lg border border-gray-200"
      >
        {/* Compact header (no zoom hint anymore) */}
        <div className="flex-shrink-0 px-4 py-2 bg-white border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Zone Details</h2>
          <div className="text-xs text-gray-600">Drag background to pan when needed</div>
        </div>

        {/* Scroll container: only scrollable/pannable when world > container */}
        <div
          ref={scrollRef}
          className={`flex-1 relative ${isPannable ? 'overflow-auto' : 'overflow-hidden'} ${isPannable ? (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab') : 'cursor-default'}`}
          onMouseDown={startDrag}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Center world when it fits; otherwise it's larger and scrolls */}
          <div className={`w-full h-full ${!isPannable ? 'flex items-center justify-center' : ''}`}>
            <div
              className="relative bg-gray-50"
              style={{ width: world.width, height: world.height }}
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
                const cfg = getTableShapeClasses(t.shape, feedbackStatus);
                return (
                  <div
                    key={t.id}
                    className="absolute"
                    style={{ left: t.normX, top: t.normY }}
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

KioskFloorPlan.displayName = 'KioskFloorPlan';
export default KioskFloorPlan;