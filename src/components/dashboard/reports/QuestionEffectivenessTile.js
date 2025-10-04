import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { HelpCircle, TrendingUp, TrendingDown, BarChart, AlertTriangle, CheckCircle } from 'lucide-react';

const QuestionEffectivenessTile = ({ venueId }) => {
  const [questionStats, setQuestionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('response_rate'); // response_rate, avg_rating, variance

  useEffect(() => {
    if (!venueId) return;
    fetchQuestionEffectiveness();
  }, [venueId]);

  const fetchQuestionEffectiveness = async () => {
    setLoading(true);
    
    // Get all questions for this venue
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question, active, created_at')
      .eq('venue_id', venueId);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      setLoading(false);
      return;
    }

    // Get feedback data for analysis
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('question_id, rating, sentiment, created_at, session_id')
      .eq('venue_id', venueId)
      .not('question_id', 'is', null);

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      setLoading(false);
      return;
    }

    // Get total sessions to calculate response rates
    const { data: sessions, error: sessionsError } = await supabase
      .from('feedback')
      .select('session_id')
      .eq('venue_id', venueId)
      .not('session_id', 'is', null);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      setLoading(false);
      return;
    }

    const uniqueSessions = [...new Set(sessions.map(s => s.session_id))];
    const totalSessions = uniqueSessions.length;

    // Analyse each question
    const questionAnalysis = questions.map(question => {
      const questionFeedback = feedback.filter(f => f.question_id === question.id);
      const questionSessions = [...new Set(questionFeedback.map(f => f.session_id))];
      
      // Basic stats
      const responseCount = questionFeedback.length;
      const responseRate = totalSessions > 0 ? (questionSessions.length / totalSessions) * 100 : 0;
      
      // Rating analysis
      const ratings = questionFeedback
        .map(f => f.rating)
        .filter(r => r !== null && r >= 1 && r <= 5);
      
      const avgRating = ratings.length > 0 ? 
        ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
      
      // Calculate variance (how consistent the ratings are)
      const variance = ratings.length > 1 ? 
        ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length : 0;
      
      // Sentiment analysis
      const sentiments = questionFeedback
        .map(f => f.sentiment)
        .filter(s => s !== null);
      
      const sentimentBreakdown = {
        '😍': sentiments.filter(s => s === '😍').length,
        '😊': sentiments.filter(s => s === '😊').length,
        '😐': sentiments.filter(s => s === '😐').length,
        '😞': sentiments.filter(s => s === '😞').length,
        '😠': sentiments.filter(s => s === '😠').length,
      };

      const positiveRate = sentiments.length > 0 ? 
        ((sentimentBreakdown['😍'] + sentimentBreakdown['😊']) / sentiments.length) * 100 : 0;

      // Trend analysis (last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const recentFeedback = questionFeedback.filter(f => 
        new Date(f.created_at) >= sevenDaysAgo);
      const previousFeedback = questionFeedback.filter(f => 
        new Date(f.created_at) >= fourteenDaysAgo && new Date(f.created_at) < sevenDaysAgo);

      const recentAvg = recentFeedback.length > 0 ? 
        recentFeedback
          .filter(f => f.rating !== null)
          .reduce((sum, f) => sum + f.rating, 0) / recentFeedback.filter(f => f.rating !== null).length : 0;
      
      const previousAvg = previousFeedback.length > 0 ? 
        previousFeedback
          .filter(f => f.rating !== null)
          .reduce((sum, f) => sum + f.rating, 0) / previousFeedback.filter(f => f.rating !== null).length : 0;

      const ratingTrend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

      return {
        ...question,
        responseCount,
        responseRate: parseFloat(responseRate.toFixed(1)),
        avgRating: parseFloat(avgRating.toFixed(2)),
        variance: parseFloat(variance.toFixed(2)),
        positiveRate: parseFloat(positiveRate.toFixed(1)),
        sentimentBreakdown,
        ratingTrend: parseFloat(ratingTrend.toFixed(1)),
        recentResponses: recentFeedback.length,
        previousResponses: previousFeedback.length
      };
    });

    // Sort by selected criteria
    const sortedStats = questionAnalysis.sort((a, b) => {
      switch (sortBy) {
        case 'avg_rating':
          return b.avgRating - a.avgRating;
        case 'variance':
          return a.variance - b.variance; // Lower variance is better
        default:
          return b.responseRate - a.responseRate;
      }
    });

    setQuestionStats(sortedStats);
    setLoading(false);
  };

  const getEffectivenessScore = (question) => {
    // Weighted score based on response rate, average rating, and consistency
    const responseWeight = 0.4;
    const ratingWeight = 0.4;
    const consistencyWeight = 0.2;

    const responseScore = Math.min(question.responseRate / 80, 1); // Normalize to 80% as excellent
    const ratingScore = question.avgRating / 5;
    const consistencyScore = question.variance > 0 ? Math.max(1 - (question.variance / 2), 0) : 1;

    return (responseScore * responseWeight + ratingScore * ratingWeight + consistencyScore * consistencyWeight) * 100;
  };

  const getEffectivenessColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEffectivenessIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <BarChart className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const getTrendIcon = (trend) => {
    if (trend > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
            </div>
            Question Effectiveness
          </h3>
          <p className="text-sm text-gray-600">
            How well each question performs in gathering feedback
          </p>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="response_rate">Response Rate</option>
            <option value="avg_rating">Average Rating</option>
            <option value="variance">Consistency</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : questionStats.length === 0 ? (
        <div className="text-center py-8">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h4>
          <p className="text-sm text-gray-600">
            Create some feedback questions to see their effectiveness analysis
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-900">
                {questionStats.filter(q => q.active).length}
              </div>
              <div className="text-sm text-blue-700 font-medium">Active Questions</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <div className="text-2xl font-bold text-green-900">
                {questionStats.length > 0 ? 
                  (questionStats.reduce((sum, q) => sum + q.responseRate, 0) / questionStats.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-green-700 font-medium">Avg Response Rate</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
              <div className="text-2xl font-bold text-purple-900">
                {questionStats.length > 0 ? 
                  (questionStats.reduce((sum, q) => sum + q.avgRating, 0) / questionStats.length).toFixed(1) : 0}
              </div>
              <div className="text-sm text-purple-700 font-medium">Avg Rating</div>
            </div>
          </div>

          {/* Question Analysis */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {questionStats.map((question) => {
              const effectivenessScore = getEffectivenessScore(question);
              
              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {question.question}
                        </h4>
                        {!question.active && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{question.responseCount} responses</span>
                        <span>•</span>
                        <span>{question.responseRate}% response rate</span>
                        {question.avgRating > 0 && (
                          <>
                            <span>•</span>
                            <span>{question.avgRating}★ average</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      {/* Trend Indicator */}
                      <div className="flex items-center text-sm">
                        {getTrendIcon(question.ratingTrend)}
                        <span className={`ml-1 ${
                          question.ratingTrend > 5 ? 'text-green-600' : 
                          question.ratingTrend < -5 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {question.ratingTrend > 0 ? '+' : ''}{question.ratingTrend}%
                        </span>
                      </div>
                      
                      {/* Effectiveness Score */}
                      <div className="text-right">
                        <div className="flex items-center">
                          {getEffectivenessIcon(effectivenessScore)}
                          <span className={`ml-1 text-sm font-semibold ${getEffectivenessColor(effectivenessScore)}`}>
                            {effectivenessScore.toFixed(0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">effectiveness</div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {question.responseRate}%
                      </div>
                      <div className="text-xs text-gray-500">Response</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {question.avgRating || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Avg Rating</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {question.variance.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Variance</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {question.positiveRate}%
                      </div>
                      <div className="text-xs text-gray-500">Positive</div>
                    </div>
                  </div>

                  {/* Sentiment Breakdown */}
                  {Object.values(question.sentimentBreakdown).some(count => count > 0) && (
                    <div className="mt-3 flex items-center space-x-1">
                      {Object.entries(question.sentimentBreakdown).map(([emoji, count]) => (
                        count > 0 && (
                          <div key={emoji} className="flex items-center bg-gray-50 rounded px-2 py-1">
                            <span className="text-sm mr-1">{emoji}</span>
                            <span className="text-xs font-medium text-gray-700">{count}</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Insights</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {questionStats.length > 0 && (
                <>
                  <div>
                    • Best performing: <span className="font-medium">{questionStats[0]?.question}</span> 
                    ({questionStats[0]?.responseRate}% response rate)
                  </div>
                  {questionStats.some(q => q.variance > 1.5) && (
                    <div>
                      • High variance detected in some questions - consider rewording for clarity
                    </div>
                  )}
                  {questionStats.some(q => q.responseRate < 30) && (
                    <div>
                      • Some questions have low response rates - consider placement or wording
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEffectivenessTile;