import React from 'react';
import { BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SatisfactionTrendTile = ({ satisfactionTrend }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
      <div className="mb-4">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Satisfaction Trend</h2>
        <p className="text-gray-600 text-sm">
          Daily average satisfaction scores over time.
        </p>
      </div>
      
      {satisfactionTrend.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={satisfactionTrend}>
              <XAxis 
                dataKey="day"
                stroke="#6B7280" 
                fontSize={11}
                tick={{ fill: '#6B7280' }}
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
                stroke="#6B7280" 
                fontSize={11} 
                allowDecimals={false}
                tick={{ fill: '#6B7280' }}
                width={30}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
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
                stroke="#000000" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#000000', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#000000', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p className="text-sm mb-1">No trend data available</p>
            <p className="text-xs">Trends will appear as feedback is collected</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatisfactionTrendTile;