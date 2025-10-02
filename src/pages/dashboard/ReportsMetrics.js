import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Activity, TrendingUp, Users, Clock } from 'lucide-react';
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
  const [timeframe, setTimeframe] = useState('last14');
  const [metrics, setMetrics] = useState({
    totalResponses: 0,
    responseRate: 0,
    avgResponseTime: 0,
    overallScore: 0,
    happyCustomers: 0,
    resolutionRate: 0,
    // Staff Performance
    topStaffMember: null,
    avgStaffResponseTime: 0,
    staffResolutionCount: 0,
    // Time Patterns
    peakHour: null,
    busiestDay: null,
    hourlyPattern: [],
    dailyPattern: []
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
        .select('id, created_at, rating, resolution_type, resolved_at, resolved_by')
        .eq('venue_id', venueId)
        .gte('created_at', start)
        .lte('created_at', end);

      if (feedbackError) throw feedbackError;

      // Fetch assistance request data
      const { data: assistanceData, error: assistanceError } = await supabase
        .from('assistance_requests')
        .select('id, created_at, status, resolved_at, acknowledged_at, resolved_by, acknowledged_by')
        .eq('venue_id', venueId)
        .gte('created_at', start)
        .lte('created_at', end);

      if (assistanceError) throw assistanceError;

      // Fetch employee data separately to avoid join issues
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, venue_id')
        .eq('venue_id', venueId);

      if (employeeError) throw employeeError;

      // Create employee lookup map
      const employeeMap = {};
      (employeeData || []).forEach(emp => {
        employeeMap[emp.id] = `${emp.first_name} ${emp.last_name}`;
      });

      // Debug logging
      console.log('Metrics Debug:', {
        venueId,
        timeframe,
        dateRange: { start, end },
        feedbackCount: feedbackData?.length || 0,
        assistanceCount: assistanceData?.length || 0,
        employeeCount: employeeData?.length || 0,
        feedbackSample: feedbackData?.slice(0, 2),
        assistanceSample: assistanceData?.slice(0, 2),
        employeeSample: employeeData?.slice(0, 2),
        rawQueries: {
          feedback: `venue_id=${venueId}, created_at between ${start} and ${end}`,
          assistance: `venue_id=${venueId}, created_at between ${start} and ${end}`
        }
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

      // === STAFF PERFORMANCE METRICS ===
      const staffPerformance = {};
      
      // Process feedback resolutions
      (feedbackData || []).forEach(item => {
        if (item.resolved_by && item.resolved_at && employeeMap[item.resolved_by]) {
          const staffName = employeeMap[item.resolved_by];
          if (!staffPerformance[staffName]) {
            staffPerformance[staffName] = { resolutions: 0, totalTime: 0, feedbackResolutions: 0 };
          }
          staffPerformance[staffName].resolutions++;
          staffPerformance[staffName].feedbackResolutions++;
          const responseTime = new Date(item.resolved_at) - new Date(item.created_at);
          staffPerformance[staffName].totalTime += responseTime / (1000 * 60); // minutes
        }
      });

      // Process assistance request resolutions
      (assistanceData || []).forEach(item => {
        if (item.resolved_by && item.resolved_at && employeeMap[item.resolved_by]) {
          const staffName = employeeMap[item.resolved_by];
          if (!staffPerformance[staffName]) {
            staffPerformance[staffName] = { resolutions: 0, totalTime: 0, feedbackResolutions: 0 };
          }
          staffPerformance[staffName].resolutions++;
          const responseTime = new Date(item.resolved_at) - new Date(item.created_at);
          staffPerformance[staffName].totalTime += responseTime / (1000 * 60); // minutes
        }
      });

      // Debug staff performance data
      console.log('Staff Performance Debug:', {
        staffPerformance,
        employeeMapKeys: Object.keys(employeeMap),
        feedbackWithResolved: (feedbackData || []).filter(f => f.resolved_by && f.resolved_at).length,
        assistanceWithResolved: (assistanceData || []).filter(a => a.resolved_by && a.resolved_at).length
      });

      // Find top performing staff member (most resolutions)
      const topStaffMember = Object.keys(staffPerformance).length > 0 
        ? Object.entries(staffPerformance).reduce((top, [name, data]) => 
            data.resolutions > (top.resolutions || 0) ? { name, ...data } : top, {})
        : null;

      const avgStaffResponseTime = Object.values(staffPerformance).length > 0
        ? Object.values(staffPerformance).reduce((sum, staff) => 
            sum + (staff.resolutions > 0 ? staff.totalTime / staff.resolutions : 0), 0) / Object.values(staffPerformance).length
        : 0;

      const staffResolutionCount = Object.values(staffPerformance).reduce((sum, staff) => sum + staff.resolutions, 0);

      // === TIME PATTERN METRICS ===
      const allItems = [...(feedbackData || []), ...(assistanceData || [])];
      
      // Hourly patterns
      const hourlyData = {};
      allItems.forEach(item => {
        const hour = new Date(item.created_at).getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      });

      const peakHour = Object.keys(hourlyData).length > 0 
        ? Object.entries(hourlyData).reduce((peak, [hour, count]) => 
            count > (peak.count || 0) ? { hour: parseInt(hour), count } : peak, {})
        : null;

      // Daily patterns (day of week)
      const dailyData = {};
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      allItems.forEach(item => {
        const dayIndex = new Date(item.created_at).getDay();
        const dayName = dayNames[dayIndex];
        dailyData[dayName] = (dailyData[dayName] || 0) + 1;
      });

      const busiestDay = Object.keys(dailyData).length > 0 
        ? Object.entries(dailyData).reduce((busiest, [day, count]) => 
            count > (busiest.count || 0) ? { day, count } : busiest, {})
        : null;

      // Format patterns for charts
      const hourlyPattern = Array.from({length: 24}, (_, hour) => ({
        hour: hour,
        count: hourlyData[hour] || 0,
        label: `${hour}:00`
      }));

      const dailyPattern = dayNames.map(day => ({
        day,
        count: dailyData[day] || 0
      }));

      setMetrics({
        totalResponses,
        responseRate,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
        overallScore: Math.round(overallScore * 10) / 10,
        happyCustomers,
        resolutionRate,
        // Staff Performance
        topStaffMember,
        avgStaffResponseTime: Math.round(avgStaffResponseTime * 10) / 10,
        staffResolutionCount,
        // Time Patterns
        peakHour,
        busiestDay,
        hourlyPattern,
        dailyPattern
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
    },
    {
      title: 'Staff Performance',
      icon: Users,
      color: 'purple',
      metrics: [
        { 
          label: 'Top Performer', 
          value: loading ? '—' : (metrics.topStaffMember ? metrics.topStaffMember.name : 'No data'), 
          period: `${metrics.topStaffMember ? metrics.topStaffMember.resolutions : 0} resolutions` 
        },
        { 
          label: 'Avg Staff Response', 
          value: loading ? '—' : formatTime(metrics.avgStaffResponseTime), 
          period: 'Time to resolve' 
        },
        { 
          label: 'Total Staff Resolutions', 
          value: loading ? '—' : formatNumber(metrics.staffResolutionCount), 
          period: 'Issues handled by staff' 
        }
      ]
    },
    {
      title: 'Time Patterns',
      icon: Clock,
      color: 'orange',
      metrics: [
        { 
          label: 'Peak Hour', 
          value: loading ? '—' : (metrics.peakHour ? `${metrics.peakHour.hour}:00` : 'No data'), 
          period: `${metrics.peakHour ? metrics.peakHour.count : 0} activities` 
        },
        { 
          label: 'Busiest Day', 
          value: loading ? '—' : (metrics.busiestDay ? metrics.busiestDay.day : 'No data'), 
          period: `${metrics.busiestDay ? metrics.busiestDay.count : 0} activities` 
        },
        { 
          label: 'Daily Average', 
          value: loading ? '—' : Math.round((metrics.totalResponses || 0) / 7), 
          period: 'Activities per day' 
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
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 Days</option>
              <option value="last14">Last 14 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="all">All-time</option>
            </select>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
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