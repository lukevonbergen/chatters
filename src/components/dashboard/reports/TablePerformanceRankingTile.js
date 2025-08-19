import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TablePerformanceRankingTile = ({ venueId }) => {
  const [tablePerformance, setTablePerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchTablePerformance();
  }, [venueId]);

  const fetchTablePerformance = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('feedback')
      .select('table_number, rating')
      .eq('venue_id', venueId)
      .not('rating', 'is', null)
      .not('table_number', 'is', null);

    if (error) {
      console.error('Error fetching table performance:', error);
      setLoading(false);
      return;
    }

    // Group by table and calculate averages
    const tableGroups = {};
    data.forEach(item => {
      const table = item.table_number;
      if (!tableGroups[table]) {
        tableGroups[table] = {
          ratings: [],
          totalRatings: 0
        };
      }
      tableGroups[table].ratings.push(item.rating);
      tableGroups[table].totalRatings++;
    });

    // Calculate averages and sort
    const tableStats = Object.entries(tableGroups).map(([table, data]) => {
      const average = data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length;
      return {
        table,
        average: parseFloat(average.toFixed(2)),
        totalFeedback: data.totalRatings,
        ratings: data.ratings
      };
    }).sort((a, b) => b.average - a.average); // Sort by average descending

    setTablePerformance(tableStats);
    setLoading(false);
  };

  const getPerformanceIcon = (average, index, totalTables) => {
    if (index < totalTables * 0.3) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (index >= totalTables * 0.7) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-yellow-600" />;
  };

  const getPerformanceColor = (average, index, totalTables) => {
    if (index < totalTables * 0.3) return 'border-l-green-500 bg-green-50';
    if (index >= totalTables * 0.7) return 'border-l-red-500 bg-red-50';
    return 'border-l-yellow-500 bg-yellow-50';
  };

  const getScoreColor = (average) => {
    if (average >= 4) return 'text-green-600 font-semibold';
    if (average >= 3) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-600" />
            Table Performance Ranking
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tables ranked by average customer satisfaction
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded border-l-4"></div>
            </div>
          ))}
        </div>
      ) : tablePerformance.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No table data available</p>
          <p className="text-xs">Table performance will appear as feedback is collected</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {tablePerformance.map((table, index) => (
            <div 
              key={table.table}
              className={`border border-gray-200 rounded-lg p-4 border-l-4 ${getPerformanceColor(table.average, index, tablePerformance.length)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    {getPerformanceIcon(table.average, index, tablePerformance.length)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Table {table.table}
                    </div>
                    <div className="text-xs text-gray-500">
                      {table.totalFeedback} response{table.totalFeedback !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(table.average)}`}>
                    {table.average}
                  </div>
                  <div className="text-xs text-gray-500">
                    avg rating
                  </div>
                </div>
              </div>
              
              {/* Mini rating distribution */}
              <div className="mt-2 flex items-center space-x-1">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = table.ratings.filter(r => r === rating).length;
                  const percentage = (count / table.totalFeedback) * 100;
                  return (
                    <div key={rating} className="flex-1">
                      <div 
                        className="h-1 bg-gray-600 rounded"
                        style={{ 
                          opacity: percentage / 100,
                          backgroundColor: rating >= 4 ? '#10B981' : rating >= 3 ? '#F59E0B' : '#EF4444'
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tablePerformance.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Best: {tablePerformance[0]?.average}/5</span>
            <span>{tablePerformance.length} tables active</span>
            <span>Lowest: {tablePerformance[tablePerformance.length - 1]?.average}/5</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePerformanceRankingTile;