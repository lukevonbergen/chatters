import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Clock, TrendingUp, Users, AlertCircle, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/card';

const PeakHoursAnalysisTile = ({ venueId }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [peakHour, setPeakHour] = useState(null);
  const [peakDay, setPeakDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchPeakHoursData();
  }, [venueId]);

  const fetchPeakHoursData = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('feedback')
      .select('created_at, rating')
      .eq('venue_id', venueId)
      .not('created_at', 'is', null);

    if (error) {
      console.error('Error fetching peak hours data:', error);
      setLoading(false);
      return;
    }

    // Process hourly data
    const hourCounts = Array(24).fill(0);
    const hourSatisfaction = Array(24).fill(0);
    const hourRatingCounts = Array(24).fill(0);

    // Process weekly data
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    const daySatisfaction = Array(7).fill(0);
    const dayRatingCounts = Array(7).fill(0);

    data.forEach(item => {
      const date = new Date(item.created_at);
      const hour = date.getHours();
      const day = date.getDay();
      
      // Hour analysis
      hourCounts[hour]++;
      if (item.rating && item.rating >= 1 && item.rating <= 5) {
        hourSatisfaction[hour] += item.rating;
        hourRatingCounts[hour]++;
      }

      // Day analysis
      dayCounts[day]++;
      if (item.rating && item.rating >= 1 && item.rating <= 5) {
        daySatisfaction[day] += item.rating;
        dayRatingCounts[day]++;
      }
    });

    // Calculate hourly averages
    const hourlyStats = hourCounts.map((count, hour) => ({
      hour,
      count,
      avgSatisfaction: hourRatingCounts[hour] > 0 ? 
        (hourSatisfaction[hour] / hourRatingCounts[hour]).toFixed(2) : 0,
      label: `${hour.toString().padStart(2, '0')}:00`
    }));

    // Calculate daily averages
    const weeklyStats = dayCounts.map((count, day) => ({
      day: weekDays[day],
      count,
      avgSatisfaction: dayRatingCounts[day] > 0 ? 
        (daySatisfaction[day] / dayRatingCounts[day]).toFixed(2) : 0,
    }));

    // Find peaks
    const peakHourData = hourlyStats.reduce((max, curr) => 
      curr.count > max.count ? curr : max, hourlyStats[0]);
    const peakDayData = weeklyStats.reduce((max, curr) => 
      curr.count > max.count ? curr : max, weeklyStats[0]);

    setHourlyData(hourlyStats);
    setWeeklyData(weeklyStats);
    setPeakHour(peakHourData);
    setPeakDay(peakDayData);
    setLoading(false);
  };

  const getIntensityColor = (count, maxCount) => {
    const intensity = maxCount > 0 ? count / maxCount : 0;
    if (intensity >= 0.8) return 'bg-slate-900';
    if (intensity >= 0.6) return 'bg-slate-700';
    if (intensity >= 0.4) return 'bg-slate-500';
    if (intensity >= 0.2) return 'bg-slate-300';
    return 'bg-slate-100';
  };

  const maxHourlyCount = Math.max(...hourlyData.map(h => h.count));
  const maxDailyCount = Math.max(...weeklyData.map(d => d.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          Peak Hours Analysis
        </CardTitle>
        <CardDescription>
          When customers are most likely to leave feedback
        </CardDescription>
      </CardHeader>

      <CardContent>

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-24 gap-1 mb-6">
              {Array(24).fill(0).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array(7).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : hourlyData.every(h => h.count === 0) ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h4>
          <p className="text-sm text-gray-600">
            Peak hours analysis will appear once you start receiving feedback
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Peak Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-900">Peak Hour</span>
                </div>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                {peakHour?.label}
              </div>
              <div className="text-sm text-purple-700">
                {peakHour?.count} responses • {peakHour?.avgSatisfaction}★ avg
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Peak Day</span>
                </div>
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                {peakDay?.day}
              </div>
              <div className="text-sm text-green-700">
                {peakDay?.count} responses • {peakDay?.avgSatisfaction}★ avg
              </div>
            </div>
          </div>

          {/* Hourly Heatmap */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              Hourly Activity
            </h4>
            <div className="grid grid-cols-12 md:grid-cols-24 gap-1 mb-2">
              {hourlyData.map((hour) => (
                <div key={hour.hour} className="text-center">
                  <div
                    className={`h-8 rounded transition-all duration-200 cursor-pointer hover:scale-110 ${getIntensityColor(hour.count, maxHourlyCount)}`}
                    title={`${hour.label}: ${hour.count} responses (${hour.avgSatisfaction}★)`}
                  />
                  <div className="text-xs text-gray-500 mt-1 hidden md:block">
                    {hour.hour % 6 === 0 ? hour.hour : ''}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>

          {/* Weekly Overview */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-gray-600" />
              Weekly Pattern
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {weeklyData.map((day) => (
                <div key={day.day} className="text-center">
                  <div
                    className={`h-16 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 ${getIntensityColor(day.count, maxDailyCount)} flex items-end justify-center p-2`}
                    title={`${day.day}: ${day.count} responses (${day.avgSatisfaction}★)`}
                  >
                    <span className="text-white font-bold text-sm">{day.count}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    {day.day.slice(0, 3)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Activity Level:</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>Low</span>
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Medium</span>
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>High</span>
              </div>
            </div>
            {peakHour && (
              <div className="flex items-center text-xs text-gray-500">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>Optimize staffing around {peakHour.label}</span>
              </div>
            )}
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  );
};

export default PeakHoursAnalysisTile;