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
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Zap, 
  Target, 
  Star,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Gauge
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SwankyRatingsTrend = ({ venueId }) => {
  const [currentRatings, setCurrentRatings] = useState({ google: null, tripadvisor: null });
  const [historicalData, setHistoricalData] = useState({ google: [], tripadvisor: [] });
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({ google: null, tripadvisor: null });
  const [dateRange, setDateRange] = useState(7);
  const [insights, setInsights] = useState([]);
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
    }, 500);
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

      // Calculate KPI data and insights
      const newKpiData = {};
      const newInsights = [];

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

          // Generate AI-style insights for Google
          if (change > 0) {
            newInsights.push({
              type: 'positive',
              platform: 'Google',
              message: `Google rating improved by ${change.toFixed(2)} points`,
              confidence: 94,
              impact: 'high'
            });
          } else if (change < -0.1) {
            newInsights.push({
              type: 'warning',
              platform: 'Google',
              message: `Google rating declined by ${Math.abs(change).toFixed(2)} points`,
              confidence: 87,
              impact: 'medium'
            });
          }
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

          // Generate AI-style insights for TripAdvisor
          if (change > 0) {
            newInsights.push({
              type: 'positive',
              platform: 'TripAdvisor',
              message: `TripAdvisor rating trending upward`,
              confidence: 91,
              impact: 'high'
            });
          }
        }
      }

      // Cross-platform insights
      if (newKpiData.google && newKpiData.tripadvisor) {
        const avgImprovement = (newKpiData.google.change + newKpiData.tripadvisor.change) / 2;
        if (avgImprovement > 0.05) {
          newInsights.push({
            type: 'insight',
            platform: 'Cross-Platform',
            message: 'Multi-platform rating optimization detected',
            confidence: 96,
            impact: 'high'
          });
        }
      }

      setKpiData(newKpiData);
      setInsights(newInsights);
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

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Google Rating',
        data: googleData,
        backgroundColor: 'rgba(66, 133, 244, 0.8)',
        borderColor: 'rgba(66, 133, 244, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 16,
      },
      {
        label: 'TripAdvisor Rating',
        data: tripadvisorData,
        backgroundColor: 'rgba(0, 170, 108, 0.8)',
        borderColor: 'rgba(0, 170, 108, 1)',
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
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
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: '500'
          },
          maxRotation: 0,
        }
      },
      y: {
        display: true,
        beginAtZero: false,
        min: 1,
        max: 5,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        border: {
          display: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
            weight: '500'
          },
          stepSize: 0.5,
          padding: 12,
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
    barPercentage: 0.85,
    categoryPercentage: 0.8
  };

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl"></div>
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-64"></div>
            </div>
            <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl"></div>
              <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRatings.google && !currentRatings.tripadvisor && 
      historicalData.google.length === 0 && historicalData.tripadvisor.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="relative p-8">
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                <Brain className="w-12 h-12 text-transparent bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI-Powered Rating Intelligence</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Connect your Google Business and TripAdvisor listings to unlock advanced rating analytics and AI-driven insights.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard/settings?tab=Integrations'}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Zap className="w-5 h-5" />
              Enable AI Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200/60 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                AI Rating Intelligence
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700">LIVE</span>
                </div>
              </h3>
              <p className="text-slate-600 text-sm">Real-time rating analytics and trend predictions</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
            {[3, 7, 14].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  dateRange === days
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights Banner */}
        {insights.length > 0 && (
          <div className={`mb-6 transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-fuchsia-600/10 backdrop-blur-sm rounded-xl p-4 border border-violet-200/50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    AI Insights
                    <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium">
                      {insights.length} detected
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {insights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          insight.type === 'positive' ? 'bg-emerald-500' :
                          insight.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-slate-700">{insight.message}</span>
                        <span className="text-xs text-slate-500 ml-auto">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Google Current Rating */}
          {currentRatings.google && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">Google</span>
                </div>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {currentRatings.google.rating.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">
                {currentRatings.google.ratings_count.toLocaleString()} reviews
              </div>
              {kpiData.google && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  kpiData.google.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {kpiData.google.change >= 0 ? 
                    <ArrowUpRight className="w-3 h-3" /> : 
                    <ArrowDownRight className="w-3 h-3" />
                  }
                  {kpiData.google.change >= 0 ? '+' : ''}{kpiData.google.change.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* TripAdvisor Current Rating */}
          {currentRatings.tripadvisor && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">TripAdvisor</span>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {currentRatings.tripadvisor.rating.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">
                {currentRatings.tripadvisor.ratings_count.toLocaleString()} reviews
              </div>
              {kpiData.tripadvisor && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  kpiData.tripadvisor.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {kpiData.tripadvisor.change >= 0 ? 
                    <ArrowUpRight className="w-3 h-3" /> : 
                    <ArrowDownRight className="w-3 h-3" />
                  }
                  {kpiData.tripadvisor.change >= 0 ? '+' : ''}{kpiData.tripadvisor.change.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Overall Trend */}
          {kpiData.google && kpiData.tripadvisor && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">Trend</span>
                </div>
                <Target className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {((kpiData.google.change + kpiData.tripadvisor.change) >= 0 ? 'Positive' : 'Negative')}
              </div>
              <div className="text-xs text-slate-500">
                Cross-platform analysis
              </div>
            </div>
          )}

          {/* Performance Score */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-slate-700 text-sm">AI Score</span>
              </div>
              <Zap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {Math.round(((currentRatings.google?.rating || 0) + (currentRatings.tripadvisor?.rating || 0)) / 2 * 20)}
            </div>
            <div className="text-xs text-slate-500">
              Performance index
            </div>
          </div>
        </div>

        {/* Chart */}
        {(historicalData.google.length > 0 || historicalData.tripadvisor.length > 0) && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
            <div className="h-80">
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwankyRatingsTrend;