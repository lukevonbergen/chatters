import React, { useState, useEffect, useRef } from 'react';
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
import { 
  TrendingUp, 
  TrendingDown, 
  Star,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UnrealRatingsTrend = ({ venueId }) => {
  const [currentRatings, setCurrentRatings] = useState({ google: null, tripadvisor: null });
  const [historicalData, setHistoricalData] = useState({ google: [], tripadvisor: [] });
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({ google: null, tripadvisor: null });
  const [dateRange, setDateRange] = useState(7);
  const [animationPhase, setAnimationPhase] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    if (venueId) {
      loadRatingData();
    }
  }, [venueId]);

  useEffect(() => {
    // Staggered loading animation
    const timer = setTimeout(() => {
      setAnimationPhase(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
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

  // Create stunning gradient for Google bars
  const createGoogleGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.8)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.7)');
    return gradient;
  };

  // Create stunning gradient for TripAdvisor bars
  const createTripAdvisorGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
    gradient.addColorStop(0.5, 'rgba(5, 150, 105, 0.8)');
    gradient.addColorStop(1, 'rgba(6, 120, 85, 0.7)');
    return gradient;
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Google Rating',
        data: googleData,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx } = chart;
          return createGoogleGradient(ctx);
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 24,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(59, 130, 246, 0.3)',
      },
      {
        label: 'TripAdvisor Rating',
        data: tripadvisorData,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx } = chart;
          return createTripAdvisorGradient(ctx);
        },
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 24,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(16, 185, 129, 0.3)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.dataIndex * 100;
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 2,
        padding: 20,
        cornerRadius: 16,
        displayColors: false,
        titleFont: {
          size: 16,
          weight: '700'
        },
        bodyFont: {
          size: 14,
          weight: '600'
        },
        titleSpacing: 8,
        bodySpacing: 6,
        caretSize: 8,
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
          },
          afterLabel: function(context) {
            const date = selectedDays[context.dataIndex];
            return `${new Date(date).toLocaleDateString('en-GB', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric' 
            })}`;
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
          color: '#64748B',
          font: {
            size: 13,
            weight: '600'
          },
          maxRotation: 0,
          padding: 12
        }
      },
      y: {
        display: true,
        beginAtZero: false,
        min: 1,
        max: 5,
        grid: {
          color: 'rgba(148, 163, 184, 0.15)',
          lineWidth: 2,
          drawBorder: false,
        },
        border: {
          display: false
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 12,
            weight: '600'
          },
          stepSize: 0.5,
          padding: 16,
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    barPercentage: 0.7,
    categoryPercentage: 0.8,
    elements: {
      bar: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
      }
    }
  };

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl border border-slate-200/60 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl"></div>
              <div className="h-7 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl w-80"></div>
            </div>
            <div className="h-80 bg-gradient-to-br from-slate-100 via-blue-100 to-purple-100 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl"></div>
              <div className="h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRatings.google && !currentRatings.tripadvisor && 
      historicalData.google.length === 0 && historicalData.tripadvisor.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl border border-slate-200/60 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="relative p-8">
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-lg">
                <BarChart3 className="w-16 h-16 text-transparent bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Review Platform Analytics</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
              Connect your Google Business and TripAdvisor listings to visualize rating trends and performance metrics.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard/settings?tab=Integrations'}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
            >
              <Eye className="w-6 h-6" />
              Connect Platforms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl border border-slate-200/60 overflow-hidden shadow-xl">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-indigo-500/3"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/8 to-cyan-400/8 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-pulse"></div>
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Review Platform Ratings</h3>
              <p className="text-slate-600 text-lg">Real-time rating trends and performance</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-white/20">
            {[3, 7, 14].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  dateRange === days
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-600 hover:bg-white/60 hover:scale-102'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Chart Container */}
        <div className={`mb-8 transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
            <div className="h-96">
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Google Stats */}
          {currentRatings.google && (
            <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Google Reviews</h4>
                    <p className="text-slate-600 text-sm">Business listing</p>
                  </div>
                </div>
                <Eye className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-black text-slate-900">
                    {currentRatings.google.rating.toFixed(1)}
                  </div>
                  <div className="text-slate-600 pb-1">
                    / 5.0
                  </div>
                </div>
                
                <div className="text-slate-600 font-medium">
                  {currentRatings.google.ratings_count.toLocaleString()} total reviews
                </div>
                
                {kpiData.google && (
                  <div className={`flex items-center gap-2 font-bold ${
                    kpiData.google.change >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {kpiData.google.change >= 0 ? 
                      <ArrowUpRight className="w-5 h-5" /> : 
                      <ArrowDownRight className="w-5 h-5" />
                    }
                    <span className="text-lg">
                      {kpiData.google.change >= 0 ? '+' : ''}{kpiData.google.change.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      since first rating
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TripAdvisor Stats */}
          {currentRatings.tripadvisor && (
            <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">TripAdvisor</h4>
                    <p className="text-slate-600 text-sm">Travel platform</p>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-black text-slate-900">
                    {currentRatings.tripadvisor.rating.toFixed(1)}
                  </div>
                  <div className="text-slate-600 pb-1">
                    / 5.0
                  </div>
                </div>
                
                <div className="text-slate-600 font-medium">
                  {currentRatings.tripadvisor.ratings_count.toLocaleString()} total reviews
                </div>
                
                {kpiData.tripadvisor && (
                  <div className={`flex items-center gap-2 font-bold ${
                    kpiData.tripadvisor.change >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {kpiData.tripadvisor.change >= 0 ? 
                      <ArrowUpRight className="w-5 h-5" /> : 
                      <ArrowDownRight className="w-5 h-5" />
                    }
                    <span className="text-lg">
                      {kpiData.tripadvisor.change >= 0 ? '+' : ''}{kpiData.tripadvisor.change.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      since first rating
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnrealRatingsTrend;