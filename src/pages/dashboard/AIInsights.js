import React, { useState, useEffect } from 'react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { Sparkles, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
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
        .select('score, comment, created_at')
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
          dateFrom,
          dateTo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const result = await response.json();
      setInsight(result.insight);
      setLastGenerated(new Date());

    } catch (err) {
      console.error('Error generating insights:', err);
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
                Analyzing: <span className="font-semibold">{getDateRangeText()}</span>
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
          <div className="p-6 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
            </div>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{insight}</p>
            </div>
            {lastGenerated && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-500">
                  Generated {dayjs(lastGenerated).format('MMM D, YYYY [at] h:mm A')}
                </p>
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
              Click "Generate AI Insights" to analyze your customer feedback and discover actionable insights powered by AI.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            How it works
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc">
            <li>AI analyzes all feedback submissions and NPS responses for the selected date range</li>
            <li>Identifies patterns, trends, and common themes in customer feedback</li>
            <li>Provides actionable insights to improve customer experience</li>
            <li>Each analysis costs approximately £0.05-£0.10 (charged to your Anthropic API usage)</li>
          </ul>
        </div>
      </ChartCard>
    </div>
  );
};

export default AIInsights;
