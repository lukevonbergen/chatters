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
      return { borderColor: 'border-gray-300', bgColor: 'bg-gray-700', status: 'no-feedback' };
    }
    if (avg > 4) return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    if (avg >= 2.5) return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    return { borderColor: 'border-red-500', bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  // Clean, professional table design
  const getTableShapeClasses = (shape, feedbackStatus) => {
    const baseClasses = 'text-white flex items-center justify-center font-semibold border-2 transition-all duration-200 cursor-pointer hover:scale-105';
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};

    const statusColors = `${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;

    switch (shape) {
      case 'circle':
        return { 
          className: `${baseClasses} ${statusColors} w-10 h-10 text-xs rounded-full shadow-sm`, 
          style: pulseStyle 
        };
      case 'long':
        return { 
          className: `${baseClasses} ${statusColors} w-16 h-6 text-xs rounded`, 
          style: pulseStyle 
        };
      default:
        return { 
          className: `${baseClasses} ${statusColors} w-10 h-10 text-xs rounded`, 
          style: pulseStyle 
        };
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

  const getZoneCardBorder = (urgentCount, totalAlerts) => {
    if (urgentCount > 0) return 'border-red-200 bg-red-50';
    if (totalAlerts > 0) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <>
      <style>{pulseKeyframes}</style>

      <div className="h-full bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Zone Overview</h1>
          <p className="text-gray-600">Monitor all zones and click any table to view detailed feedback</p>
        </div>

        {zonesWithMeta.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No zones configured</h3>
            <p className="text-gray-500">Contact your administrator to configure floor plan zones</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-6xl">
            {zonesWithMeta.map(({ zone, zoneTables, totalAlerts, urgentCount }) => (
              <div 
                key={zone.id} 
                className={`rounded-lg border p-6 transition-all duration-200 ${getZoneCardBorder(urgentCount, totalAlerts)}`}
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {zoneTables.length} table{zoneTables.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center gap-3">
                    {urgentCount > 0 && (
                      <div className="bg-red-600 text-white text-sm font-medium px-3 py-1 rounded">
                        {urgentCount} Urgent
                      </div>
                    )}
                    {urgentCount === 0 && totalAlerts > 0 && (
                      <div className="bg-yellow-600 text-white text-sm font-medium px-3 py-1 rounded">
                        {totalAlerts} Alert{totalAlerts > 1 ? 's' : ''}
                      </div>
                    )}
                    {totalAlerts === 0 && (
                      <div className="bg-green-600 text-white text-sm font-medium px-3 py-1 rounded">
                        Operational
                      </div>
                    )}
                  </div>
                </div>

                {/* Tables Grid */}
                {zoneTables.length === 0 ? (
                  <div className="text-center py-8 bg-gray-100 rounded border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No tables configured in this zone</p>
                  </div>
                ) : (
                  <div className="bg-white rounded border p-4">
                    <div
                      className="grid gap-2"
                      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))' }}
                    >
                      {zoneTables.map((table) => renderTable(table))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status Legend */}
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-700 border-2 border-red-500 rounded"></div>
              <span className="text-gray-700">Unhappy (≤2.0)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-700 border-2 border-yellow-500 rounded"></div>
              <span className="text-gray-700">Needs Attention (2.5-3.0)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-700 border-2 border-green-500 rounded"></div>
              <span className="text-gray-700">Satisfied (+4.0)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-700 border-2 border-gray-300 rounded"></div>
              <span className="text-gray-700">No Recent Feedback</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KioskZoneOverview;