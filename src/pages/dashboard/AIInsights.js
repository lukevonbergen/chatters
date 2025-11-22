import React, { useState, useEffect } from 'react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';
import usePageTitle from '../../hooks/usePageTitle';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import dayjs from 'dayjs';
import DatePicker from '../../components/dashboard/inputs/DatePicker';
import { Button } from '../../components/ui/button';

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

  // Load most recent insight for this venue on mount
  useEffect(() => {
    if (!venueId) return;

    const loadLatestInsight = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('venue_id', venueId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          // Update the date range to match the loaded insight
          setDateFrom(data.date_from);
          setDateTo(data.date_to);
          setInsight({ ...data, cached: true });
          setLastGenerated(new Date(data.created_at));
        }
      } catch (err) {
        // No existing insight found - this is fine
      }
    };

    loadLatestInsight();
  }, [venueId]);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const result = await response.json();
      setInsight(result);
      setLastGenerated(new Date());

    } catch (err) {
      console.error('[AI Insights] Error generating insights:', err);
      setError(err.message || 'Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
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

    const getSegmentColor = (segmentIndex) => {
      if (segmentIndex <= score) {
        if (segmentIndex <= 2) return 'bg-red-500';
        if (segmentIndex <= 4) return 'bg-orange-500';
        if (segmentIndex <= 6) return 'bg-yellow-500';
        if (segmentIndex <= 8) return 'bg-blue-500';
        return 'bg-green-500';
      }
      return 'bg-gray-200';
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
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">AI Insights</h1>
        <p className="text-sm text-gray-500 mt-1">AI-powered analysis of your customer feedback and reviews</p>
      </div>

      {/* Controls Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Generate Insights</h3>
              <p className="text-sm text-gray-500 mt-1">Select a date range to analyse feedback</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <DatePicker
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo}
                />
                <span className="text-gray-400 text-sm font-medium">to</span>
                <DatePicker
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  max={dayjs().format('YYYY-MM-DD')}
                />
              </div>
              <Button
                variant="primary"
                onClick={generateInsights}
                loading={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 m-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!insight && !loading && !error && (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Generated Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              Select a date range and click "Generate Insights" to analyse your customer feedback and discover actionable insights powered by AI.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysing Feedback...</h3>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              Our AI is reviewing your customer feedback. This usually takes a few seconds.
            </p>
          </div>
        )}
      </div>

      {/* Insight Results */}
      {insight && !loading && (
        <>
          {/* Score Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6">
              <AIScoreBar score={insight.ai_score} />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Based on {insight.feedback_count} feedback submissions and {insight.nps_count} NPS responses
                </p>
                <div className="flex items-center gap-3">
                  {insight.nps_score !== null && (
                    <span className="text-sm font-medium text-gray-600">
                      NPS: <span className={insight.nps_score >= 50 ? 'text-green-600' : insight.nps_score >= 0 ? 'text-yellow-600' : 'text-red-600'}>
                        {insight.nps_score}
                      </span>
                    </span>
                  )}
                  {insight.cached && (
                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      Cached
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Tips */}
          {insight.improvement_tips && insight.improvement_tips.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">How to Improve Your Score</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insight.improvement_tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Critical Insights Row */}
          {insight.critical_insights && insight.critical_insights.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-base font-semibold text-gray-900">Critical Insights</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insight.critical_insights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                      <span className="text-orange-600 flex-shrink-0 mt-0.5 text-lg">!</span>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                        <p className="text-gray-700 text-sm mt-1">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Areas to Improve - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            {insight.strengths && insight.strengths.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-base font-semibold text-gray-900">Strengths</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {insight.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {insight.areas_for_improvement && insight.areas_for_improvement.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-base font-semibold text-gray-900">Areas to Improve</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {insight.areas_for_improvement.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Action */}
          {insight.actionable_recommendation && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">Recommended Action</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">{insight.actionable_recommendation}</p>
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          {lastGenerated && (
            <div className="text-center text-xs text-gray-500">
              Generated {dayjs(lastGenerated).format('MMM D, YYYY [at] h:mm A')}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIInsights;
