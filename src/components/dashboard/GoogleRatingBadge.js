import React, { useState, useEffect } from 'react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';

const GoogleRatingBadge = ({ showAttribution = true, className = '' }) => {
  const { venueId } = useVenue();
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (venueId) {
      loadRating();
    }
  }, [venueId]);

  const loadRating = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/ratings/google?venueId=${venueId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRating(data);
        setError(null);
      } else if (response.status === 404) {
        // No Google Place ID configured or no rating available
        setRating(null);
        setError(null);
      } else {
        setError('Failed to load rating');
      }
    } catch (err) {
      setError('Error loading rating');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !rating) {
    return null; // Don't show anything if there's no rating available
  }

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="inline-flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500">⭐</span>
          <span className="font-medium text-gray-900">
            {rating.rating ? rating.rating.toFixed(1) : 'N/A'}
          </span>
          <span className="text-sm text-gray-500">
            ({rating.ratings_count || 0})
          </span>
        </div>
        {rating.cached && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            cached
          </span>
        )}
      </div>
      
      {/* Attribution */}
      {showAttribution && rating.attributions && rating.attributions.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          <div dangerouslySetInnerHTML={{ __html: rating.attributions[0] }} />
        </div>
      )}
    </div>
  );
};

export default GoogleRatingBadge;