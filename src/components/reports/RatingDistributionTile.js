import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { BarChart, Star } from 'lucide-react';

const RatingDistributionTile = ({ venueId }) => {
  const [ratingData, setRatingData] = useState([]);
  const [totalRatings, setTotalRatings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchRatingDistribution();
  }, [venueId]);

  const fetchRatingDistribution = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('feedback')
      .select('rating')
      .eq('venue_id', venueId)
      .not('rating', 'is', null)
      .gte('rating', 1)
      .lte('rating', 5);

    if (error) {
      console.error('Error fetching rating distribution:', error);
      setLoading(false);
      return;
    }

    // Count ratings
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalCount = 0;
    let ratingSum = 0;

    data.forEach(item => {
      ratingCounts[item.rating]++;
      totalCount++;
      ratingSum += item.rating;
    });

    // Calculate percentages and prepare data
    const distributionData = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingCounts[rating],
      percentage: totalCount > 0 ? ((ratingCounts[rating] / totalCount) * 100).toFixed(1) : 0
    })).reverse(); // Reverse to show 5 stars at top

    setRatingData(distributionData);
    setTotalRatings(totalCount);
    setAverageRating(totalCount > 0 ? (ratingSum / totalCount).toFixed(2) : 0);
    setLoading(false);
  };

  const getBarColor = (rating) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating === 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStarColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const maxCount = Math.max(...ratingData.map(d => d.count));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-gray-600" />
            Rating Distribution
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Breakdown of customer satisfaction scores
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-xl font-bold text-gray-900">{averageRating}</span>
          </div>
          <div className="text-xs text-gray-500">{totalRatings} ratings</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : totalRatings === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BarChart className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No rating data available</p>
          <p className="text-xs">Rating distribution will appear as feedback is collected</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ratingData.map((data) => (
            <div key={data.rating} className="flex items-center space-x-3">
              {/* Star rating label */}
              <div className="flex items-center space-x-1 w-16 flex-shrink-0">
                <span className="text-sm font-medium text-gray-700">{data.rating}</span>
                <Star className={`w-4 h-4 fill-current ${getStarColor(data.rating)}`} />
              </div>

              {/* Progress bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full transition-all duration-300 ${getBarColor(data.rating)}`}
                  style={{ 
                    width: maxCount > 0 ? `${(data.count / maxCount) * 100}%` : '0%'
                  }}
                ></div>
                
                {/* Count label inside bar */}
                {data.count > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white mix-blend-difference">
                      {data.count}
                    </span>
                  </div>
                )}
              </div>

              {/* Percentage */}
              <div className="w-12 text-right">
                <span className="text-sm font-medium text-gray-700">
                  {data.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      {totalRatings > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {ratingData.find(d => d.rating === 5)?.count + ratingData.find(d => d.rating === 4)?.count || 0}
              </div>
              <div className="text-xs text-gray-500">Satisfied (4-5★)</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {ratingData.find(d => d.rating === 3)?.count || 0}
              </div>
              <div className="text-xs text-gray-500">Neutral (3★)</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {ratingData.find(d => d.rating === 2)?.count + ratingData.find(d => d.rating === 1)?.count || 0}
              </div>
              <div className="text-xs text-gray-500">Unsatisfied (1-2★)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingDistributionTile;