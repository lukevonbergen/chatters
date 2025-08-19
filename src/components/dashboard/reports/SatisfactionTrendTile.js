import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../utils/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/card';

const SatisfactionTrendTile = ({ venueId, satisfactionTrend: propSatisfactionTrend }) => {
  const [satisfactionTrend, setSatisfactionTrend] = useState(propSatisfactionTrend || []);
  const [loading, setLoading] = useState(!propSatisfactionTrend);

  useEffect(() => {
    if (!propSatisfactionTrend && venueId) {
      loadSatisfactionTrend();
    }
  }, [venueId, propSatisfactionTrend]);

  const loadSatisfactionTrend = async () => {
    setLoading(true);
    try {
      // Get satisfaction trend data for the last 14 days
      const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('feedback')
        .select('created_at, rating')
        .eq('venue_id', venueId)
        .gte('created_at', startDate.toISOString())
        .not('rating', 'is', null)
        .order('created_at');

      if (error) throw error;

      // Group by date and calculate averages
      const trendData = {};
      data.forEach(feedback => {
        const date = new Date(feedback.created_at).toDateString();
        if (!trendData[date]) {
          trendData[date] = { total: 0, count: 0 };
        }
        trendData[date].total += feedback.rating;
        trendData[date].count += 1;
      });

      // Convert to chart format
      const chartData = Object.entries(trendData).map(([date, data]) => ({
        day: date,
        average: +(data.total / data.count).toFixed(1)
      }));

      setSatisfactionTrend(chartData);
    } catch (error) {
      console.error('Error loading satisfaction trend:', error);
      setSatisfactionTrend([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Satisfaction Trend
          </CardTitle>
          <CardDescription>
            Daily average satisfaction scores over time
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-slate-900 rounded-full"></div>
          </div>
        ) : satisfactionTrend.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={satisfactionTrend}>
              <XAxis 
                dataKey="day"
                stroke="#64748B" 
                fontSize={12}
                tick={{ fill: '#64748B' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
                interval={Math.max(Math.floor(satisfactionTrend.length / 6), 0)}
              />
              <YAxis 
                domain={[1, 5]} 
                stroke="#64748B" 
                fontSize={12} 
                allowDecimals={false}
                tick={{ fill: '#64748B' }}
                width={35}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [value, 'Rating']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });
                }}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#0f172a" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#0f172a', strokeWidth: 0 }}
                activeDot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm mb-1 text-slate-600">No trend data available</p>
              <p className="text-xs text-slate-500">Trends will appear as feedback is collected</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SatisfactionTrendTile;