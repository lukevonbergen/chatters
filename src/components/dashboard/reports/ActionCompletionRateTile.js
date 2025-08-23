// src/components/dashboard/reports/ActionCompletionRateTile.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../utils/supabase';

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function toISO(d) { return d.toISOString(); }

function rangeISO(preset, fromStr, toStr) {
  const now = new Date();
  switch (preset) {
    case 'today':     return { start: toISO(startOfDay(now)), end: toISO(endOfDay(now)) };
    case 'yesterday': {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      return { start: toISO(startOfDay(y)), end: toISO(endOfDay(y)) };
    }
    case 'last7':  { const s = new Date(now); s.setDate(now.getDate() - 6);  return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) }; }
    case 'last30': { const s = new Date(now); s.setDate(now.getDate() - 29); return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) }; }
    case 'custom': {
      const s = fromStr ? startOfDay(new Date(fromStr)) : startOfDay(new Date(0));
      const e = toStr   ? endOfDay(new Date(toStr))     : endOfDay(now);
      return { start: toISO(s), end: toISO(e) };
    }
    default: return { start: toISO(startOfDay(new Date(0))), end: toISO(endOfDay(now)) };
  }
}

export default function ActionCompletionRateTile({
  venueId,
  actionedCount: propActionedCount,
  totalCount: propTotalCount,
}) {
  // filter UI
  const [preset, setPreset] = useState('today'); // today | yesterday | last7 | last30 | custom
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // data
  const [actionedCount, setActionedCount] = useState(propActionedCount ?? 0);
  const [totalCount, setTotalCount] = useState(propTotalCount ?? 0);
  const [loading, setLoading] = useState(!(propActionedCount || propTotalCount));

  useEffect(() => {
    // If parent provided numbers, just show them (no fetching)
    if (propActionedCount != null && propTotalCount != null) {
      setActionedCount(propActionedCount);
      setTotalCount(propTotalCount);
      setLoading(false);
      return;
    }
    if (!venueId) return;

    const run = async () => {
      setLoading(true);
      try {
        const { start, end } = rangeISO(preset, fromDate, toDate);

        // Pull needed fields to compute session status + timestamp
        const { data, error } = await supabase
          .from('feedback')
          .select('session_id, is_actioned, dismissed, created_at, resolved_at')
          .eq('venue_id', venueId)
          // quick coarse filter to reduce rows early using resolved_at where present
          .or(`and(resolved_at.gte.${start},resolved_at.lte.${end}),and(resolved_at.is.null,created_at.gte.${start},created_at.lte.${end})`);

        if (error) throw error;

        if (!data?.length) {
          setActionedCount(0);
          setTotalCount(0);
          return;
        }

        // Group rows by session_id
        const sessions = new Map();
        for (const row of data) {
          if (!sessions.has(row.session_id)) sessions.set(row.session_id, []);
          sessions.get(row.session_id).push(row);
        }

        // Compute session effective timestamp = max(resolved_at || created_at)
        // and whether the session is fully resolved (all actioned OR all dismissed)
        let total = 0;
        let resolved = 0;

        for (const rows of sessions.values()) {
          // effective timestamp
          let latestTs = 0;
          for (const r of rows) {
            const ts = new Date(r.resolved_at ?? r.created_at).getTime();
            if (ts > latestTs) latestTs = ts;
          }

          // Make sure the session actually falls in range (safety if the coarse filter lets something through)
          const { start: sISO, end: eISO } = rangeISO(preset, fromDate, toDate);
          const sMs = new Date(sISO).getTime();
          const eMs = new Date(eISO).getTime();
          if (latestTs < sMs || latestTs > eMs) continue;

          total += 1;

          const allActioned = rows.every(x => x.is_actioned === true);
          const allDismissed = rows.every(x => x.dismissed === true);
          if (allActioned || allDismissed) resolved += 1;
        }

        setActionedCount(resolved);
        setTotalCount(total);
      } catch (e) {
        console.error('ActionCompletionRateTile fetch error:', e);
        setActionedCount(0);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [venueId, propActionedCount, propTotalCount, preset, fromDate, toDate]);

  const rate = useMemo(() => {
    if (!totalCount) return 0;
    return (actionedCount / totalCount) * 100;
  }, [actionedCount, totalCount]);

  const rateTextClass = rate >= 80 ? 'text-green-600' : 'text-gray-900';
  const subline = loading
    ? 'Loading…'
    : `${actionedCount}/${totalCount} sessions resolved`;

  return (
    <div className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Completion Rate</h3>
          <p className="text-gray-600 text-xs mt-1">Share of sessions fully resolved</p>
        </div>

        {/* Styled dropdown to mirror Avg Resolution tile */}
        <div className="min-w-[150px]">
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="custom">Custom…</option>
          </select>
        </div>
      </div>

      {/* Custom date pickers */}
      {preset === 'custom' && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs"
            placeholder="From"
          />
          <span className="text-xs text-gray-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs"
            placeholder="To"
          />
        </div>
      )}

      {/* Metric */}
      <div className="mt-4 flex items-end justify-between">
        <div className={`text-2xl font-bold ${rateTextClass}`}>
          {loading ? '—' : `${rate.toFixed(1)}%`}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">{subline}</div>
        </div>
      </div>
    </div>
  );
}