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

  // Load previously saved insight for current date range on mount
  useEffect(() => {
    if (!venueId) return;

    const loadExistingInsight = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('venue_id', venueId)
          .eq('date_from', dateFrom)
          .eq('date_to', dateTo)
          .single();

        if (!error && data) {
          setInsight({ ...data, cached: true });
          setLastGenerated(new Date(data.created_at));
        }
      } catch (err) {
        // No existing insight found - this is fine
        console.log('[AI Insights] No existing insight found for this date range');
      }
    };

    loadExistingInsight();
  }, [venueId, dateFrom, dateTo]);

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

  // Render AI Score Segmented Bar
  const AIScoreBar = ({ score }) => {
    const { color, icon: Icon } = getScoreColor(score);

    // Define color for each segment (1-10)
    const getSegmentColor = (segmentIndex) => {
      if (segmentIndex <= score) {
        // Filled segments - gradient from red to green
        if (segmentIndex <= 2) return 'bg-red-500';
        if (segmentIndex <= 4) return 'bg-orange-500';
        if (segmentIndex <= 6) return 'bg-yellow-500';
        if (segmentIndex <= 8) return 'bg-blue-500';
        return 'bg-green-500';
      }
      return 'bg-gray-200'; // Unfilled segments
    };

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Performance Score</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${color}`}>{score}</span>
            <span className="text-sm text-gray-500">/ 10</span>
            {Icon && <Icon className={`w-5 h-5 ${color}`} />}
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((segment) => (
            <div
              key={segment}
              className={`flex-1 h-4 rounded-sm ${getSegmentColor(segment)} transition-all duration-500`}
              style={{ transitionDelay: `${segment * 50}ms` }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ChartCard
        title="AI Insights"
        subtitle="AI-powered insights based on your customer feedback and reviews"
        actions={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom}
                max={dayjs().format('YYYY-MM-DD')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateInsights}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Insights
                </>
              )}
            </button>
          </div>
        }
      >

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
            {/* AI Score Bar - Full Width */}
            <div>
              <AIScoreBar score={insight.ai_score} />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Based on {insight.feedback_count} feedback submissions and {insight.nps_count} NPS responses
                </p>
                {insight.cached && (
                  <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                    Cached result
                  </span>
                )}
              </div>
            </div>

            {/* How to Improve Tips */}
            {insight.improvement_tips && insight.improvement_tips.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">How to Improve Your Score</h3>
                </div>
                <ul className="space-y-3">
                  {insight.improvement_tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Three Column Grid for Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Critical Insights */}
              {insight.critical_insights && insight.critical_insights.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Critical Insights</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.critical_insights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 flex-shrink-0 mt-0.5">•</span>
                        <div>
                          <span className="font-medium text-gray-900 text-sm">{item.title}: </span>
                          <span className="text-gray-700 text-sm">{item.content}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths */}
              {insight.strengths && insight.strengths.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 flex-shrink-0 mt-0.5">•</span>
                        <span className="text-gray-700 text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {insight.areas_for_improvement && insight.areas_for_improvement.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.areas_for_improvement.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 flex-shrink-0 mt-0.5">•</span>
                        <span className="text-gray-700 text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommended Action - Full Width */}
            {insight.actionable_recommendation && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recommended Action</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{insight.actionable_recommendation}</p>
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Generated Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Select a date range and click "Generate Insights" to analyse your customer feedback and discover actionable insights powered by AI.
            </p>
          </div>
        )}
      </ChartCard>

      {/* Info Box */}
      {!loading && (
        <ChartCard title="How it works">
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>AI analyses all feedback submissions and NPS responses for the selected date range</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Identifies patterns, trends, and common themes in customer feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Generates an overall performance score (0-10) based on multiple factors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Provides specific, actionable insights to improve customer experience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Results are cached - re-running the same date range returns instant results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Each new analysis costs approximately £0.002-£0.003 (charged to your Anthropic API usage)</span>
            </li>
          </ul>
        </ChartCard>
      )}
    </div>
  );
};

export default AIInsights;
