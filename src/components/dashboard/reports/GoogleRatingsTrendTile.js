import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GoogleRatingsTrendTile = ({ venueId }) => {
  const [currentRating, setCurrentRating] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState(null);

  useEffect(() => {
    if (venueId) {
      loadRatingData();
    }
  }, [venueId]);

  const loadRatingData = async () => {
    try {
      setLoading(true);

      // Get current rating from external_ratings table
      const { data: currentData } = await supabase
        .from('external_ratings')
        .select('rating, ratings_count, fetched_at')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .single();

      // Get historical ratings
      const { data: historicalData } = await supabase
        .from('historical_ratings')
        .select('rating, ratings_count, recorded_at, is_initial')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .order('recorded_at', { ascending: true });

      setCurrentRating(currentData);
      setHistoricalData(historicalData || []);

      // Calculate KPI data if we have historical data
      if (historicalData && historicalData.length > 0) {
        const initialRating = historicalData.find(r => r.is_initial)?.rating;
        const latestRating = currentData?.rating || historicalData[historicalData.length - 1]?.rating;

        if (initialRating && latestRating) {
          const change = latestRating - initialRating;
          const percentChange = ((change / initialRating) * 100);
          
          setKpiData({
            initial: initialRating,
            current: latestRating,
            change: change,
            percentChange: percentChange
          });
        }
      }
    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: historicalData.map(point => 
      new Date(point.recorded_at).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Google Rating',
        data: historicalData.map(point => parseFloat(point.rating) || 0),
        borderColor: '#F59E0B',
        backgroundColor: '#FEF3C7',
        tension: 0.4,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Rating: ${context.parsed.y.toFixed(2)}⭐`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          fontSize: 12,
        }
      },
      y: {
        display: true,
        beginAtZero: false,
        min: Math.max(1, Math.min(...historicalData.map(d => parseFloat(d.rating) || 5)) - 0.5),
        max: 5,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          fontSize: 12,
          stepSize: 0.5,
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentRating && historicalData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Google Ratings Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Link your Google Business listing to start tracking ratings over time.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/settings'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Set Up Google Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-1">Google Ratings Trend</h3>
        <p className="text-sm text-gray-600">
          Track your Google Business rating progression over time
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Current Rating */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentRating?.rating ? currentRating.rating.toFixed(1) : 'N/A'}
              </p>
              {currentRating?.ratings_count && (
                <p className="text-xs text-gray-500">
                  {currentRating.ratings_count} reviews
                </p>
              )}
            </div>
            <div className="text-yellow-500 text-2xl">⭐</div>
          </div>
        </div>

        {/* Rating Change */}
        {kpiData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Since Start</p>
                <p className={`text-2xl font-bold ${
                  kpiData.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpiData.change >= 0 ? '+' : ''}{kpiData.change.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {kpiData.percentChange >= 0 ? '+' : ''}{kpiData.percentChange.toFixed(1)}%
                </p>
              </div>
              <div className={`text-2xl ${
                kpiData.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {kpiData.change >= 0 ? '↗️' : '↘️'}
              </div>
            </div>
          </div>
        )}

        {/* Data Points */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {historicalData.length}
              </p>
              <p className="text-xs text-gray-500">
                collected
              </p>
            </div>
            <div className="text-blue-500 text-2xl">📊</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {historicalData.length > 0 && (
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Attribution */}
      {currentRating?.attributions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Data © Google - Last updated: {new Date(currentRating.fetched_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleRatingsTrendTile;