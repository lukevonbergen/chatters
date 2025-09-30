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

const RatingsTrendBar = ({ venueId }) => {
  const [currentRatings, setCurrentRatings] = useState({ google: null, tripadvisor: null });
  const [historicalData, setHistoricalData] = useState({ google: [], tripadvisor: [] });
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({ google: null, tripadvisor: null });
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    if (venueId) {
      loadRatingData();
    }
  }, [venueId]);

  const loadRatingData = async () => {
    try {
      setLoading(true);
      await loadSingleVenueRatingData(venueId);
    } catch (error) {
      // Error loading rating data
    } finally {
      setLoading(false);
    }
  };

  const loadSingleVenueRatingData = async (venueId) => {
    try {
      // Disable external ratings due to persistent RLS issues
      
      const googleCurrent = null;
      const tripadvisorCurrent = null;
      const googleHistorical = [];
      const tripadvisorHistorical = [];

    setCurrentRatings({
      google: googleCurrent,
      tripadvisor: tripadvisorCurrent
    });
    
    // Use external_ratings as fallback if no historical data exists
    const googleHistoricalWithFallback = (googleHistorical && googleHistorical.length > 0) 
      ? googleHistorical 
      : (googleCurrent ? [{
          rating: googleCurrent.rating,
          ratings_count: googleCurrent.ratings_count,
          recorded_at: googleCurrent.fetched_at,
          is_initial: true
        }] : []);
    
    const tripadvisorHistoricalWithFallback = (tripadvisorHistorical && tripadvisorHistorical.length > 0)
      ? tripadvisorHistorical
      : (tripadvisorCurrent ? [{
          rating: tripadvisorCurrent.rating,
          ratings_count: tripadvisorCurrent.ratings_count,
          recorded_at: tripadvisorCurrent.fetched_at,
          is_initial: true
        }] : []);
    
    setHistoricalData({
      google: googleHistoricalWithFallback,
      tripadvisor: tripadvisorHistoricalWithFallback
    });

    // Calculate KPI data
    const newKpiData = {};

      // Google KPIs
      if (googleHistoricalWithFallback && googleHistoricalWithFallback.length > 0) {
        const initialRating = googleHistoricalWithFallback.find(r => r.is_initial)?.rating;
        const latestRating = googleCurrent?.rating || googleHistoricalWithFallback[googleHistoricalWithFallback.length - 1]?.rating;

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
      if (tripadvisorHistoricalWithFallback && tripadvisorHistoricalWithFallback.length > 0) {
        const initialRating = tripadvisorHistoricalWithFallback.find(r => r.is_initial)?.rating;
        const latestRating = tripadvisorCurrent?.rating || tripadvisorHistoricalWithFallback[tripadvisorHistoricalWithFallback.length - 1]?.rating;

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
      // Set empty state on any error
      setCurrentRatings({ google: null, tripadvisor: null });
      setHistoricalData({ google: [], tripadvisor: [] });
      setKpiData({});
    }
  };

  // Generate date range based on selected period
  const generateDateRange = (days) => {
    const dateArray = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateArray.push(dateStr);
    }
    return dateArray;
  };
  
  const selectedDays = generateDateRange(dateRange);
  
  // Create labels from the selected days
  const labels = selectedDays.map(dateStr => 
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric' 
    })
  );
  
  // Create data arrays for each platform, matching to the selected days
  const googleData = selectedDays.map(dateStr => {
    const point = historicalData.google.find(p => {
      const recordedDate = new Date(p.recorded_at).toISOString().split('T')[0];
      return recordedDate === dateStr;
    });
    return point ? parseFloat(point.rating) : null;
  });
  
  const tripadvisorData = selectedDays.map(dateStr => {
    const point = historicalData.tripadvisor.find(p => {
      const recordedDate = new Date(p.recorded_at).toISOString().split('T')[0];
      return recordedDate === dateStr;
    });
    return point ? parseFloat(point.rating) : null;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Google Rating',
        data: googleData,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderColor: '#0f172a',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 16,
      },
      {
        label: 'TripAdvisor Rating',
        data: tripadvisorData,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderColor: '#0f172a',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 16,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'white',
        titleColor: '#0f172a',
        bodyColor: '#0f172a',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 12,
          weight: 'bold'
        },
        bodyFont: {
          size: 12,
          weight: 'bold'
        },
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        animation: {
          duration: 0
        },
        callbacks: {
          title: function(tooltipItems) {
            const item = tooltipItems[0];
            return item.dataset.label;
          },
          label: function(context) {
            if (context.parsed.y === null) return null;
            return `${context.parsed.y.toFixed(1)} ⭐`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: '#e5e7eb',
          drawBorder: false,
          borderDash: [3, 3],
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 12
          },
          maxRotation: 0,
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        min: 0,
        max: 5,
        grid: {
          color: '#e5e7eb',
          drawBorder: false,
          borderDash: [3, 3],
        },
        border: {
          display: false
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 12
          },
          stepSize: 1,
          padding: 8,
          callback: function(value) {
            return value;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    barPercentage: 0.85,
    categoryPercentage: 0.8
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentRatings.google && !currentRatings.tripadvisor && 
      historicalData.google.length === 0 && historicalData.tripadvisor.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50">
        <div className="text-center p-8">
          <p className="text-sm mb-1 text-gray-600">No review platform ratings yet</p>
          <p className="text-xs text-gray-500">Connect your platforms to track ratings over time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {(historicalData.google.length > 0 || historicalData.tripadvisor.length > 0) ? (
        <Bar data={chartData} options={chartOptions} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50">
          <div className="text-center p-8">
            <p className="text-sm mb-1 text-gray-600">No trend data available</p>
            <p className="text-xs text-gray-500">Trends will appear as ratings are collected</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingsTrendBar;