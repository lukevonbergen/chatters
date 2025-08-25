import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { BarChart3, Star, Users } from 'lucide-react';

export default function RatingDistributionTile({ venueId }) {
  const [rows, setRows] = useState([]); // [{rating, count, pct}]
  const [total, setTotal] = useState(0);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchRatingDistribution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  async function fetchRatingDistribution() {
    setLoading(true);

    const { data, error } = await supabase
      .from('feedback')
      .select('rating')
      .eq('venue_id', venueId)
      .not('rating', 'is', null)
      .gte('rating', 1)
      .lte('rating', 5);

    if (error) {
      console.error('Error fetching rating distribution:', error);
      setRows([]); setTotal(0); setAvg(0);
      setLoading(false);
      return;
    }

    const counts = [0,0,0,0,0,0]; // index 1..5
    let n = 0, sum = 0;

    (data || []).forEach(({ rating }) => {
      const r = Number(rating);
      if (Number.isFinite(r) && r >= 1 && r <= 5) {
        counts[r] += 1; n += 1; sum += r;
      }
    });

    const dist = [5,4,3,2,1].map(r => ({
      rating: r,
      count: counts[r],
      pct: n ? +( (counts[r] / n) * 100 ).toFixed(1) : 0,
    }));

    setRows(dist);
    setTotal(n);
    setAvg(n ? +(sum / n).toFixed(2) : 0);
    setLoading(false);
  }

  const satisfied = (rows.find(d => d.rating === 5)?.count || 0) + (rows.find(d => d.rating === 4)?.count || 0);
  const neutral    = rows.find(d => d.rating === 3)?.count || 0;
  const detractors = (rows.find(d => d.rating === 2)?.count || 0) + (rows.find(d => d.rating === 1)?.count || 0);
  const satRate    = total ? Math.round((satisfied / total) * 100) : 0;

  const maxCount = Math.max(0, ...rows.map(d => d.count));

  // Monochrome fill + subtle alpha ramp to match PeakHours aesthetic
  const fillWidth = (count) => (maxCount ? (count / maxCount) * 100 : 0);
  const band = (intensity /*0..1*/) => {
    const a = intensity === 0 ? 0.08 : 0.15 + 0.85 * Math.min(1, Math.max(0, intensity));
    return { backgroundColor: `rgba(15,23,42,${a})` }; // slate-900 with variable alpha
  };

  const noData = !loading && total === 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            Customer Satisfaction
          </h3>
          <p className="text-xs text-gray-600 mt-1">How guests rate their experience (1–5)</p>
        </div>

        {/* Compact overall card */}
        <div className="rounded-md border border-gray-100 p-3 text-right min-w-[132px]">
          <div className="flex items-center justify-end gap-1">
            <Star className="w-4 h-4 text-gray-700" />
            <span className="text-2xl font-bold text-gray-900 tabular-nums">{avg}</span>
          </div>
          <div className="text-[11px] text-gray-600 mt-1 flex items-center justify-end gap-1">
            <Users className="w-3.5 h-3.5 text-gray-500" />
            {total} reviews
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-md animate-pulse" />
          ))}
        </div>
      ) : noData ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-sm text-gray-600">No ratings yet — distribution will appear once feedback comes in.</div>
        </div>
      ) : (
        <>
          {/* Distribution rows 5 → 1 */}
          <div className="space-y-2 mb-4">
            {rows.map(({ rating, count, pct }) => (
              <div key={rating} className="rounded-md border border-gray-100 p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rating ? 'text-gray-800' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">{rating} star{rating > 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-xs text-gray-700">
                    <span className="font-semibold text-gray-900 tabular-nums">{count}</span>
                    <span className="text-gray-500"> ({pct}%)</span>
                  </div>
                </div>
                <div className="relative bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${fillWidth(count)}%`,
                      ...band(maxCount ? count / maxCount : 0)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary cards (neutral, compact) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md p-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-1">Satisfied (4–5★)</div>
              <div className="text-xl font-bold text-gray-900 tabular-nums">{satRate}%</div>
            </div>
            <div className="rounded-md p-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-1">Neutral (3★)</div>
              <div className="text-xl font-bold text-gray-900 tabular-nums">{neutral}</div>
            </div>
            <div className="rounded-md p-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-1">Detractors (1–2★)</div>
              <div className="text-xl font-bold text-gray-900 tabular-nums">{detractors}</div>
            </div>
          </div>

          {/* Legend / hint */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <span>Bar fill:</span>
              <div className="flex items-center gap-1">
                <span className="inline-block w-4 h-3 rounded" style={{background:'rgba(15,23,42,0.12)'}} />
                <span>Low</span>
                <span className="inline-block w-4 h-3 rounded" style={{background:'rgba(15,23,42,0.5)'}} />
                <span>Medium</span>
                <span className="inline-block w-4 h-3 rounded" style={{background:'rgba(15,23,42,1)'}} />
                <span>High</span>
              </div>
            </div>
            <div className="text-[11px] text-gray-600">
              Bars scale to the most common rating.
            </div>
          </div>
        </>
      )}
    </div>
  );
}