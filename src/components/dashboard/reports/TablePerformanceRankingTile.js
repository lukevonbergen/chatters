import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { MapPin, BarChart3 } from 'lucide-react';

export default function TablePerformanceRankingTile({ venueId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchTablePerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  async function fetchTablePerformance() {
    setLoading(true);

    const { data, error } = await supabase
      .from('feedback')
      .select('table_number, rating')
      .eq('venue_id', venueId)
      .not('rating', 'is', null)
      .not('table_number', 'is', null);

    if (error) {
      console.error('Error fetching table performance:', error);
      setRows([]);
      setLoading(false);
      return;
    }

    // Group by table
    const byTable = new Map();
    (data || []).forEach(r => {
      const t = String(r.table_number);
      const val = Number(r.rating);
      if (!Number.isFinite(val)) return;
      if (!byTable.has(t)) byTable.set(t, []);
      byTable.get(t).push(val);
    });

    // Compute stats
    const stats = Array.from(byTable.entries()).map(([table, ratings]) => {
      const total = ratings.length;
      const avg = total ? +(ratings.reduce((s, v) => s + v, 0) / total).toFixed(2) : 0;
      // Count distribution 5→1
      const dist = [5,4,3,2,1].map(star => ratings.filter(v => v === star).length);
      return { table, average: avg, totalFeedback: total, dist };
    });

    // Sort: avg desc, then volume desc, then table asc (stable-ish)
    stats.sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      if (b.totalFeedback !== a.totalFeedback) return b.totalFeedback - a.totalFeedback;
      return a.table.localeCompare(b.table, undefined, { numeric: true, sensitivity: 'base' });
    });

    setRows(stats);
    setLoading(false);
  }

  const noData = !loading && rows.length === 0;

  // Greyscale accent blocks (match PeakHoursAnalysisTile aesthetic)
  const band = (intensity) => {
    // intensity 0..1 → alpha 0.1..1 for visibility
    const a = intensity === 0 ? 0.08 : 0.15 + 0.85 * Math.min(1, Math.max(0, intensity));
    return { backgroundColor: `rgba(15, 23, 42, ${a})` }; // slate-900 w/ variable alpha
  };

  // Footer quick facts
  const best = rows[0];
  const worst = rows[rows.length - 1];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            Table Performance Ranking
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Ranked by average rating
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-md animate-pulse" />
          ))}
        </div>
      ) : noData ? (
        <div className="text-center py-10">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <div className="text-sm text-gray-600">No table data yet — rankings will appear once feedback comes in.</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {rows.map((r, idx) => (
            <div
              key={r.table}
              className="rounded-md border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              title={`Table ${r.table} • ${r.average}★ avg from ${r.totalFeedback} responses`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: rank + table */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 w-8 text-right">#{idx + 1}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">Table {r.table}</div>
                    <div className="text-[11px] text-gray-600">{r.totalFeedback} response{r.totalFeedback !== 1 ? 's' : ''}</div>
                  </div>
                </div>


                {/* Right: average */}
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 tabular-nums">{r.average}</div>
                  <div className="text-[11px] text-gray-600">avg rating</div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}