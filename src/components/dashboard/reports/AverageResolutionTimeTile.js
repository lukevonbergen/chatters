import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../utils/supabase';

const TARGET_MINUTES = 120;

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }

function toISO(d) { return d.toISOString(); }

function rangeISO(preset, fromStr, toStr) {
  const now = new Date();
  switch (preset) {
    case 'today': {
      return { start: toISO(startOfDay(now)), end: toISO(endOfDay(now)) };
    }
    case 'yesterday': {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      return { start: toISO(startOfDay(y)), end: toISO(endOfDay(y)) };
    }
    case 'last7': {
      const s = new Date(now); s.setDate(now.getDate() - 6);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'last30': {
      const s = new Date(now); s.setDate(now.getDate() - 29);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'custom': {
      const s = fromStr ? startOfDay(new Date(fromStr)) : startOfDay(new Date(0));
      const e = toStr ? endOfDay(new Date(toStr)) : endOfDay(now);
      return { start: toISO(s), end: toISO(e) };
    }
    default:
      return { start: toISO(startOfDay(new Date(0))), end: toISO(endOfDay(now)) };
  }
}

async function fetchAvgResolutionMinutes(venueId, startISO, endISO) {
  const { data, error } = await supabase
    .from('feedback')
    .select('created_at, resolved_at')
    .eq('venue_id', venueId)
    .not('resolved_at', 'is', null)
    .gte('resolved_at', startISO)
    .lte('resolved_at', endISO);

  if (error) {
    console.error('Error fetching resolution times:', error);
   return { avg: 0, count: 0 };
  }
  if (!data?.length) return { avg: 0, count: 0 };

  const minutes = data.map(r => (new Date(r.resolved_at) - new Date(r.created_at)) / (1000 * 60));
  const avg = minutes.reduce((a, b) => a + b, 0) / minutes.length;
  return { avg, count: data.length };
}

function formatTime(minutes) {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  return h ? `${d}d ${h}h` : `${d}d`;
}

export default function AverageResolutionTimeTile({ venueId }) {
  const [preset, setPreset] = useState('today'); // today | yesterday | last7 | last30 | custom
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [baselineAvg, setBaselineAvg] = useState(0); // for delta when preset is 'today' or 'yesterday'
  const [loading, setLoading] = useState(false);

  // decide baseline window (yesterday vs previous period)
  function baselineRange() {
    const now = new Date();
    if (preset === 'today') {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      return rangeISO('yesterday');
    }
    if (preset === 'yesterday') {
      const d2 = new Date(now); d2.setDate(now.getDate() - 2);
      return { start: toISO(startOfDay(d2)), end: toISO(endOfDay(d2)) };
    }
    // for ranges, compare to immediately preceding same length
    if (preset === 'last7') {
      const s = new Date(now); s.setDate(now.getDate() - 13);
      const e = new Date(now); e.setDate(now.getDate() - 7);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(e)) };
    }
    if (preset === 'last30') {
      const s = new Date(now); s.setDate(now.getDate() - 59);
      const e = new Date(now); e.setDate(now.getDate() - 30);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(e)) };
    }
    if (preset === 'custom' && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diff = Math.max(0, Math.ceil((to - from) / (1000 * 60 * 60 * 24))); // days
      const prevEnd = new Date(from); prevEnd.setDate(from.getDate() - 1);
      const prevStart = new Date(prevEnd); prevStart.setDate(prevEnd.getDate() - diff);
      return { start: toISO(startOfDay(prevStart)), end: toISO(endOfDay(prevEnd)) };
    }
    return null;
  }

  useEffect(() => {
    if (!venueId) return;

    const run = async () => {
      setLoading(true);
      const { start, end } = rangeISO(preset, fromDate, toDate);
      const base = baselineRange();

      const [main, baseData] = await Promise.all([
        fetchAvgResolutionMinutes(venueId, start, end),
        base ? fetchAvgResolutionMinutes(venueId, base.start, base.end) : Promise.resolve({ avg: 0, count: 0 }),
      ]);

      setAvg(main.avg || 0);
      setCount(main.count || 0);
      setBaselineAvg(baseData.avg || 0);
      setLoading(false);
    };

    run();
  }, [venueId, preset, fromDate, toDate]);

  const progress = useMemo(() => {
    if (avg === 0) return 100;
    const pct = Math.max(0, ((TARGET_MINUTES - avg) / TARGET_MINUTES) * 100);
    return Math.min(100, pct);
  }, [avg]);

  const delta = useMemo(() => {
    if (!baselineAvg) return null;
    const d = ((avg - baselineAvg) / baselineAvg) * 100; // + = slower
    return Math.round(d);
  }, [avg, baselineAvg]);

  const deltaColor = delta != null
    ? (delta <= 0 ? 'text-green-600' : 'text-gray-900')
    : 'text-gray-900';

  return (
    <div className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Avg. Resolution Time</h3>
          <p className="text-gray-600 text-xs mt-1">Time taken to resolve feedback</p>
        </div>

        {/* Styled dropdown */}
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

      {/* Metric row */}
      <div className="mt-4 flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">
          {loading ? '—' : formatTime(avg)}
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold ${delta != null ? deltaColor : 'text-gray-900'}`}>
            {delta == null ? '—' : `${delta <= 0 ? '-' : '+'}${Math.abs(delta)}%`}
          </div>
          <div className="text-xs text-gray-600">
            {preset === 'today' ? 'vs yesterday'
              : preset === 'yesterday' ? 'vs day before'
              : preset === 'last7' ? 'vs prior 7'
              : preset === 'last30' ? 'vs prior 30'
              : preset === 'custom' && fromDate && toDate ? 'vs previous window'
              : '—'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-2 rounded-full bg-green-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Footnote */}
      <div className="mt-2 text-xs text-gray-500">
        {loading ? 'Loading…' : `${count} feedback ${count === 1 ? 'item' : 'items'} resolved`}
      </div>
    </div>
  );
}