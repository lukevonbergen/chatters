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
  // Fixed to today
  const preset = 'today';

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
        const { start, end } = rangeISO(preset);

        // Fetch feedback sessions
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('session_id, is_actioned, dismissed, created_at, resolved_at')
          .eq('venue_id', venueId)
          .or(`and(resolved_at.gte.${start},resolved_at.lte.${end}),and(resolved_at.is.null,created_at.gte.${start},created_at.lte.${end})`);

        // Fetch assistance requests
        const { data: assistanceData, error: assistanceError } = await supabase
          .from('assistance_requests')
          .select('id, status, created_at, resolved_at')
          .eq('venue_id', venueId)
          .or(`and(resolved_at.gte.${start},resolved_at.lte.${end}),and(resolved_at.is.null,created_at.gte.${start},created_at.lte.${end})`);

        if (feedbackError || assistanceError) throw feedbackError || assistanceError;

        let total = 0;
        let resolved = 0;

        // Process feedback sessions
        if (feedbackData?.length) {
          const sessions = new Map();
          for (const row of feedbackData) {
            if (!sessions.has(row.session_id)) sessions.set(row.session_id, []);
            sessions.get(row.session_id).push(row);
          }

          for (const rows of sessions.values()) {
            // effective timestamp
            let latestTs = 0;
            for (const r of rows) {
              const ts = new Date(r.resolved_at ?? r.created_at).getTime();
              if (ts > latestTs) latestTs = ts;
            }

            // Make sure the session actually falls in range
            const { start: sISO, end: eISO } = rangeISO(preset);
            const sMs = new Date(sISO).getTime();
            const eMs = new Date(eISO).getTime();
            if (latestTs < sMs || latestTs > eMs) continue;

            total += 1;

            const allActioned = rows.every(x => x.is_actioned === true);
            const allDismissed = rows.every(x => x.dismissed === true);
            if (allActioned || allDismissed) resolved += 1;
          }
        }

        // Process assistance requests
        if (assistanceData?.length) {
          for (const request of assistanceData) {
            const ts = new Date(request.resolved_at ?? request.created_at).getTime();
            
            // Make sure the request falls in range
            const { start: sISO, end: eISO } = rangeISO(preset);
            const sMs = new Date(sISO).getTime();
            const eMs = new Date(eISO).getTime();
            if (ts < sMs || ts > eMs) continue;

            total += 1;

            if (request.status === 'resolved' || request.resolved_at !== null) {
              resolved += 1;
            }
          }
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
  }, [venueId, propActionedCount, propTotalCount]);

  const rate = useMemo(() => {
    if (!totalCount) return 0;
    return (actionedCount / totalCount) * 100;
  }, [actionedCount, totalCount]);

  const rateTextClass = rate >= 80 ? 'text-green-600' : 'text-gray-900';
  const subline = loading
    ? 'Loading…'
    : `${actionedCount}/${totalCount} items resolved (feedback + assistance)`;

  return (
    <div className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Completion Rate</h3>
        <p className="text-gray-600 text-xs mt-1">Today's share of feedback & assistance fully resolved</p>
      </div>

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