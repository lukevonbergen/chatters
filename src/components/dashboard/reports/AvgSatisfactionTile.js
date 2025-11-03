import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { MetricCard } from '../../ui/metric-card';

const AvgSatisfactionTile = ({ venueId }) => {
  const [value, setValue] = useState(0);
  const [yesterdayValue, setYesterdayValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        // Calculate yesterday's date range
        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(startOfDay);

        // Fetch TODAY's ratings
        const { data, error } = await supabase
          .from('feedback')
          .select('rating')
          .eq('venue_id', venueId)
          .gte('created_at', startOfDay.toISOString());

        // Fetch YESTERDAY's ratings
        const { data: yesterdayData } = await supabase
          .from('feedback')
          .select('rating')
          .eq('venue_id', venueId)
          .gte('created_at', startOfYesterday.toISOString())
          .lt('created_at', endOfYesterday.toISOString());

        if (error) {
          console.error('Error fetching satisfaction data:', error);
          return;
        }

        // Process today's ratings
        const ratings = (data || []).map(d => d.rating).filter(r => r >= 1 && r <= 5);
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setValue(parseFloat(avg.toFixed(1)));
        } else {
          setValue(0);
        }

        // Process yesterday's ratings
        const yesterdayRatings = (yesterdayData || []).map(d => d.rating).filter(r => r >= 1 && r <= 5);
        if (yesterdayRatings.length > 0) {
          const yesterdayAvg = yesterdayRatings.reduce((a, b) => a + b, 0) / yesterdayRatings.length;
          setYesterdayValue(parseFloat(yesterdayAvg.toFixed(1)));
        } else {
          setYesterdayValue(0);
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

  // Calculate trend vs yesterday
  const calculateTrend = () => {
    if (value === 0 || yesterdayValue === 0) {
      return value > 0 ? {
        text: value >= 4 ? "Excellent" : value >= 3 ? "Good" : "Needs improvement",
        direction: value >= 3.5 ? "up" : "down",
        positive: value >= 3.5
      } : null;
    }

    const difference = value - yesterdayValue;

    if (Math.abs(difference) < 0.1) {
      return {
        direction: "neutral",
        positive: true,
        value: "0.0",
        text: "vs yesterday"
      };
    }

    return {
      direction: difference > 0 ? "up" : "down",
      positive: difference > 0, // Higher satisfaction is positive
      value: `${difference > 0 ? '+' : ''}${difference.toFixed(1)}`,
      text: "vs yesterday"
    };
  };

  return (
    <MetricCard
      title="Customer Satisfaction"
      value={value > 0 ? value : "N/A"}
      metric={value > 0 ? "/5" : ""}
      description="Today's average rating from feedback"
      icon={Star}
      variant={getVariant(value)}
      loading={loading}
      trend={calculateTrend()}
    />
  );
};

export default AvgSatisfactionTile;