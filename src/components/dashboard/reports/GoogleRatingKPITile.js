import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';

// Google icon component - full color logo
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
  </svg>
);

export default function GoogleRatingKPITile({ venueId, selectedVenues = [], isMultiSite = false, venueBreakdowns = {}, allVenues = [] }) {
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

      // Get current Google rating from external_ratings
      const { data: currentData } = await supabase
        .from('external_ratings')
        .select('rating, ratings_count')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .single();

      // Get initial Google rating from historical_ratings
      const { data: initialData } = await supabase
        .from('historical_ratings')
        .select('rating, ratings_count')
        .eq('venue_id', venueId)
        .eq('source', 'google')
        .eq('is_initial', true)
        .order('recorded_at', { ascending: true })
        .limit(1)
        .single();

      // Get yesterday's Google rating from historical_ratings
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
        .eq('source', 'google')
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
      .map(venueId => venueBreakdowns[venueId]?.googleRating)
      .filter(rating => rating !== null && rating !== undefined);
    
    const avgRating = venueRatings.length > 0 
      ? venueRatings.reduce((sum, rating) => sum + rating, 0) / venueRatings.length
      : 0;

    const venueBreakdownsForDisplay = selectedVenues.map(venueId => {
      const venue = allVenues.find(v => v.id === venueId);
      const rating = venueBreakdowns[venueId]?.googleRating;
      return {
        id: venueId,
        name: venue?.name || 'Unknown Venue',
        value: rating ? rating.toFixed(1) : 'N/A'
      };
    }).filter(breakdown => breakdown.value !== 'N/A');

    return (
      <MetricCard
        title="Google Rating"
        value={avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
        metric={avgRating > 0 ? "/5" : ""}
        description="Average across selected venues"
        icon={GoogleIcon}
        variant={getVariant(avgRating)}
        loading={loading}
        venueBreakdowns={venueBreakdownsForDisplay.length > 0 ? venueBreakdownsForDisplay : null}
        allVenues={allVenues}
        field="googleRating"
      />
    );
  }

  // Single venue mode
  return (
    <MetricCard
      title="Google Rating"
      value={currentScore > 0 ? currentScore.toFixed(1) : "N/A"}
      metric={currentScore > 0 ? "/5" : ""}
      description={initialRating ? `Started at ${parseFloat(initialRating.rating).toFixed(1)}` : "External rating"}
      icon={GoogleIcon}
      variant={getVariant(currentScore)}
      loading={loading}
      trend={getTrendInfo()}
    />
  );
}