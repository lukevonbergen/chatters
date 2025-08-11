import React, { forwardRef, useMemo, useRef, useState, useEffect } from 'react';

const slowPulseStyle = { animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' };
const pulseKeyframes = `@keyframes slow-pulse{0%,100%{opacity:1}50%{opacity:.3}}`;

// Logical design space for % coords (does NOT force render size)
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1000;

// Uniform padding on both axes so X and Y behave identically
const PADDING = 24;

const TABLE_W = 64;
const TABLE_H = 64;

const KioskFloorPlan = forwardRef(({ tables, selectedZoneId, feedbackMap, onTableClick }, outerRef) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const filtered = useMemo(() => tables.filter(t => t.zone_id === selectedZoneId), [tables, selectedZoneId]);

  // Measure the scroll container so the canvas can match viewport on both axes
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

  // Compute content bounds in logical space
  const base = useMemo(() => {
    if (!filtered.length) {
      return { minX: 0, minY: 0, maxX: WORLD_WIDTH, maxY: WORLD_HEIGHT, items: [] };
    }
    const items = filtered.map(t => {
      const baseX = t.x_percent != null ? (t.x_percent / 100) * WORLD_WIDTH : (t.x_px ?? 0);
      const baseY = t.y_percent != null ? (t.y_percent / 100) * WORLD_HEIGHT : (t.y_px ?? 0);
      const w = t.shape === 'long' ? 128 : TABLE_W;
      const h = t.shape === 'long' ?  48 : TABLE_H;
      return { ...t, baseX, baseY, w, h };
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const it of items) {
      minX = Math.min(minX, it.baseX);
      minY = Math.min(minY, it.baseY);
      maxX = Math.max(maxX, it.baseX + it.w);
      maxY = Math.max(maxY, it.baseY + it.h);
    }
    // Ensure at least design world extents
    minX = Math.min(minX, 0);
    minY = Math.min(minY, 0);
    maxX = Math.max(maxX, WORLD_WIDTH);
    maxY = Math.max(maxY, WORLD_HEIGHT);

    return { minX, minY, maxX, maxY, items };
  }, [filtered]);

  const contentW = base.maxX - base.minX;
  const contentH = base.maxY - base.minY;

  // Desired world (data-driven) with same padding on both axes
  const desiredWidth  = contentW + PADDING * 2;
  const desiredHeight = contentH + PADDING * 2;

  // Rendered world must at least fill the visible container (mirrors X and Y)
  const worldWidth  = Math.max(desiredWidth,  containerSize.width);
  const worldHeight = Math.max(desiredHeight, containerSize.height);

  // Enable scroll/drag per axis only when content exceeds the container (mirrors X and Y)
  const canPanX = desiredWidth  > containerSize.width;
  const canPanY = desiredHeight > containerSize.height;

  // Normalised coordinates (same padding on both axes)
  const normItems = useMemo(() => {
    return base.items.map(it => ({
      ...it,
      normX: (it.baseX - base.minX) + PADDING,
      normY: (it.baseY - base.minY) + PADDING,
    }));
  }, [base]);

  // Drag-to-pan (per-axis)
  const startDrag = (e) => {
    if (!canPanX && !canPanY) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setScrollStart({ x: scrollRef.current.scrollLeft, y: scrollRef.current.scrollTop });
    document.body.style.cursor = 'grabbing';
  };
  const onDrag = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (canPanX) scrollRef.current.scrollLeft = scrollStart.x - dx;
    if (canPanY) scrollRef.current.scrollTop  = scrollStart.y - dy;
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
  }, [isDragging, dragStart, scrollStart, canPanX, canPanY]);

  const getFeedbackStatus = (avg) => {
    if (avg == null) return { borderColor: 'border-gray-800', bgColor: 'bg-gray-700', status: 'no-feedback' };
    if (avg > 4)   return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    if (avg >= 2.5)return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    return           { borderColor: 'border-red-500',   bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  const getTableShapeClasses = (shape, feedbackStatus) => {
    const baseClass = `text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-200 cursor-pointer ${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};
    switch (shape) {
      case 'circle': return { className: `${baseClass} w-16 h-16 rounded-full hover:bg-gray-600`, style: pulseStyle };
      case 'long':   return { className: `${baseClass} w-32 h-12 rounded-lg hover:bg-gray-600 text-sm`, style: pulseStyle };
      default:       return { className: `${baseClass} w-16 h-16 rounded-lg hover:bg-gray-600`, style: pulseStyle };
    }
  };

  return (
    <>
      <style>{pulseKeyframes}</style>

      <div ref={outerRef} className="flex-1 min-h-0 flex flex-col bg-gray-100 rounded-lg border border-gray-200">
        <div className="flex-shrink-0 px-4 py-2 bg-white border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Zone Details</h2>
          <div className="text-xs text-gray-600">
            {canPanX || canPanY ? 'Drag background to pan' : 'All tables fit'}
          </div>
        </div>

        <div
          ref={scrollRef}
          className={[
            'flex-1 relative',
            canPanX ? 'overflow-x-auto' : 'overflow-x-hidden',
            canPanY ? 'overflow-y-auto' : 'overflow-y-hidden',
            canPanX || canPanY ? (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab') : 'cursor-default'
          ].join(' ')}
          onMouseDown={startDrag}
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >
          <div className="w-full h-full">
            <div
              className="relative bg-gray-50"
              style={{ width: worldWidth, height: worldHeight, minWidth: '100%', minHeight: '100%' }}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle,#94a3b8 2px,transparent 2px)', backgroundSize: '30px 30px' }}
              />

              {/* Tables */}
              {normItems.map((t) => {
                const avg = feedbackMap[t.table_number];
                const feedbackStatus = getFeedbackStatus(avg);
                const cfg = getTableShapeClasses(t.shape, feedbackStatus);
                return (
                  <div
                    key={t.id}
                    className="absolute"
                    style={{ left: t.normX, top: t.normY }}
                    onMouseDown={(e) => e.stopPropagation()} // don't start drag when clicking tables
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
