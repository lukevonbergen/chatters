// src/components/dashboard/reports/SatisfactionTrendTile.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { supabase } from '../../../utils/supabase';

const sod = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const eod = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

function getRange(preset, fromStr, toStr) {
  const now = new Date();
  switch (preset) {
    case 'today': {
      const s = sod(now), e = eod(now);
      return { startISO: s.toISOString(), endISO: e.toISOString(), hourly: true, baseDate: s };
    }
    case 'yesterday': {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      const s = sod(y), e = eod(y);
      return { startISO: s.toISOString(), endISO: e.toISOString(), hourly: true, baseDate: s };
    }
    case 'last7': {
      const s = new Date(now); s.setDate(now.getDate() - 6);
      return { startISO: sod(s).toISOString(), endISO: eod(now).toISOString(), hourly: false };
    }
    case 'last30': {
      const s = new Date(now); s.setDate(now.getDate() - 29);
      return { startISO: sod(s).toISOString(), endISO: eod(now).toISOString(), hourly: false };
    }
    case 'custom': {
      const s = fromStr ? sod(new Date(fromStr)) : sod(new Date(0));
      const e = toStr ? eod(new Date(toStr)) : eod(now);
      const hourly = s.toDateString() === sod(new Date(e)).toDateString();
      return { startISO: s.toISOString(), endISO: e.toISOString(), hourly, baseDate: s };
    }
    default: {
      const s = sod(new Date(0)), e = eod(now);
      return { startISO: s.toISOString(), endISO: e.toISOString(), hourly: false };
    }
  }
}

function buildHourBuckets(baseDate) {
  const base = sod(baseDate);
  const buckets = [];
  for (let h = 0; h <= 23; h++) {
    const label = new Date(base);
    label.setHours(h, 0, 0, 0);
    buckets.push({ hour: h, labelTs: label.getTime(), average: null });
  }
  return buckets;
}

function buildDayBuckets(startISO, endISO) {
  const start = sod(new Date(startISO));
  const end = eod(new Date(endISO));
  const buckets = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const label = new Date(d);
    label.setHours(12, 0, 0, 0);
    buckets.push({ labelTs: label.getTime(), average: null });
  }
  return buckets;
}

export default function SatisfactionTrendTile({ venueId }) {
  const [preset, setPreset] = useState('last30');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]); // [{labelTs:number, average:number|null, hour?:number}]
  const pollRef = useRef(null);

  async function fetchData() {
    if (!venueId) return;

    const { startISO, endISO, hourly, baseDate } = getRange(preset, fromDate, toDate);
    setLoading(true);

    const { data, error } = await supabase
      .from('feedback')
      .select('created_at, rating')
      .eq('venue_id', venueId)
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .not('rating', 'is', null)
      .order('created_at');

    if (error) {
      console.error('SatisfactionTrend fetch error:', error);
      setSeries([]);
      setLoading(false);
      return;
    }

    const rows = data || [];

    if (hourly) {
      const buckets = buildHourBuckets(baseDate);
      const sums = new Array(24).fill(0);
      const counts = new Array(24).fill(0);

      for (const row of rows) {
        const hr = new Date(row.created_at).getHours();
        sums[hr] += Number(row.rating);
        counts[hr] += 1;
      }

      const built = buckets.map((b, hr) => ({
        hour: hr,
        labelTs: b.labelTs,
        average: counts[hr] ? +(sums[hr] / counts[hr]).toFixed(2) : null,
      }));

      setSeries(built);
    } else {
      const buckets = buildDayBuckets(startISO, endISO);
      const index = new Map(); // 'YYYY-MM-DD' -> {sum,count}

      for (const row of rows) {
        const d = new Date(row.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const cur = index.get(key) || { sum: 0, count: 0 };
        cur.sum += Number(row.rating);
        cur.count += 1;
        index.set(key, cur);
      }

      const built = buckets.map(b => {
        const d = new Date(b.labelTs);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const cur = index.get(key);
        return { labelTs: b.labelTs, average: cur ? +(cur.sum / cur.count).toFixed(2) : null };
      });

      setSeries(built);
    }

    setLoading(false);
  }

  // Fetch whenever inputs change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, preset, fromDate, toDate]);

  // Poll every 30s for Today
  useEffect(() => {
    if (preset !== 'today') {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(fetchData, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, venueId, fromDate, toDate]);

  const isHourly = useMemo(() => {
    if (preset === 'today' || preset === 'yesterday') return true;
    if (preset === 'custom' && fromDate && toDate && fromDate === toDate) return true;
    return false;
  }, [preset, fromDate, toDate]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Satisfaction Trend</h3>
          <p className="text-xs text-gray-600 mt-1">
            {isHourly ? 'Hourly average satisfaction' : 'Daily average satisfaction over time'}
          </p>
        </div>

        {/* Range control */}
        <div className="min-w-[170px]">
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

      {/* Custom pickers */}
      {preset === 'custom' && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs"
          />
          <span className="text-xs text-gray-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs"
          />
        </div>
      )}

      {/* Chart */}
      <div className="mt-4 h-64">
        {loading ? (
          <div className="h-full bg-gray-50 border border-dashed border-gray-200 rounded-md animate-pulse" />
        ) : series.length && series.some(d => d.average != null) ? (

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

              <XAxis
                dataKey="labelTs"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => {
                  const d = new Date(ts);
                  return isHourly
                    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
                }}
                stroke="#64748B"
                fontSize={12}
                tick={{ fill: '#64748B' }}
                allowDuplicatedCategory={false}
                tickCount={6}
              />

              <YAxis
                domain={[0, 5]}   // 👈 start from 0
                stroke="#64748B"
                fontSize={12}
                tick={{ fill: '#64748B' }}
                allowDecimals={false}
                width={32}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(v) => [v, isHourly ? 'Hourly Avg' : 'Daily Avg']}
                labelFormatter={(ts) => {
                  const d = new Date(ts);
                  return isHourly
                    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
                    : d.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                }}
              />

              <Area
                type="linear"
                dataKey="average"
                stroke="#0f172a"        // black line
                fill="url(#colorBlack)" // black gradient fill
                strokeWidth={2}
                connectNulls={true}     // 👈 draw continuous line, no gaps
                isAnimationActive={false}
                dot={{ r: 2, fill: '#0f172a', strokeWidth: 0 }}
                activeDot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: 'white' }}
                name={isHourly ? 'Hourly Avg' : 'Daily Avg'}
              />

              <defs>
                <linearGradient id="colorBlack" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>


        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 border border-dashed border-gray-200 rounded-md">
            <div className="text-center">
              <p className="text-sm mb-1 text-slate-600">No trend data available</p>
              <p className="text-xs text-slate-500">Trends will appear as feedback is collected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}