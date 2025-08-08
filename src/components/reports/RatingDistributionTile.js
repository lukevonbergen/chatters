import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { BarChart, Star, TrendingUp, Users, Heart } from 'lucide-react';

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

  const getBarGradient = (rating) => {
    if (rating === 5) return 'bg-gradient-to-r from-emerald-400 to-green-500';
    if (rating === 4) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (rating === 3) return 'bg-gradient-to-r from-yellow-400 to-amber-500';
    if (rating === 2) return 'bg-gradient-to-r from-orange-400 to-red-400';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  const getStarColors = (rating) => {
    if (rating === 5) return 'text-emerald-500';
    if (rating === 4) return 'text-green-500';
    if (rating === 3) return 'text-amber-500';
    if (rating === 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRatingLabel = (rating) => {
    const labels = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Very Poor'
    };
    return labels[rating];
  };

  const getOverallSentiment = () => {
    if (averageRating >= 4.5) return { text: 'Outstanding!', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Heart };
    if (averageRating >= 4.0) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp };
    if (averageRating >= 3.5) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp };
    if (averageRating >= 3.0) return { text: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50', icon: BarChart };
    return { text: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50', icon: BarChart };
  };

  const maxCount = Math.max(...ratingData.map(d => d.count));
  const satisfiedCount = ratingData.find(d => d.rating === 5)?.count + ratingData.find(d => d.rating === 4)?.count || 0;
  const satisfactionRate = totalRatings > 0 ? ((satisfiedCount / totalRatings) * 100).toFixed(0) : 0;
  
  const sentiment = getOverallSentiment();
  const SentimentIcon = sentiment.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <BarChart className="w-4 h-4 text-blue-600" />
            </div>
            Customer Satisfaction
          </h3>
          <p className="text-sm text-gray-600">
            How customers rate their experience
          </p>
        </div>
        
        {/* Overall Rating Card */}
        <div className={`${sentiment.bg} rounded-xl p-4 text-center min-w-[120px]`}>
          <div className="flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
            <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
          </div>
          <div className={`flex items-center justify-center text-sm font-medium ${sentiment.color} mb-1`}>
            <SentimentIcon className="w-4 h-4 mr-1" />
            {sentiment.text}
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center">
            <Users className="w-3 h-3 mr-1" />
            {totalRatings} reviews
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : totalRatings === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Ratings Yet</h4>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Your rating distribution will appear here once customers start leaving feedback
          </p>
        </div>
      ) : (
        <>
          {/* Rating Bars */}
          <div className="space-y-3 mb-6">
            {ratingData.map((data) => (
              <div key={data.rating} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < data.rating
                              ? `fill-current ${getStarColors(data.rating)}`
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getRatingLabel(data.rating)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-900">{data.count}</span>
                    <span className="text-gray-500">({data.percentage}%)</span>
                  </div>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="relative bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getBarGradient(data.rating)} relative overflow-hidden`}
                    style={{ 
                      width: maxCount > 0 ? `${(data.count / maxCount) * 100}%` : '0%'
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center border border-green-100">
              <div className="text-xl font-bold text-green-700 mb-1">
                {satisfactionRate}%
              </div>
              <div className="text-xs text-green-600 font-medium flex items-center justify-center">
                <Heart className="w-3 h-3 mr-1" />
                Satisfied
              </div>
              <div className="text-xs text-gray-500 mt-1">4-5 stars</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-3 text-center border border-amber-100">
              <div className="text-xl font-bold text-amber-700 mb-1">
                {ratingData.find(d => d.rating === 3)?.count || 0}
              </div>
              <div className="text-xs text-amber-600 font-medium flex items-center justify-center">
                <BarChart className="w-3 h-3 mr-1" />
                Neutral
              </div>
              <div className="text-xs text-gray-500 mt-1">3 stars</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 text-center border border-red-100">
              <div className="text-xl font-bold text-red-700 mb-1">
                {ratingData.find(d => d.rating === 2)?.count + ratingData.find(d => d.rating === 1)?.count || 0}
              </div>
              <div className="text-xs text-red-600 font-medium flex items-center justify-center">
                <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                Needs Work
              </div>
              <div className="text-xs text-gray-500 mt-1">1-2 stars</div>
            </div>
          </div>
        </>
      )}
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default RatingDistributionTile;