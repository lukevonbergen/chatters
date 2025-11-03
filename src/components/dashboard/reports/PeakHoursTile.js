import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PeakHoursTile = ({ venueId }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchHourlyData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        // Fetch today's feedback
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('created_at')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        // Initialize hourly buckets (0-23)
        const hourCounts = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          label: formatHour(i),
          count: 0
        }));

        // Count feedback by hour
        (feedbackData || []).forEach(feedback => {
          const date = new Date(feedback.created_at);
          const hour = date.getHours();
          if (hour >= 0 && hour < 24) {
            hourCounts[hour].count++;
          }
        });

        // Filter to show only hours with activity or current operating window
        const currentHour = now.getHours();
        const relevantHours = hourCounts.filter((h, index) => {
          // Show hours with activity
          if (h.count > 0) return true;
          // Show current hour and nearby hours for context
          if (Math.abs(index - currentHour) <= 2) return true;
          return false;
        });

        setHourlyData(relevantHours.length > 0 ? relevantHours : hourCounts.slice(8, 22)); // Default to 8am-10pm if no data
      } catch (error) {
        console.error('Error fetching hourly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyData();
  }, [venueId]);

  const formatHour = (hour) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
  };

  const peakHour = hourlyData.reduce((max, h) => h.count > max.count ? h : max, { count: 0, label: '' });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Peak Hours
          </CardTitle>
          <CardDescription>When customers leave feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Peak Hours
        </CardTitle>
        <CardDescription>
          {peakHour.count > 0
            ? `Busiest time: ${peakHour.label} (${peakHour.count} submissions)`
            : 'No feedback submissions yet today'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#374151', fontWeight: '600' }}
              cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }}
            />
            <Bar
              dataKey="count"
              fill="#9333ea"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PeakHoursTile;
