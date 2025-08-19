import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Clock, Zap, AlertCircle, Target, Timer, TrendingUp } from 'lucide-react';

const ResponseTimeAnalyticsTile = ({ venueId }) => {
  const [responseData, setResponseData] = useState([]);
  const [averageTime, setAverageTime] = useState(0);
  const [medianTime, setMedianTime] = useState(0);
  const [slaCompliance, setSlaCompliance] = useState(0);
  const [timeDistribution, setTimeDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchResponseTimeData();
  }, [venueId]);

  const fetchResponseTimeData = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('feedback')
      .select('created_at, is_actioned, actioned_at, rating, table_number')
      .eq('venue_id', venueId)
      .eq('is_actioned', true)
      .not('actioned_at', 'is', null)
      .not('created_at', 'is', null);

    if (error) {
      console.error('Error fetching response time data:', error);
      setLoading(false);
      return;
    }

    // Calculate response times
    const responseTimes = data.map(item => {
      const created = new Date(item.created_at);
      const actioned = new Date(item.actioned_at);
      const responseTimeMinutes = (actioned - created) / (1000 * 60); // Convert to minutes
      
      return {
        ...item,
        responseTime: responseTimeMinutes,
        responseTimeHours: responseTimeMinutes / 60
      };
    }).filter(item => item.responseTime >= 0); // Filter out invalid times

    if (responseTimes.length === 0) {
      setLoading(false);
      return;
    }

    // Calculate statistics
    const times = responseTimes.map(rt => rt.responseTime);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    // Calculate median
    const sortedTimes = [...times].sort((a, b) => a - b);
    const medTime = sortedTimes.length % 2 === 0
      ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
      : sortedTimes[Math.floor(sortedTimes.length / 2)];

    // SLA Compliance (assuming 2 hours = 120 minutes as target)
    const SLA_TARGET_MINUTES = 120;
    const compliantResponses = times.filter(time => time <= SLA_TARGET_MINUTES).length;
    const compliance = (compliantResponses / times.length) * 100;

    // Time distribution buckets
    const buckets = [
      { label: '< 15 min', min: 0, max: 15, count: 0, color: 'bg-green-500' },
      { label: '15-30 min', min: 15, max: 30, count: 0, color: 'bg-green-400' },
      { label: '30-60 min', min: 30, max: 60, count: 0, color: 'bg-yellow-500' },
      { label: '1-2 hours', min: 60, max: 120, count: 0, color: 'bg-orange-500' },
      { label: '2-4 hours', min: 120, max: 240, count: 0, color: 'bg-red-400' },
      { label: '> 4 hours', min: 240, max: Infinity, count: 0, color: 'bg-red-600' }
    ];

    times.forEach(time => {
      for (let bucket of buckets) {
        if (time >= bucket.min && time < bucket.max) {
          bucket.count++;
          break;
        }
      }
    });

    // Add percentages to buckets
    const distributionData = buckets.map(bucket => ({
      ...bucket,
      percentage: (bucket.count / times.length) * 100
    }));

    // Group by table for table-specific analysis
    const tableStats = {};
    responseTimes.forEach(rt => {
      if (rt.table_number) {
        if (!tableStats[rt.table_number]) {
          tableStats[rt.table_number] = [];
        }
        tableStats[rt.table_number].push(rt.responseTime);
      }
    });

    const tableAnalysis = Object.entries(tableStats).map(([table, times]) => ({
      table,
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      count: times.length,
      compliance: (times.filter(time => time <= SLA_TARGET_MINUTES).length / times.length) * 100
    })).sort((a, b) => a.avgTime - b.avgTime);

    // Weekly trend analysis
    const weeklyData = {};
    responseTimes.forEach(rt => {
      const week = new Date(rt.created_at);
      week.setDate(week.getDate() - week.getDay()); // Start of week
      const weekKey = week.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(rt.responseTime);
    });

    const weeklyTrend = Object.entries(weeklyData)
      .map(([week, times]) => ({
        week,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        count: times.length
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-8); // Last 8 weeks

    setResponseData({
      totalResponses: responseTimes.length,
      rawTimes: times,
      tableAnalysis,
      weeklyTrend
    });
    setAverageTime(avgTime);
    setMedianTime(medTime);
    setSlaCompliance(compliance);
    setTimeDistribution(distributionData);
    setLoading(false);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  const getPerformanceColor = (minutes) => {
    if (minutes <= 15) return 'text-green-600';
    if (minutes <= 60) return 'text-yellow-600';
    if (minutes <= 120) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (minutes) => {
    if (minutes <= 15) return <Zap className="w-4 h-4 text-green-600" />;
    if (minutes <= 60) return <Target className="w-4 h-4 text-yellow-600" />;
    if (minutes <= 120) return <Timer className="w-4 h-4 text-orange-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            Response Time Analytics
          </h3>
          <p className="text-sm text-gray-600">
            How quickly your team responds to customer feedback
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ) : !responseData.totalResponses ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Response Data</h4>
          <p className="text-sm text-gray-600">
            Response time analytics will appear once you start marking feedback as actioned
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {getPerformanceIcon(averageTime)}
              </div>
              <div className={`text-2xl font-bold mb-1 ${getPerformanceColor(averageTime)}`}>
                {formatTime(averageTime)}
              </div>
              <div className="text-sm text-blue-700 font-medium">Average Response</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <Timer className="w-4 h-4 text-green-600" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getPerformanceColor(medianTime)}`}>
                {formatTime(medianTime)}
              </div>
              <div className="text-sm text-green-700 font-medium">Median Response</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${slaCompliance >= 80 ? 'text-green-600' : slaCompliance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {slaCompliance.toFixed(0)}%
              </div>
              <div className="text-sm text-purple-700 font-medium">SLA Compliance</div>
              <div className="text-xs text-purple-600">{'< 2 hours'}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <div className="text-orange-600 text-sm font-medium">Total</div>
              </div>
              <div className="text-2xl font-bold text-orange-900 mb-1">
                {responseData.totalResponses}
              </div>
              <div className="text-sm text-orange-700 font-medium">Responses Tracked</div>
            </div>
          </div>

          {/* Response Time Distribution */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Timer className="w-4 h-4 mr-2 text-gray-600" />
              Response Time Distribution
            </h4>
            <div className="space-y-2">
              {timeDistribution.map((bucket, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm font-medium text-gray-700">
                    {bucket.label}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${bucket.color} flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max(bucket.percentage, 2)}%` }}
                      >
                        {bucket.percentage > 10 && (
                          <span className="text-white text-xs font-medium">
                            {bucket.count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {bucket.percentage.toFixed(0)}%
                  </div>
                  <div className="w-10 text-right text-sm font-medium text-gray-900">
                    {bucket.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Performance */}
          {responseData.tableAnalysis && responseData.tableAnalysis.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-gray-600" />
                Table Response Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                {responseData.tableAnalysis.slice(0, 12).map((table) => (
                  <div key={table.table} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">Table {table.table}</span>
                      {getPerformanceIcon(table.avgTime)}
                    </div>
                    <div className={`text-lg font-bold ${getPerformanceColor(table.avgTime)}`}>
                      {formatTime(table.avgTime)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {table.count} responses • {table.compliance.toFixed(0)}% SLA
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Trend */}
          {responseData.weeklyTrend && responseData.weeklyTrend.length > 2 && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
                Weekly Trend
              </h4>
              <div className="flex items-end justify-between h-24 bg-gray-50 rounded-lg p-3">
                {responseData.weeklyTrend.map((week, index) => {
                  const maxTime = Math.max(...responseData.weeklyTrend.map(w => w.avgTime));
                  const height = (week.avgTime / maxTime) * 100;
                  
                  return (
                    <div key={week.week} className="flex flex-col items-center flex-1 mx-1">
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${getPerformanceColor(week.avgTime) === 'text-green-600' ? 'bg-green-500' : 
                          getPerformanceColor(week.avgTime) === 'text-yellow-600' ? 'bg-yellow-500' :
                          getPerformanceColor(week.avgTime) === 'text-orange-600' ? 'bg-orange-500' : 'bg-red-500'}`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                        title={`Week of ${new Date(week.week).toLocaleDateString()}: ${formatTime(week.avgTime)} avg (${week.count} responses)`}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Performance Insights */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Insights</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {averageTime <= 30 && (
                <div className="flex items-center text-green-700">
                  <Zap className="w-3 h-3 mr-1" />
                  Excellent response times - keep up the great work!
                </div>
              )}
              {averageTime > 120 && (
                <div className="flex items-center text-red-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Response times above 2 hours may impact customer satisfaction
                </div>
              )}
              {slaCompliance < 80 && (
                <div className="flex items-center text-orange-700">
                  <Timer className="w-3 h-3 mr-1" />
                  Consider setting response time targets to improve consistency
                </div>
              )}
              {responseData.tableAnalysis && responseData.tableAnalysis.length > 0 && (
                <div>
                  • Fastest table: Table {responseData.tableAnalysis[0]?.table} 
                  ({formatTime(responseData.tableAnalysis[0]?.avgTime)})
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseTimeAnalyticsTile;