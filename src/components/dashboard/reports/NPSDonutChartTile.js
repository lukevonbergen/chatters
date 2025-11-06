import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { useVenue } from '../../../context/VenueContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TrendingUp, TrendingDown, Minus, X, Settings as SettingsIcon } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const NPSDonutChartTile = ({ dateRange, onRemove, onChangeMetric }) => {
  const { venueId } = useVenue();
  const [loading, setLoading] = useState(true);
  const [npsData, setNpsData] = useState({
    score: 0,
    promoters: 0,
    passives: 0,
    detractors: 0,
    total: 0,
    trend: null,
    trendDirection: 'neutral'
  });

  useEffect(() => {
    if (venueId && dateRange) {
      fetchNPSData();
    }
  }, [venueId, dateRange]);

  const fetchNPSData = async () => {
    try {
      setLoading(true);

      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      // Fetch NPS responses for the selected date range
      const { data: currentData, error: currentError } = await supabase
        .from('nps_submissions')
        .select('score, responded_at')
        .eq('venue_id', venueId)
        .not('score', 'is', null)
        .gte('responded_at', startDate)
        .lte('responded_at', endDate);

      if (currentError) throw currentError;

      // Calculate previous period for trend
      const daysDiff = Math.ceil((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24));
      const previousStart = new Date(dateRange.from);
      previousStart.setDate(previousStart.getDate() - daysDiff);
      const previousEnd = new Date(dateRange.from);

      const { data: previousData } = await supabase
        .from('nps_submissions')
        .select('score')
        .eq('venue_id', venueId)
        .not('score', 'is', null)
        .gte('responded_at', previousStart.toISOString())
        .lt('responded_at', previousEnd.toISOString());

      // Calculate current NPS
      const promoters = currentData?.filter(r => r.score >= 9).length || 0;
      const passives = currentData?.filter(r => r.score >= 7 && r.score <= 8).length || 0;
      const detractors = currentData?.filter(r => r.score <= 6).length || 0;
      const total = currentData?.length || 0;

      const npsScore = total > 0
        ? Math.round(((promoters - detractors) / total) * 100)
        : 0;

      // Calculate previous NPS for trend
      let trend = null;
      let trendDirection = 'neutral';

      if (previousData && previousData.length > 0) {
        const prevPromoters = previousData.filter(r => r.score >= 9).length;
        const prevDetractors = previousData.filter(r => r.score <= 6).length;
        const prevTotal = previousData.length;
        const prevNpsScore = Math.round(((prevPromoters - prevDetractors) / prevTotal) * 100);

        const difference = npsScore - prevNpsScore;
        if (Math.abs(difference) >= 1) {
          trend = `${difference > 0 ? '+' : ''}${difference}`;
          trendDirection = difference > 0 ? 'up' : 'down';
        }
      }

      setNpsData({
        score: npsScore,
        promoters,
        passives,
        detractors,
        total,
        trend,
        trendDirection
      });
    } catch (error) {
      console.error('Error fetching NPS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 50) return 'Excellent';
    if (score >= 30) return 'Great';
    if (score >= 0) return 'Good';
    if (score >= -30) return 'Needs Work';
    return 'Critical';
  };

  const chartData = {
    labels: ['Promoters (9-10)', 'Passives (7-8)', 'Detractors (0-6)'],
    datasets: [
      {
        data: [npsData.promoters, npsData.passives, npsData.detractors],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for promoters
          'rgba(234, 179, 8, 0.8)',    // Yellow for passives
          'rgba(239, 68, 68, 0.8)'     // Red for detractors
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const TrendIcon = npsData.trendDirection === 'up' ? TrendingUp :
                    npsData.trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">NPS Score</h3>
          <p className="text-sm text-gray-500 mt-1">Net Promoter Score breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onChangeMetric}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Change metric"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove tile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading NPS data...</p>
          </div>
        </div>
      ) : npsData.total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 text-sm">No NPS data available</p>
            <p className="text-gray-400 text-xs mt-1">for this period</p>
          </div>
        </div>
      ) : (
        <>
          {/* Chart Container */}
          <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: '220px' }}>
            <div className="relative w-full h-full" style={{ maxWidth: '280px', maxHeight: '280px' }}>
              <Doughnut data={chartData} options={chartOptions} />

              {/* Center Score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`text-4xl font-bold ${getScoreColor(npsData.score)}`}>
                  {npsData.score}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getScoreLabel(npsData.score)}
                </div>
                {npsData.trend && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                    npsData.trendDirection === 'up' ? 'text-green-600' :
                    npsData.trendDirection === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{npsData.trend}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-gray-700">Promoters</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{npsData.promoters}</div>
                <div className="text-xs text-gray-500">
                  {npsData.total > 0 ? Math.round((npsData.promoters / npsData.total) * 100) : 0}%
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs font-medium text-gray-700">Passives</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{npsData.passives}</div>
                <div className="text-xs text-gray-500">
                  {npsData.total > 0 ? Math.round((npsData.passives / npsData.total) * 100) : 0}%
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-gray-700">Detractors</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{npsData.detractors}</div>
                <div className="text-xs text-gray-500">
                  {npsData.total > 0 ? Math.round((npsData.detractors / npsData.total) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="text-center mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Total Responses: </span>
              <span className="text-xs font-semibold text-gray-700">{npsData.total}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NPSDonutChartTile;
