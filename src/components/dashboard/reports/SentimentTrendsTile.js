import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { TrendingUp, TrendingDown, Calendar, Smile, Frown, Meh } from 'lucide-react';

const SentimentTrendsTile = ({ venueId }) => {
  const [sentimentData, setSentimentData] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [currentSentiment, setCurrentSentiment] = useState(null);
  const [sentimentChange, setSentimentChange] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    fetchSentimentTrends();
  }, [venueId]);

  const fetchSentimentTrends = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('feedback')
      .select('created_at, sentiment, rating')
      .eq('venue_id', venueId)
      .not('created_at', 'is', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sentiment trends:', error);
      setLoading(false);
      return;
    }

    // Group by day for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyData = {};
    
    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      dailyData[key] = {
        date: key,
        sentiments: { '😍': 0, '😊': 0, '😐': 0, '😞': 0, '😠': 0 },
        ratings: [],
        total: 0
      };
    }

    // Process feedback data
    data.forEach(item => {
      const date = new Date(item.created_at);
      if (date >= thirtyDaysAgo) {
        const key = date.toISOString().split('T')[0];
        if (dailyData[key]) {
          if (item.sentiment) {
            dailyData[key].sentiments[item.sentiment]++;
            dailyData[key].total++;
          }
          if (item.rating) {
            dailyData[key].ratings.push(item.rating);
          }
        }
      }
    });

    // Calculate daily sentiment scores and trends
    const dailyStats = Object.values(dailyData)
      .reverse() // Show chronologically
      .map(day => {
        const sentiments = day.sentiments;
        const total = day.total;
        
        // Calculate weighted sentiment score (1-5 scale)
        const score = total > 0 ? 
          ((sentiments['😍'] * 5) + (sentiments['😊'] * 4) + (sentiments['😐'] * 3) + 
           (sentiments['😞'] * 2) + (sentiments['😠'] * 1)) / total : 0;

        const avgRating = day.ratings.length > 0 ? 
          day.ratings.reduce((sum, r) => sum + r, 0) / day.ratings.length : 0;

        return {
          ...day,
          sentimentScore: parseFloat(score.toFixed(2)),
          avgRating: parseFloat(avgRating.toFixed(2)),
          formattedDate: new Date(day.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        };
      });

    // Calculate 7-day rolling averages for weekly trend
    const weeklyStats = [];
    for (let i = 6; i < dailyStats.length; i++) {
      const weekData = dailyStats.slice(i - 6, i + 1);
      const avgScore = weekData
        .filter(d => d.sentimentScore > 0)
        .reduce((sum, d, _, arr) => sum + d.sentimentScore / arr.length, 0);
      
      weeklyStats.push({
        date: dailyStats[i].date,
        formattedDate: dailyStats[i].formattedDate,
        weeklyAvg: parseFloat(avgScore.toFixed(2))
      });
    }

    // Calculate current sentiment and change
    const recentData = dailyStats.slice(-7).filter(d => d.total > 0);
    const currentAvg = recentData.length > 0 ? 
      recentData.reduce((sum, d) => sum + d.sentimentScore, 0) / recentData.length : 0;
    
    const previousData = dailyStats.slice(-14, -7).filter(d => d.total > 0);
    const previousAvg = previousData.length > 0 ? 
      previousData.reduce((sum, d) => sum + d.sentimentScore, 0) / previousData.length : 0;
    
    const change = previousAvg > 0 ? 
      ((currentAvg - previousAvg) / previousAvg * 100) : 0;

    setSentimentData(dailyStats);
    setWeeklyTrend(weeklyStats);
    setCurrentSentiment(parseFloat(currentAvg.toFixed(2)));
    setSentimentChange(parseFloat(change.toFixed(1)));
    setLoading(false);
  };

  const getSentimentIcon = (score) => {
    if (score >= 4) return <Smile className="w-5 h-5 text-green-600" />;
    if (score >= 3) return <Meh className="w-5 h-5 text-yellow-600" />;
    return <Frown className="w-5 h-5 text-red-600" />;
  };

  const getSentimentColor = (score) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentBg = (score) => {
    if (score >= 4) return 'bg-green-50 border-green-200';
    if (score >= 3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getBarHeight = (score, maxScore) => {
    if (maxScore === 0) return 0;
    return Math.max((score / maxScore) * 100, 2);
  };

  const maxScore = Math.max(...sentimentData.map(d => d.sentimentScore));
  const maxWeeklyScore = Math.max(...weeklyTrend.map(d => d.weeklyAvg));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            Sentiment Trends
          </h3>
          <p className="text-sm text-gray-600">
            Customer emotion patterns over the last 30 days
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ) : sentimentData.every(d => d.total === 0) ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Sentiment Data</h4>
          <p className="text-sm text-gray-600">
            Sentiment trends will appear once customers start leaving emoji feedback
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Sentiment Summary */}
          <div className={`rounded-lg p-4 border ${getSentimentBg(currentSentiment)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getSentimentIcon(currentSentiment)}
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Current Sentiment</div>
                  <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment)}`}>
                    {currentSentiment}/5
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-sm font-medium">
                  {sentimentChange > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-green-600">+{sentimentChange}%</span>
                    </>
                  ) : sentimentChange < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-red-600">{sentimentChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="text-gray-600">0%</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500">vs last week</div>
              </div>
            </div>
          </div>

          {/* Daily Sentiment Chart */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-600" />
              Daily Sentiment Score
            </h4>
            <div className="relative">
              <div className="flex items-end justify-between h-32 mb-2">
                {sentimentData.slice(-14).map((day, index) => (
                  <div key={day.date} className="flex flex-col items-center flex-1 mx-0.5">
                    <div
                      className={`w-full rounded-t transition-all duration-200 cursor-pointer hover:opacity-75 ${
                        day.sentimentScore >= 4 ? 'bg-green-500' :
                        day.sentimentScore >= 3 ? 'bg-yellow-500' : 
                        day.sentimentScore > 0 ? 'bg-red-500' : 'bg-gray-200'
                      }`}
                      style={{ 
                        height: day.total > 0 ? `${getBarHeight(day.sentimentScore, 5)}%` : '2px'
                      }}
                      title={`${day.formattedDate}: ${day.sentimentScore}/5 (${day.total} responses)`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                {sentimentData.slice(-14).filter((_, i) => i % 3 === 0).map(day => (
                  <span key={day.date}>{day.formattedDate}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Trend */}
          {weeklyTrend.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
                7-Day Rolling Average
              </h4>
              <div className="relative">
                <div className="flex items-end justify-between h-20 mb-2">
                  {weeklyTrend.slice(-10).map((week, index) => (
                    <div key={week.date} className="flex flex-col items-center flex-1 mx-0.5">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all duration-200 cursor-pointer hover:bg-blue-600"
                        style={{ 
                          height: `${getBarHeight(week.weeklyAvg, maxWeeklyScore)}%`
                        }}
                        title={`${week.formattedDate}: ${week.weeklyAvg}/5 (7-day average)`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  {weeklyTrend.slice(-10).filter((_, i) => i % 2 === 0).map(week => (
                    <span key={week.date}>{week.formattedDate}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sentiment Breakdown */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { emoji: '😍', label: 'Love', color: 'bg-green-500' },
              { emoji: '😊', label: 'Happy', color: 'bg-green-400' },
              { emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
              { emoji: '😞', label: 'Sad', color: 'bg-orange-500' },
              { emoji: '😠', label: 'Angry', color: 'bg-red-500' }
            ].map(({ emoji, label, color }) => {
              const recentCount = sentimentData.slice(-7).reduce((sum, d) => 
                sum + d.sentiments[emoji], 0);
              const totalRecent = sentimentData.slice(-7).reduce((sum, d) => 
                sum + d.total, 0);
              const percentage = totalRecent > 0 ? 
                ((recentCount / totalRecent) * 100).toFixed(0) : 0;

              return (
                <div key={emoji} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-xs font-medium text-gray-900">{percentage}%</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentTrendsTile;