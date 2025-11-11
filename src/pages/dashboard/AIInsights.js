import React, { useState, useEffect } from 'react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { Sparkles, RefreshCw, Calendar, AlertCircle, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import dayjs from 'dayjs';

const AIInsights = () => {
  usePageTitle('AI Insights');
  const { venueId, allVenues } = useVenue();

  // State
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [dateTo, setDateTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [lastGenerated, setLastGenerated] = useState(null);

  // Get current venue name
  const currentVenue = allVenues.find(v => v.id === venueId);
  const venueName = currentVenue?.name || 'your venue';

  // Generate AI Insights
  const generateInsights = async () => {
    if (!venueId) return;

    setLoading(true);
    setError(null);

    try {
      const startDate = dayjs(dateFrom).startOf('day').toISOString();
      const endDate = dayjs(dateTo).endOf('day').toISOString();

      // Fetch feedback with questions
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          id,
          rating,
          additional_feedback,
          created_at,
          questions (
            question
          )
        `)
        .eq('venue_id', venueId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Fetch NPS submissions
      const { data: npsData, error: npsError } = await supabase
        .from('nps_submissions')
        .select('score, created_at')
        .eq('venue_id', venueId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (npsError) throw npsError;

      // Check if we have data
      const totalFeedback = (feedbackData || []).length;
      const totalNPS = (npsData || []).length;

      if (totalFeedback === 0 && totalNPS === 0) {
        setError('No feedback data available for the selected time period. Please try a different date range.');
        setLoading(false);
        return;
      }

      // Call our secure API endpoint
      console.log('[AI Insights] Sending request to API...', {
        feedbackCount: feedbackData?.length || 0,
        npsCount: npsData?.length || 0,
        venueName
      });

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackData: feedbackData || [],
          npsData: npsData || [],
          venueName,
          venueId,
          dateFrom,
          dateTo,
        }),
      });

      console.log('[AI Insights] API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[AI Insights] API error response:', errorData);
        console.error('[AI Insights] Error details:', JSON.stringify(errorData.details, null, 2));
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const result = await response.json();
      console.log('[AI Insights] Successfully received insight', result);
      setInsight(result);
      setLastGenerated(new Date());

    } catch (err) {
      console.error('[AI Insights] Error generating insights:', err);
      setError(err.message || 'Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date range for display
  const getDateRangeText = () => {
    const from = dayjs(dateFrom);
    const to = dayjs(dateTo);
    const days = to.diff(from, 'day') + 1;
    return `${days} day${days !== 1 ? 's' : ''} (${from.format('MMM D')} - ${to.format('MMM D, YYYY')})`;
  };

  // Get AI Score color and icon
  const getScoreColor = (score) => {
    if (score >= 9) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: TrendingUp };
    if (score >= 7) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle };
    if (score >= 5) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle };
    if (score >= 3) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle };
    return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: TrendingDown };
  };

  // Render AI Score Circle
  const AIScoreCircle = ({ score }) => {
    const { color, bg, border, icon: Icon } = getScoreColor(score);
    const percentage = (score / 10) * 100;
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${bg} ${border} border-2 rounded-full p-6`}>
        <svg className="transform -rotate-90 w-40 h-40">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#E5E7EB"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${color} mb-1`}>{score}</div>
          <div className="text-sm text-gray-600 font-medium">out of 10</div>
          <Icon className={`w-6 h-6 ${color} mt-2`} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ChartCard
        title="AI Insights"
        subtitle="Get AI-powered insights based on your customer feedback and reviews"
      >
        {/* Date Range Selector */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-3">Select Time Period</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom}
                    max={dayjs().format('YYYY-MM-DD')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Analysing: <span className="font-semibold">{getDateRangeText()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mb-6">
          <button
            onClick={generateInsights}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Insights
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Insight Display */}
        {insight && !loading && (
          <div className="space-y-6">
            {/* AI Score Section with Improvement Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Score */}
              <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200">
                <AIScoreCircle score={insight.ai_score} />
                <div className="mt-4 text-center px-4">
                  <h3 className="text-xl font-bold text-gray-900">Overall Performance Score</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {insight.feedback_count} feedback submissions and {insight.nps_count} NPS responses
                  </p>
                  {insight.cached && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      Cached result
                    </span>
                  )}
                </div>
              </div>

              {/* How to Improve */}
              {insight.improvement_tips && insight.improvement_tips.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">How to Improve Your Score</h3>
                  </div>
                  <ul className="space-y-3">
                    {insight.improvement_tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                          {idx + 1}
                        </div>
                        <span className="text-gray-800 leading-relaxed text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Three Column Grid for Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Critical Insights */}
              {insight.critical_insights && insight.critical_insights.length > 0 && (
                <div className="bg-white border-2 border-orange-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-base font-bold text-gray-900">Critical Insights</h3>
                  </div>
                  <div className="space-y-3">
                    {insight.critical_insights.map((item, idx) => (
                      <div key={idx}>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                        <p className="text-gray-700 text-sm leading-snug">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {insight.strengths && insight.strengths.length > 0 && (
                <div className="bg-white border-2 border-green-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-base font-bold text-gray-900">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 flex-shrink-0 mt-0.5">•</span>
                        <span className="text-gray-700 text-sm leading-snug">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {insight.areas_for_improvement && insight.areas_for_improvement.length > 0 && (
                <div className="bg-white border-2 border-yellow-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-base font-bold text-gray-900">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.areas_for_improvement.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm leading-snug">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actionable Recommendation */}
            {insight.actionable_recommendation && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Recommended Action</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-800 leading-relaxed font-medium">{insight.actionable_recommendation}</p>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            {lastGenerated && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Generated {dayjs(lastGenerated).format('MMM D, YYYY [at] h:mm A')}
                  </span>
                  {insight.nps_score !== null && (
                    <span className="font-medium">
                      NPS Score: <span className={insight.nps_score >= 50 ? 'text-green-600' : insight.nps_score >= 0 ? 'text-yellow-600' : 'text-red-600'}>
                        {insight.nps_score}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!insight && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Generated Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Click "Generate AI Insights" to analyse your customer feedback and discover actionable insights powered by AI.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            How it works
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc">
            <li>AI analyses all feedback submissions and NPS responses for the selected date range</li>
            <li>Identifies patterns, trends, and common themes in customer feedback</li>
            <li>Generates an overall performance score (0-10) based on multiple factors</li>
            <li>Provides specific, actionable insights to improve customer experience</li>
            <li>Results are cached - re-running the same date range returns instant results</li>
            <li>Each new analysis costs approximately £0.002-£0.003 (charged to your Anthropic API usage)</li>
          </ul>
        </div>
      </ChartCard>
    </div>
  );
};

export default AIInsights;
