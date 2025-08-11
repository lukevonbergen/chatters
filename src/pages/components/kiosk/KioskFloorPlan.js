import React, { forwardRef, useMemo, useRef, useState, useEffect } from 'react';

const slowPulseStyle = { animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' };
const pulseKeyframes = `@keyframes slow-pulse{0%,100%{opacity:1}50%{opacity:.3}}`;

// Logical design size for % coords (not the rendered size)
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1000;
const PADDING = 120;
const TABLE_W = 64;
const TABLE_H = 64;

const KioskFloorPlan = forwardRef(({ tables, selectedZoneId, feedbackMap, onTableClick }, outerRef) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const filtered = useMemo(() => tables.filter(t => t.zone_id === selectedZoneId), [tables, selectedZoneId]);

  // Measure container so the canvas can always fill to the bottom of the view
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

  // Build “desired” world based on data (independent of viewport)
  const desired = useMemo(() => {
    if (!filtered.length) {
      return { width: WORLD_WIDTH + PADDING * 2, height: WORLD_HEIGHT + PADDING * 2, norm: [] };
    }
    const base = filtered.map(t => ({
      ...t,
      baseX: t.x_percent != null ? (t.x_percent / 100) * WORLD_WIDTH : t.x_px ?? 0,
      baseY: t.y_percent != null ? (t.y_percent / 100) * WORLD_HEIGHT : t.y_px ?? 0,
    }));

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of base) {
      const w = t.shape === 'long' ? 128 : TABLE_W;
      const h = t.shape === 'long' ? 48  : TABLE_H;
      minX = Math.min(minX, t.baseX);
      minY = Math.min(minY, t.baseY);
      maxX = Math.max(maxX, t.baseX + w);
      maxY = Math.max(maxY, t.baseY + h);
    }

    const contentW = (maxX - minX);
    const contentH = (maxY - minY);
    const width  = Math.max(WORLD_WIDTH,  contentW) + PADDING * 2;
    const height = Math.max(WORLD_HEIGHT, contentH) + PADDING * 2;

    const norm = base.map(t => ({
      ...t,
      normX: (t.baseX - minX) + PADDING,
      normY: (t.baseY - minY) + PADDING,
    }));

    return { width, height, norm };
  }, [filtered]);

  // Final rendered world size = at least container size (so canvas reaches the bottom)
  const worldWidth  = Math.max(desired.width,  containerSize.width);
  const worldHeight = Math.max(desired.height, containerSize.height);

  // Pan only if desired world exceeds container (not the min’d world)
  const isPannable = desired.width > containerSize.width || desired.height > containerSize.height;

  // Drag to pan (only when pannable)
  const startDrag = (e) => {
    if (!isPannable) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setScrollStart({ x: scrollRef.current.scrollLeft, y: scrollRef.current.scrollTop });
    document.body.style.cursor = 'grabbing';
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
      case 'circle': return { className: `${base} w-16 h-16 rounded-full hover:bg-gray-600`, style: pulseStyle };
      case 'long':   return { className: `${base} w-32 h-12 rounded-lg hover:bg-gray-600 text-sm`, style: pulseStyle };
      default:       return { className: `${base} w-16 h-16 rounded-lg hover:bg-gray-600`, style: pulseStyle };
    }
  };

  return (
    <>
      <style>{pulseKeyframes}</style>

      <div ref={outerRef} className="flex-1 min-h-0 flex flex-col bg-gray-100 rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-2 bg-white border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Zone Details</h2>
          <div className="text-xs text-gray-600">{isPannable ? 'Drag background to pan' : 'All tables fit'}</div>
        </div>

        {/* Scroll container: no scrollbars unless needed */}
        <div
          ref={scrollRef}
          className={`flex-1 relative ${isPannable ? 'overflow-auto' : 'overflow-hidden'} ${isPannable ? (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab') : 'cursor-default'}`}
          onMouseDown={startDrag}
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >
          {/* No centering — world anchors top/left; background grid fills world */}
          <div className="w-full h-full">
            <div className="relative bg-gray-50" style={{ width: worldWidth, height: worldHeight }}>
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle,#94a3b8 2px,transparent 2px)', backgroundSize: '30px 30px' }}
              />

              {/* Tables */}
              {desired.norm.map((t) => {
                const avg = feedbackMap[t.table_number];
                const feedbackStatus = getFeedbackStatus(avg);
                const cfg = getTableShapeClasses(t.shape, feedbackStatus);
                return (
                  <div
                    key={t.id}
                    className="absolute"
                    style={{ left: t.normX, top: t.normY }}
                    onMouseDown={(e) => e.stopPropagation()} // prevent starting drag
                  >
                    <div
                      className={cfg.className}
                      style={cfg.style}
                      onClick={(e) => { e.stopPropagation(); onTableClick(t.table_number); }}
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
