import React from 'react';

// Custom slow pulse animation
const slowPulseStyle = { animation: 'slow-pulse 3s cubic-bezier(0.4,0,0.6,1) infinite' };
const pulseKeyframes = `
@keyframes slow-pulse {
  0%,100% { opacity: 1; }
  50% { opacity: .3; }
}
`;

// --- helpers (same idea as sidebar) ---
const getRowRating = (row) => {
  const cand = row.session_rating ?? row.rating ?? row.score ?? null;
  const num = typeof cand === 'number' ? cand : Number(cand);
  return Number.isFinite(num) ? num : null;
};

const groupBySession = (rows) => {
  const map = new Map();
  for (const r of rows || []) {
    const sid = r.session_id ?? r.sessionId;
    if (!sid) continue;
    const entry = map.get(sid) || {
      session_id: sid,
      table_number: r.table_number ?? r.tableNumber ?? '—',
      created_at: r.created_at,
      items_count: 0,
      ratings: [],
      has_comment: false,
    };

    entry.items_count += 1;
    if (!entry.created_at || new Date(r.created_at) > new Date(entry.created_at)) {
      entry.created_at = r.created_at;
    }
    const rating = getRowRating(r);
    if (rating !== null) entry.ratings.push(rating);

    const comment = r.additional_feedback?.trim();
    if (comment) entry.has_comment = true;

    map.set(sid, entry);
  }

  return Array.from(map.values()).map((e) => ({
    session_id: e.session_id,
    table_number: e.table_number,
    created_at: e.created_at,
    items_count: e.items_count,
    session_rating:
      e.ratings.length > 0 ? e.ratings.reduce((a, b) => a + b, 0) / e.ratings.length : null,
    has_comment: e.has_comment,
  }));
};

// --- main component ---
const KioskZoneOverview = ({ zones, tables, feedbackMap, feedbackList, onZoneSelect }) => {
  // Pre-group the entire feedback list once (like sidebar)
  const sessions = React.useMemo(() => groupBySession(feedbackList), [feedbackList]);

  // Build per-zone metrics and sort zones by priority
  const zonesWithMeta = React.useMemo(() => {
    return (zones || []).map((zone) => {
      const zoneTables = tables.filter((t) => t.zone_id === zone.id);
      const tableNumbers = new Set(zoneTables.map((t) => t.table_number));

      // sessions that belong to this zone (match on table_number)
      const zoneSessions = sessions.filter((s) => tableNumbers.has(s.table_number));

      // derive counts like sidebar urgency rules
      const urgentCount = zoneSessions.filter((s) => s.session_rating != null && s.session_rating <= 2).length;
      const attentionCount = zoneSessions.filter(
        (s) => s.session_rating != null && s.session_rating <= 3 && s.has_comment
      ).length;
      const totalAlerts = zoneSessions.length;

      // priority band: 2 (urgent) > 1 (has alerts) > 0 (all good)
      const priority =
        urgentCount > 0 ? 2 : totalAlerts > 0 ? 1 : 0;

      return {
        zone,
        zoneTables,
        totalAlerts,
        urgentCount,
        attentionCount,
        priority,
      };
    })
    // sort by priority desc, then urgent desc, then total desc, then name asc
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.urgentCount !== a.urgentCount) return b.urgentCount - a.urgentCount;
      if (b.totalAlerts !== a.totalAlerts) return b.totalAlerts - a.totalAlerts;
      return (a.zone.name || '').localeCompare(b.zone.name || '');
    });
  }, [zones, tables, sessions]);

  const getFeedbackStatus = (avg) => {
    if (avg === null || avg === undefined) {
      return { borderColor: 'border-gray-800', bgColor: 'bg-gray-700', status: 'no-feedback' };
    }
    if (avg > 4) return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    if (avg >= 2.5) return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    return { borderColor: 'border-red-500', bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  // Denser, more compact visual for overview
  const getTableShapeClasses = (shape, feedbackStatus) => {
    const base = `text-white flex items-center justify-center font-semibold border-2 shadow-sm transition-all duration-150 cursor-pointer hover:opacity-90 ${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};

    switch (shape) {
      case 'circle':
        return { className: `${base} w-10 h-10 text-xs rounded-full`, style: pulseStyle };
      case 'long':
        return { className: `${base} w-16 h-7 text-[11px] rounded-md`, style: pulseStyle };
      default:
        return { className: `${base} w-10 h-10 text-xs rounded-md`, style: pulseStyle };
    }
  };

  const renderTable = (table) => {
    const avgRating = feedbackMap[table.table_number];
    const feedbackStatus = getFeedbackStatus(avgRating);
    const cfg = getTableShapeClasses(table.shape, feedbackStatus);

    const statusText =
      feedbackStatus.status === 'happy' ? 'Table Happy' :
      feedbackStatus.status === 'attention' ? 'Table Needs Attention' :
      feedbackStatus.status === 'unhappy' ? 'Table Unhappy' :
      'No Feedback Submitted';

    return (
      <div
        key={table.id}
        className="relative"
        onClick={() => onZoneSelect(table.zone_id)}
        title={`Table ${table.table_number} — ${statusText} — Click to view zone`}
      >
        <div className={cfg.className} style={cfg.style}>
          {table.table_number}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{pulseKeyframes}</style>

      <div className="h-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Zones Overview</h2>
          <p className="text-gray-600">Click any table to jump to its zone</p>
        </div>

        {zonesWithMeta.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No zones configured</p>
            <p className="text-gray-400 text-sm">Contact your administrator to set up floor plan zones</p>
          </div>
        ) : (
          <div className="space-y-6">
            {zonesWithMeta.map(({ zone, zoneTables, totalAlerts, urgentCount }) => (
              <div key={zone.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{zone.name}</h3>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {zoneTables.length} table{zoneTables.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Alert badges based on grouped sessions */}
                  <div className="flex items-center gap-2">
                    {urgentCount > 0 && (
                      <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                        {urgentCount} URGENT
                      </span>
                    )}
                    {urgentCount === 0 && totalAlerts > 0 && (
                      <span className="bg-yellow-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {totalAlerts} ALERT{totalAlerts > 1 ? 'S' : ''}
                      </span>
                    )}
                    {totalAlerts === 0 && (
                      <span className="bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        ALL GOOD
                      </span>
                    )}
                  </div>
                </div>

                {/* Tables Grid (denser + responsive auto-fill) */}
                {zoneTables.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No tables in this zone</p>
                  </div>
                ) : (
                  <div
                    className="grid gap-1.5"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))' }}
                  >
                    {zoneTables.map((table) => renderTable(table))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default KioskZoneOverview;
