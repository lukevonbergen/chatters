import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
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
    case 'thisWeek': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return { start: toISO(startOfDay(startOfWeek)), end: toISO(endOfDay(now)) };
    }
    case 'last7': {
      const s = new Date(now); s.setDate(now.getDate() - 6);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'last14': {
      const s = new Date(now); s.setDate(now.getDate() - 13);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'last30': {
      const s = new Date(now); s.setDate(now.getDate() - 29);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'all': {
      return { start: toISO(startOfDay(new Date(0))), end: toISO(endOfDay(now)) };
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
  // Fetch resolved feedback sessions
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('feedback')
    .select('session_id, created_at, resolved_at')
    .eq('venue_id', venueId)
    .not('resolved_at', 'is', null)
    .gte('resolved_at', startISO)
    .lte('resolved_at', endISO);

  // Fetch resolved assistance requests
  const { data: assistanceData, error: assistanceError } = await supabase
    .from('assistance_requests')
    .select('created_at, resolved_at')
    .eq('venue_id', venueId)
    .not('resolved_at', 'is', null)
    .gte('resolved_at', startISO)
    .lte('resolved_at', endISO);

  if (feedbackError || assistanceError) {
    console.error('Error fetching resolution times:', feedbackError || assistanceError);
    return { avg: 0, count: 0 };
  }

  // Group feedback by session_id to get one resolution time per session
  const sessionResolutions = [];
  if (feedbackData?.length) {
    const sessionMap = new Map();
    feedbackData.forEach(item => {
      if (!sessionMap.has(item.session_id)) {
        sessionMap.set(item.session_id, {
          created_at: item.created_at,
          resolved_at: item.resolved_at
        });
      }
    });
    sessionResolutions.push(...sessionMap.values());
  }

  // Combine session resolutions with assistance request resolutions
  const allResolutions = [
    ...sessionResolutions,
    ...(assistanceData || [])
  ];

  if (!allResolutions.length) return { avg: 0, count: 0 };

  const minutes = allResolutions.map(r => (new Date(r.resolved_at) - new Date(r.created_at)) / (1000 * 60));
  const avg = minutes.reduce((a, b) => a + b, 0) / minutes.length;
  return { avg, count: allResolutions.length };
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

export default function AverageResolutionTimeTile({ venueId, timeframe = 'last7' }) {
  const preset = timeframe;

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
    if (preset === 'thisWeek') {
      const prevWeekStart = new Date(now); prevWeekStart.setDate(now.getDate() - now.getDay() - 7);
      const prevWeekEnd = new Date(now); prevWeekEnd.setDate(now.getDate() - now.getDay() - 1);
      return { start: toISO(startOfDay(prevWeekStart)), end: toISO(endOfDay(prevWeekEnd)) };
    }
    if (preset === 'last7') {
      const s = new Date(now); s.setDate(now.getDate() - 13);
      const e = new Date(now); e.setDate(now.getDate() - 7);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(e)) };
    }
    if (preset === 'last14') {
      const s = new Date(now); s.setDate(now.getDate() - 27);
      const e = new Date(now); e.setDate(now.getDate() - 14);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(e)) };
    }
    if (preset === 'last30') {
      const s = new Date(now); s.setDate(now.getDate() - 59);
      const e = new Date(now); e.setDate(now.getDate() - 30);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(e)) };
    }
    // Custom preset not supported in simplified version
    return null;
  }

  useEffect(() => {
    if (!venueId) return;

    const run = async () => {
      setLoading(true);
      const { start, end } = rangeISO(preset);
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
  }, [venueId, timeframe]);

  const progress = useMemo(() => {
    if (avg === 0) return 100;
    const pct = Math.max(0, ((TARGET_MINUTES - avg) / TARGET_MINUTES) * 100);
    return Math.min(100, pct);
  }, [avg]);

  const delta = useMemo(() => {
    if (!baselineAvg || baselineAvg === 0) return null;
    const d = ((avg - baselineAvg) / baselineAvg) * 100; // + = slower (worse)
    return Math.round(d);
  }, [avg, baselineAvg]);

  const deltaColor = delta != null
    ? (delta <= 0 ? 'text-green-600' : 'text-gray-900')
    : 'text-gray-900';

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        {delta !== null && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            delta <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {delta <= 0 ? delta : `+${delta}`}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {loading ? '—' : formatTime(avg)}
      </div>
      <div className="text-sm text-gray-600">
        Avg. Resolution Time
      </div>
    </div>
  );
}