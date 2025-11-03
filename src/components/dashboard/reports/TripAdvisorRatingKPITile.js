import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';

// TripAdvisor icon component
const TripAdvisorIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1333.31 1333.31" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd">
    <g fillRule="nonzero">
      <circle cx="666.66" cy="666.66" r="666.66" fill="#34e0a1"/>
      <path d="M1078.42 536.6l80.45-87.52h-178.4c-89.31-61.01-197.17-96.54-313.81-96.54-116.5 0-224.06 35.61-313.22 96.54H174.6l80.44 87.52c-49.31 44.99-80.22 109.8-80.22 181.75 0 135.79 110.09 245.88 245.88 245.88 64.51 0 123.27-24.88 167.14-65.55l78.81 85.81 78.81-85.73c43.87 40.67 102.57 65.47 167.07 65.47 135.79 0 246.03-110.09 246.03-245.88.07-72.03-30.84-136.83-80.15-181.75zM420.77 884.75c-91.92 0-166.4-74.48-166.4-166.4s74.49-166.4 166.4-166.4c91.92 0 166.4 74.49 166.4 166.4 0 91.91-74.49 166.4-166.4 166.4zm245.96-171.24c0-109.5-79.63-203.5-184.73-243.65 56.84-23.76 119.18-36.94 184.66-36.94 65.47 0 127.89 13.18 184.73 36.94-105.02 40.23-184.65 134.15-184.65 243.65zm245.88 171.24c-91.92 0-166.4-74.48-166.4-166.4s74.49-166.4 166.4-166.4c91.92 0 166.4 74.49 166.4 166.4 0 91.91-74.49 166.4-166.4 166.4zm0-253.7c-48.2 0-87.23 39.03-87.23 87.23 0 48.19 39.03 87.22 87.23 87.22 48.19 0 87.22-39.03 87.22-87.22 0-48.12-39.03-87.23-87.22-87.23zM508 718.35c0 48.19-39.03 87.22-87.23 87.22-48.19 0-87.22-39.03-87.22-87.22 0-48.2 39.03-87.23 87.22-87.23 48.19-.07 87.23 39.03 87.23 87.23z"/>
    </g>
  </svg>
);

export default function TripAdvisorRatingKPITile({ venueId, selectedVenues = [], isMultiSite = false, venueBreakdowns = {}, allVenues = [] }) {
  const [currentRating, setCurrentRating] = useState(null);
  const [initialRating, setInitialRating] = useState(null);
  const [yesterdayRating, setYesterdayRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMultiSite || !venueId) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      setLoading(true);

      // Get current TripAdvisor rating from external_ratings
      const { data: currentData } = await supabase
        .from('external_ratings')
        .select('rating, ratings_count')
        .eq('venue_id', venueId)
        .eq('source', 'tripadvisor')
        .single();

      // Get initial TripAdvisor rating from historical_ratings
      const { data: initialData } = await supabase
        .from('historical_ratings')
        .select('rating, ratings_count')
        .eq('venue_id', venueId)
        .eq('source', 'tripadvisor')
        .eq('is_initial', true)
        .order('recorded_at', { ascending: true })
        .limit(1)
        .single();

      // Get yesterday's TripAdvisor rating from historical_ratings
      const now = new Date();
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(now);
      endOfYesterday.setHours(0, 0, 0, 0);

      const { data: yesterdayData } = await supabase
        .from('historical_ratings')
        .select('rating, ratings_count')
        .eq('venue_id', venueId)
        .eq('source', 'tripadvisor')
        .gte('recorded_at', startOfYesterday.toISOString())
        .lt('recorded_at', endOfYesterday.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentRating(currentData);
      setInitialRating(initialData);
      setYesterdayRating(yesterdayData);
      setLoading(false);
    };

    fetchRatings();
  }, [venueId, isMultiSite]);

  const improvement = useMemo(() => {
    if (!currentRating || !initialRating) return null;
    const current = parseFloat(currentRating.rating);
    const initial = parseFloat(initialRating.rating);
    const diff = current - initial;
    return {
      value: diff,
      percentage: initial > 0 ? ((diff / initial) * 100) : 0
    };
  }, [currentRating, initialRating]);

  const currentScore = currentRating ? parseFloat(currentRating.rating) : 0;
  const hasImprovement = improvement && improvement.value !== 0;
  
  const getVariant = (score) => {
    if (score >= 4.0) return "success";
    if (score >= 3.0) return "warning";
    if (score >= 1.0) return "danger";
    return "neutral";
  };

  const getTrendInfo = () => {
    // Use yesterday comparison if available, otherwise fall back to initial
    if (yesterdayRating && currentRating) {
      const current = parseFloat(currentRating.rating);
      const yesterday = parseFloat(yesterdayRating.rating);
      const diff = current - yesterday;

      if (Math.abs(diff) < 0.05) {
        return {
          direction: "neutral",
          positive: true,
          value: "0.0",
          text: "vs yesterday"
        };
      }

      return {
        direction: diff > 0 ? "up" : "down",
        positive: diff > 0,
        value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`,
        text: "vs yesterday"
      };
    }

    // Fall back to initial rating comparison
    if (!hasImprovement) return null;
    return {
      text: improvement.value > 0
        ? `+${improvement.value.toFixed(2)} since start`
        : `${improvement.value.toFixed(2)} since start`,
      direction: improvement.value > 0 ? "up" : "down",
      positive: improvement.value > 0
    };
  };

  // Multi-venue mode: calculate average and show venue breakdowns
  if (isMultiSite && selectedVenues.length > 0) {
    const venueRatings = selectedVenues
      .map(venueId => venueBreakdowns[venueId]?.tripAdvisorRating)
      .filter(rating => rating !== null && rating !== undefined);
    
    const avgRating = venueRatings.length > 0 
      ? venueRatings.reduce((sum, rating) => sum + rating, 0) / venueRatings.length
      : 0;

    const venueBreakdownsForDisplay = selectedVenues.map(venueId => {
      const venue = allVenues.find(v => v.id === venueId);
      const rating = venueBreakdowns[venueId]?.tripAdvisorRating;
      return {
        id: venueId,
        name: venue?.name || 'Unknown Venue',
        value: rating ? rating.toFixed(1) : 'N/A'
      };
    }).filter(breakdown => breakdown.value !== 'N/A');

    return (
      <MetricCard
        title="TripAdvisor Rating"
        value={avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
        metric={avgRating > 0 ? "/5" : ""}
        description="Average across selected venues"
        icon={TripAdvisorIcon}
        variant={getVariant(avgRating)}
        loading={loading}
        venueBreakdowns={venueBreakdownsForDisplay.length > 0 ? venueBreakdownsForDisplay : null}
        allVenues={allVenues}
        field="tripAdvisorRating"
      />
    );
  }

  // Single venue mode
  return (
    <MetricCard
      title="TripAdvisor Rating"
      value={currentScore > 0 ? currentScore.toFixed(1) : "N/A"}
      metric={currentScore > 0 ? "/5" : ""}
      description={initialRating ? `Started at ${parseFloat(initialRating.rating).toFixed(1)}` : "External rating"}
      icon={TripAdvisorIcon}
      variant={getVariant(currentScore)}
      loading={loading}
      trend={getTrendInfo()}
    />
  );
}