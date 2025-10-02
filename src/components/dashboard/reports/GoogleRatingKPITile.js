import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';

// Google icon component
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function GoogleRatingKPITile({ venueId, selectedVenues = [], isMultiSite = false, venueBreakdowns = {}, allVenues = [] }) {
  const [currentRating, setCurrentRating] = useState(null);
  const [initialRating, setInitialRating] = useState(null);
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

      setCurrentRating(currentData);
      setInitialRating(initialData);
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
    if (!hasImprovement) return null;
    return {
      text: improvement.value > 0 
        ? `+${improvement.value.toFixed(2)} improvement` 
        : `${improvement.value.toFixed(2)} decline`,
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