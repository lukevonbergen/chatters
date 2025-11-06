import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { useVenue } from '../../../context/VenueContext';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { getDateRangeFromPreset } from '../../../utils/dateRangePresets';

// Import visualization components
import NPSDonutChart from './nps/NPSDonutChart';
import NPSBarChart from './nps/NPSBarChart';
import NPSLineChart from './nps/NPSLineChart';
import NPSKPITile from './nps/NPSKPITile';

const NPSChartTile = ({ config = {}, onRemove, onConfigure }) => {
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

  const dateRangePreset = config.date_range_preset || 'all_time';
  const chartType = config.chart_type || 'donut';

  useEffect(() => {
    if (venueId) {
      fetchNPSData();
    }
  }, [venueId, dateRangePreset]);

  const fetchNPSData = async () => {
    try {
      setLoading(true);

      const dateRange = getDateRangeFromPreset(dateRangePreset);
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

  // Render different chart types
  const renderChart = () => {
    const commonProps = {
      npsData,
      loading,
      dateRangePreset
    };

    switch (chartType) {
      case 'kpi':
        return <NPSKPITile {...commonProps} />;
      case 'bar':
        return <NPSBarChart {...commonProps} />;
      case 'line':
        return <NPSLineChart {...commonProps} />;
      case 'donut':
      default:
        return <NPSDonutChart {...commonProps} />;
    }
  };

  const getPresetLabel = (preset) => {
    const labels = {
      '7_days': 'Last 7 Days',
      'this_month': 'This Month',
      'last_month': 'Last Month',
      'last_quarter': 'Last Quarter',
      'all_time': 'All Time'
    };
    return labels[preset] || 'All Time';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">NPS Score</h3>
          <p className="text-sm text-gray-500 mt-1">{getPresetLabel(dateRangePreset)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onConfigure}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configure chart"
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

      {/* Chart Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {renderChart()}
      </div>
    </div>
  );
};

export default NPSChartTile;
