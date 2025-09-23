import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GoogleRatingsTrendTile = ({ venueId }) => {
  const [currentRatings, setCurrentRatings] = useState({ google: null, tripadvisor: null });
  const [historicalData, setHistoricalData] = useState({ google: [], tripadvisor: [] });
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({ google: null, tripadvisor: null });

  useEffect(() => {
    if (venueId) {
      loadRatingData();
    }
  }, [venueId]);

  const loadRatingData = async () => {
    try {
      setLoading(true);

      // Get current ratings from external_ratings table for both platforms
      const { data: googleCurrent } = await supabase
        .from('external_ratings')
        .select('rating, ratings_count, fetched_at')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .single();

      const { data: tripadvisorCurrent } = await supabase
        .from('external_ratings')
        .select('rating, ratings_count, fetched_at')
        .eq('venue_id', venueId)
        .eq('source', 'tripadvisor')
        .single();

      // Get historical ratings for both platforms
      const { data: googleHistorical } = await supabase
        .from('historical_ratings')
        .select('rating, ratings_count, recorded_at, is_initial')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .order('recorded_at', { ascending: true });

      const { data: tripadvisorHistorical } = await supabase
        .from('historical_ratings')
        .select('rating, ratings_count, recorded_at, is_initial')
        .eq('venue_id', venueId)
        .eq('source', 'tripadvisor')
        .order('recorded_at', { ascending: true });

      setCurrentRatings({
        google: googleCurrent,
        tripadvisor: tripadvisorCurrent
      });
      
      setHistoricalData({
        google: googleHistorical || [],
        tripadvisor: tripadvisorHistorical || []
      });

      // Calculate KPI data for both platforms
      const newKpiData = {};

      // Google KPIs
      if (googleHistorical && googleHistorical.length > 0) {
        const initialRating = googleHistorical.find(r => r.is_initial)?.rating;
        const latestRating = googleCurrent?.rating || googleHistorical[googleHistorical.length - 1]?.rating;

        if (initialRating && latestRating) {
          const change = latestRating - initialRating;
          const percentChange = ((change / initialRating) * 100);
          
          newKpiData.google = {
            initial: initialRating,
            current: latestRating,
            change: change,
            percentChange: percentChange
          };
        }
      }

      // TripAdvisor KPIs
      if (tripadvisorHistorical && tripadvisorHistorical.length > 0) {
        const initialRating = tripadvisorHistorical.find(r => r.is_initial)?.rating;
        const latestRating = tripadvisorCurrent?.rating || tripadvisorHistorical[tripadvisorHistorical.length - 1]?.rating;

        if (initialRating && latestRating) {
          const change = latestRating - initialRating;
          const percentChange = ((change / initialRating) * 100);
          
          newKpiData.tripadvisor = {
            initial: initialRating,
            current: latestRating,
            change: change,
            percentChange: percentChange
          };
        }
      }

      setKpiData(newKpiData);
    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine and prepare chart data
  // Create a map of all unique dates
  const allDates = new Set();
  historicalData.google.forEach(point => allDates.add(point.recorded_at));
  historicalData.tripadvisor.forEach(point => allDates.add(point.recorded_at));
  
  const sortedDates = Array.from(allDates).sort();
  
  // Create labels from dates
  const labels = sortedDates.map(date => 
    new Date(date).toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric' 
    })
  );
  
  // Create data arrays for each platform
  const googleData = sortedDates.map(date => {
    const point = historicalData.google.find(p => p.recorded_at === date);
    return point ? parseFloat(point.rating) : null;
  });
  
  const tripadvisorData = sortedDates.map(date => {
    const point = historicalData.tripadvisor.find(p => p.recorded_at === date);
    return point ? parseFloat(point.rating) : null;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Google Rating',
        data: googleData,
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
        borderWidth: 1,
      },
      {
        label: 'TripAdvisor Rating',
        data: tripadvisorData,
        backgroundColor: '#00AA6C',
        borderColor: '#00AA6C',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            if (context.parsed.y === null) return null;
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}⭐`;
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
        min: 1,
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
      mode: 'index',
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

  if (!currentRatings.google && !currentRatings.tripadvisor && 
      historicalData.google.length === 0 && historicalData.tripadvisor.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Review Platform Ratings Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Link your Google Business and TripAdvisor listings to start tracking ratings over time.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/settings'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Set Up Review Platforms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-1">Review Platform Ratings Trend</h3>
        <p className="text-sm text-gray-600">
          Track your Google and TripAdvisor rating progression over time
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Google Current Rating */}
        {currentRatings.google && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Google</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentRatings.google.rating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">
                  {currentRatings.google.ratings_count} reviews
                </p>
              </div>
              <div className="text-blue-500 text-2xl">⭐</div>
            </div>
          </div>
        )}

        {/* TripAdvisor Current Rating */}
        {currentRatings.tripadvisor && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">TripAdvisor</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentRatings.tripadvisor.rating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">
                  {currentRatings.tripadvisor.ratings_count} reviews
                </p>
              </div>
              <div className="text-green-500 text-2xl">⭐</div>
            </div>
          </div>
        )}

        {/* Google Change */}
        {kpiData.google && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Google Change</p>
                <p className={`text-2xl font-bold ${
                  kpiData.google.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpiData.google.change >= 0 ? '+' : ''}{kpiData.google.change.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {kpiData.google.percentChange >= 0 ? '+' : ''}{kpiData.google.percentChange.toFixed(1)}%
                </p>
              </div>
              <div className={`text-2xl ${
                kpiData.google.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {kpiData.google.change >= 0 ? '↗️' : '↘️'}
              </div>
            </div>
          </div>
        )}

        {/* TripAdvisor Change */}
        {kpiData.tripadvisor && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">TripAdvisor Change</p>
                <p className={`text-2xl font-bold ${
                  kpiData.tripadvisor.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpiData.tripadvisor.change >= 0 ? '+' : ''}{kpiData.tripadvisor.change.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {kpiData.tripadvisor.percentChange >= 0 ? '+' : ''}{kpiData.tripadvisor.percentChange.toFixed(1)}%
                </p>
              </div>
              <div className={`text-2xl ${
                kpiData.tripadvisor.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {kpiData.tripadvisor.change >= 0 ? '↗️' : '↘️'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {(historicalData.google.length > 0 || historicalData.tripadvisor.length > 0) && (
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Attribution */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {currentRatings.google && `Google data last updated: ${new Date(currentRatings.google.fetched_at).toLocaleString()}`}
          {currentRatings.google && currentRatings.tripadvisor && ' • '}
          {currentRatings.tripadvisor && `TripAdvisor data last updated: ${new Date(currentRatings.tripadvisor.fetched_at).toLocaleString()}`}
        </p>
      </div>
    </div>
  );
};

export default GoogleRatingsTrendTile;