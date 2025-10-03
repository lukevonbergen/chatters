import React, { useState, useEffect } from 'react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';
import usePageTitle from '../../hooks/usePageTitle';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import { TrendingUp, TrendingDown, Minus, Mail, MailCheck, MailX } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const ReportsNPS = () => {
  usePageTitle('NPS Reports');
  const { venueId } = useVenue();

  const [loading, setLoading] = useState(true);
  const [npsData, setNpsData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (!venueId) return;
    loadNPSData();
  }, [venueId, dateRange]);

  const loadNPSData = async () => {
    try {
      setLoading(true);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Get all NPS submissions for the venue
      const { data, error } = await supabase
        .from('nps_submissions')
        .select('*')
        .eq('venue_id', venueId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      setSubmissions(data || []);
      calculateNPSMetrics(data || []);
    } catch (error) {
      console.error('Error loading NPS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNPSMetrics = (data) => {
    const totalSubmissions = data.length;
    const sent = data.filter((s) => s.sent_at).length;
    const responded = data.filter((s) => s.responded_at).length;
    const pending = data.filter((s) => !s.sent_at).length;
    const failed = data.filter((s) => s.send_error).length;

    // Calculate NPS from responses
    const responses = data.filter((s) => s.score !== null);
    const promoters = responses.filter((s) => s.score >= 9).length;
    const passives = responses.filter((s) => s.score >= 7 && s.score <= 8).length;
    const detractors = responses.filter((s) => s.score <= 6).length;

    const npsScore =
      responses.length > 0
        ? Math.round(((promoters - detractors) / responses.length) * 100)
        : null;

    const responseRate =
      sent > 0 ? Math.round((responded / sent) * 100) : 0;

    // Group by day for trend chart
    const trendData = {};
    responses.forEach((response) => {
      const day = new Date(response.responded_at).toLocaleDateString();
      if (!trendData[day]) {
        trendData[day] = { promoters: 0, passives: 0, detractors: 0, total: 0 };
      }
      if (response.score >= 9) trendData[day].promoters++;
      else if (response.score >= 7) trendData[day].passives++;
      else trendData[day].detractors++;
      trendData[day].total++;
    });

    const trendChartData = Object.entries(trendData).map(([date, counts]) => ({
      date,
      nps: Math.round(
        ((counts.promoters - counts.detractors) / counts.total) * 100
      ),
    }));

    // Distribution data for bar chart
    const distributionData = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: responses.filter((s) => s.score === i).length,
    }));

    setNpsData({
      totalSubmissions,
      sent,
      responded,
      pending,
      failed,
      npsScore,
      promoters,
      passives,
      detractors,
      responseRate,
      trendChartData,
      distributionData,
    });
  };

  const getCategoryColor = (score) => {
    if (score >= 9) return '#10b981'; // green
    if (score >= 7) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getNPSColor = (score) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNPSTrend = (score) => {
    if (score >= 50) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score >= 0) return <Minus className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  if (!venueId) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!npsData) {
    return <div className="p-6 text-gray-500">No NPS data available</div>;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="NPS Reports"
        subtitle="Net Promoter Score analytics and customer sentiment"
        actions={
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* NPS Score */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  npsData.npsScore !== null && npsData.npsScore >= 50
                    ? 'bg-green-100'
                    : npsData.npsScore !== null && npsData.npsScore >= 0
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}>
                  {npsData.npsScore !== null ? (
                    getNPSTrend(npsData.npsScore)
                  ) : (
                    <Minus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                npsData.npsScore !== null ? getNPSColor(npsData.npsScore) : 'text-gray-400'
              }`}>
                {npsData.npsScore !== null ? npsData.npsScore : '—'}
              </div>
              <div className="text-sm text-gray-600">
                NPS Score
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {npsData.responded} responses
              </div>
            </div>

            {/* Response Rate */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MailCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {npsData.responseRate}%
              </div>
              <div className="text-sm text-gray-600">
                Response Rate
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {npsData.responded} of {npsData.sent} sent
              </div>
            </div>

            {/* Emails Sent */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {npsData.sent}
              </div>
              <div className="text-sm text-gray-600">
                Emails Sent
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {npsData.pending} pending
              </div>
            </div>

            {/* Failed */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <MailX className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {npsData.failed}
              </div>
              <div className="text-sm text-gray-600">
                Failed Emails
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Send errors
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {npsData.responded > 0
                    ? Math.round((npsData.promoters / npsData.responded) * 100)
                    : 0}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {npsData.promoters}
              </div>
              <div className="text-sm text-gray-600">
                Promoters (9-10)
              </div>
              <div className="text-xs text-gray-500 mt-1">
                of {npsData.responded} responses
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Minus className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  {npsData.responded > 0
                    ? Math.round((npsData.passives / npsData.responded) * 100)
                    : 0}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {npsData.passives}
              </div>
              <div className="text-sm text-gray-600">
                Passives (7-8)
              </div>
              <div className="text-xs text-gray-500 mt-1">
                of {npsData.responded} responses
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  {npsData.responded > 0
                    ? Math.round((npsData.detractors / npsData.responded) * 100)
                    : 0}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {npsData.detractors}
              </div>
              <div className="text-sm text-gray-600">
                Detractors (0-6)
              </div>
              <div className="text-xs text-gray-500 mt-1">
                of {npsData.responded} responses
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NPS Trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">NPS Trend Over Time</h3>
                <p className="text-xs text-gray-600 mt-1">Net Promoter Score progression</p>
              </div>
              {npsData.trendChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={npsData.trendChartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748B"
                        fontSize={12}
                        tick={{ fill: '#64748B' }}
                      />
                      <YAxis
                        domain={[-100, 100]}
                        stroke="#64748B"
                        fontSize={12}
                        tick={{ fill: '#64748B' }}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 'bold',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value) => [value, 'NPS Score']}
                      />
                      <Area
                        type="linear"
                        dataKey="nps"
                        stroke="#3b82f6"
                        fill="url(#colorNPS)"
                        strokeWidth={2}
                        connectNulls={true}
                        isAnimationActive={false}
                        dot={{ r: 2, fill: '#3b82f6', strokeWidth: 0 }}
                        activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'white' }}
                      />
                      <defs>
                        <linearGradient id="colorNPS" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No trend data available
                </div>
              )}
            </div>

            {/* Score Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">Score Distribution</h3>
                <p className="text-xs text-gray-600 mt-1">Response breakdown by rating (0-10)</p>
              </div>
              {npsData.distributionData.some((d) => d.count > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={npsData.distributionData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="score"
                        stroke="#64748B"
                        fontSize={12}
                        tick={{ fill: '#64748B' }}
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={12}
                        tick={{ fill: '#64748B' }}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 'bold',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        formatter={(value, name, props) => {
                          const score = props.payload.score;
                          const category = score >= 9 ? 'Promoter' : score >= 7 ? 'Passive' : 'Detractor';
                          return [
                            `${value} responses`,
                            `Score ${score} (${category})`
                          ];
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {npsData.distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryColor(entry.score)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No distribution data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Responses Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Responses</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions
                    .filter((s) => s.responded_at)
                    .slice(0, 10)
                    .map((submission) => {
                      const category =
                        submission.score >= 9
                          ? { label: 'Promoter', color: 'text-green-600' }
                          : submission.score >= 7
                          ? { label: 'Passive', color: 'text-yellow-600' }
                          : { label: 'Detractor', color: 'text-red-600' };

                      return (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{submission.customer_email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-lg font-bold ${category.color}`}>
                              {submission.score}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${category.color}`}>
                              {category.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(submission.responded_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Responded
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  {submissions.filter((s) => s.responded_at).length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        No responses yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default ReportsNPS;
