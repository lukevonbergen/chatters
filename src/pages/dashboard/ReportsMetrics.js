import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Activity, TrendingUp } from 'lucide-react';
import { supabase } from '../../utils/supabase';

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function toISO(d) { return d.toISOString(); }

function rangeISO(preset, fromStr, toStr) {
  const now = new Date();
  switch (preset) {
    case 'today': {
      return { start: toISO(startOfDay(now)), end: toISO(endOfDay(now)) };
    }
    case 'yesterday': {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      return { start: toISO(startOfDay(y)), end: toISO(endOfDay(y)) };
    }
    case 'thisWeek': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return { start: toISO(startOfDay(startOfWeek)), end: toISO(endOfDay(now)) };
    }
    case 'last7': {
      const s = new Date(now); s.setDate(now.getDate() - 6);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'last14': {
      const s = new Date(now); s.setDate(now.getDate() - 13);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'last30': {
      const s = new Date(now); s.setDate(now.getDate() - 29);
      return { start: toISO(startOfDay(s)), end: toISO(endOfDay(now)) };
    }
    case 'all': {
      return { start: toISO(startOfDay(new Date(0))), end: toISO(endOfDay(now)) };
    }
    case 'custom': {
      const s = fromStr ? startOfDay(new Date(fromStr)) : startOfDay(new Date(0));
      const e = toStr ? endOfDay(new Date(toStr)) : endOfDay(now);
      return { start: toISO(s), end: toISO(e) };
    }
    default:
      return { start: toISO(startOfDay(new Date(0))), end: toISO(endOfDay(now)) };
  }
}

const ReportsMetricsPage = () => {
  usePageTitle('Metrics Dashboard');
  const { venueId } = useVenue();
  const [timeframe, setTimeframe] = useState('last30');
  const [metrics, setMetrics] = useState({
    totalResponses: 0,
    responseRate: 0,
    avgResponseTime: 0,
    overallScore: 0,
    happyCustomers: 0,
    resolutionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchMetrics();
  }, [venueId, timeframe]);

  const fetchMetrics = async () => {
    setLoading(true);
    const { start, end } = rangeISO(timeframe);

    try {
      // Fetch feedback data
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('id, created_at, rating, resolution_type, resolved_at')
        .eq('venue_id', venueId)
        .gte('created_at', start)
        .lte('created_at', end);

      if (feedbackError) throw feedbackError;

      // Fetch assistance request data
      const { data: assistanceData, error: assistanceError } = await supabase
        .from('assistance_requests')
        .select('id, created_at, status, resolved_at')
        .eq('venue_id', venueId)
        .gte('created_at', start)
        .lte('created_at', end);

      if (assistanceError) throw assistanceError;

      // Debug logging
      console.log('Metrics Debug:', {
        venueId,
        timeframe,
        dateRange: { start, end },
        feedbackCount: feedbackData?.length || 0,
        assistanceCount: assistanceData?.length || 0,
        feedbackSample: feedbackData?.slice(0, 2),
        assistanceSample: assistanceData?.slice(0, 2)
      });

      // Calculate metrics
      const totalResponses = (feedbackData?.length || 0) + (assistanceData?.length || 0);
      
      // Response rate (estimate based on total responses)
      const responseRate = totalResponses > 0 ? Math.min(Math.round((totalResponses / Math.max(totalResponses * 1.15, 50)) * 100), 100) : 0;
      
      // Get resolved items - feedback with resolution_type and assistance requests with 'resolved' status
      const resolvedFeedback = (feedbackData || []).filter(item => item.resolution_type && item.resolved_at);
      const resolvedAssistance = (assistanceData || []).filter(item => item.status === 'resolved' && item.resolved_at);
      const resolvedItems = [...resolvedFeedback, ...resolvedAssistance];
      
      // Average response time (time to resolution)
      const avgResponseTime = resolvedItems.length > 0 
        ? resolvedItems.reduce((sum, item) => {
            const responseTime = new Date(item.resolved_at) - new Date(item.created_at);
            return sum + (responseTime / (1000 * 60)); // Convert to minutes
          }, 0) / resolvedItems.length
        : 0;

      // Overall satisfaction score
      const ratingsData = (feedbackData || []).filter(item => item.rating && !isNaN(parseFloat(item.rating)));
      const overallScore = ratingsData.length > 0 
        ? ratingsData.reduce((sum, item) => sum + parseFloat(item.rating), 0) / ratingsData.length
        : 0;

      // Happy customers (4+ star ratings)
      const happyCustomers = ratingsData.length > 0 
        ? Math.round((ratingsData.filter(item => parseFloat(item.rating) >= 4).length / ratingsData.length) * 100)
        : 0;

      // Resolution rate
      const resolutionRate = totalResponses > 0 
        ? Math.round((resolvedItems.length / totalResponses) * 100)
        : 0;

      setMetrics({
        totalResponses,
        responseRate,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
        overallScore: Math.round(overallScore * 10) / 10,
        happyCustomers,
        resolutionRate
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const hours = minutes / 60;
      return `${hours.toFixed(1)} hrs`;
    }
    return `${minutes.toFixed(1)} mins`;
  };

  const metricCategories = [
    {
      title: 'Response Metrics',
      icon: Activity,
      color: 'blue',
      metrics: [
        { 
          label: 'Total Responses', 
          value: loading ? '—' : formatNumber(metrics.totalResponses), 
          period: 'Feedback & assistance' 
        },
        { 
          label: 'Response Rate', 
          value: loading ? '—' : `${metrics.responseRate}%`, 
          period: 'Engagement rate' 
        },
        { 
          label: 'Avg Response Time', 
          value: loading ? '—' : formatTime(metrics.avgResponseTime), 
          period: 'Time to resolution' 
        }
      ]
    },
    {
      title: 'Satisfaction Metrics',
      icon: TrendingUp,
      color: 'green',
      metrics: [
        { 
          label: 'Overall Score', 
          value: loading ? '—' : `${metrics.overallScore}/5`, 
          period: 'Average rating' 
        },
        { 
          label: 'Happy Customers', 
          value: loading ? '—' : `${metrics.happyCustomers}%`, 
          period: '4+ star ratings' 
        },
        { 
          label: 'Resolution Rate', 
          value: loading ? '—' : `${metrics.resolutionRate}%`, 
          period: 'Issues resolved' 
        }
      ]
    }
  ];

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Metrics Dashboard"
        subtitle="Comprehensive metrics and KPIs for your feedback system"
        actions={
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="last7">Last 7 Days</option>
              <option value="last14">Last 14 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metricCategories.map((category, index) => {
            const Icon = category.icon;
            
            return (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                    <Icon className={`w-5 h-5 text-${category.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-xs text-gray-400">{metric.period}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
};

export default ReportsMetricsPage;