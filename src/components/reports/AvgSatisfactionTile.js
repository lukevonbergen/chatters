import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { MetricCard } from '../ui/metric-card';

const AvgSatisfactionTile = ({ venueId }) => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('rating')
          .eq('venue_id', venueId);

        if (error) {
          console.error('Error fetching satisfaction data:', error);
          return;
        }

        const ratings = (data || []).map(d => d.rating).filter(r => r >= 1 && r <= 5);
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setValue(parseFloat(avg.toFixed(1)));
        } else {
          setValue(0);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);

  const getVariant = (rating) => {
    if (rating >= 4) return "success";
    if (rating >= 3) return "warning";
    if (rating >= 1) return "danger";
    return "neutral";
  };

  return (
    <MetricCard
      title="Customer Satisfaction"
      value={value > 0 ? value : "N/A"}
      metric={value > 0 ? "/5" : ""}
      description="Average rating from all feedback"
      icon={Star}
      variant={getVariant(value)}
      loading={loading}
      trend={
        value > 0 ? {
          text: value >= 4 ? "Excellent ratings" : value >= 3 ? "Good ratings" : "Needs improvement",
          direction: value >= 3.5 ? "up" : "down",
          positive: value >= 3.5
        } : null
      }
    />
  );
};

export default AvgSatisfactionTile;