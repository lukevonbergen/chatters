import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';

// TripAdvisor icon component - clean owl logo
const TripAdvisorIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="20" fill="#00AA6C"/>
    <circle cx="17" cy="24" r="6" fill="white"/>
    <circle cx="31" cy="24" r="6" fill="white"/>
    <circle cx="17" cy="24" r="3" fill="black"/>
    <circle cx="31" cy="24" r="3" fill="black"/>
    <path d="M11 18C11 18 8 15 4 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M37 18C37 18 40 15 44 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
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