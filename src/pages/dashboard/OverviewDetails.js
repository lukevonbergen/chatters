import React, { useState, useEffect } from 'react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';

const OverviewDetails = () => {
  usePageTitle('Portfolio Overview');
  const { allVenues } = useVenue();
  const [venueStats, setVenueStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Allow access regardless of number of venues selected
  // (This page can show portfolio overview for single or multiple venues)

  // Fetch NPS scores for each venue (last 30 days)
  useEffect(() => {
    const fetchVenueStats = async () => {
      // Use allVenues instead of selectedVenueIds to show ALL venues user has access to
      if (allVenues.length === 0) return;

      setLoading(true);
      const stats = {};

      try {
        // Get 30 days ago for NPS calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch NPS for each venue
        for (const venue of allVenues) {
          const venueId = venue.id;

          // Fetch NPS submissions for this venue in last 30 days
          const { data: npsSubmissions } = await supabase
            .from('nps_submissions')
            .select('score')
            .eq('venue_id', venueId)
            .gte('created_at', thirtyDaysAgo.toISOString());

          // Calculate NPS
          const npsScores = (npsSubmissions || [])
            .map(s => s.score)
            .filter(score => score !== null && score !== undefined);

          let nps = null;
          let responseCount = npsScores.length;

          if (npsScores.length > 0) {
            const promoters = npsScores.filter(s => s >= 9).length;
            const detractors = npsScores.filter(s => s <= 6).length;
            nps = Math.round(((promoters - detractors) / npsScores.length) * 100);
          }

          stats[venueId] = {
            name: venue.name,
            nps,
            responseCount
          };
        }

        setVenueStats(stats);
      } catch (error) {
        console.error('Error fetching venue stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueStats();
  }, [allVenues]);

  // Helper function to get NPS badge styling
  const getNPSBadge = (nps) => {
    if (nps === null || nps === undefined) {
      return { color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'No Data', textColor: 'text-gray-900' };
    }
    if (nps >= 50) {
      return { color: 'bg-green-50 text-green-700 border-green-200', label: nps, textColor: 'text-green-900' };
    }
    if (nps >= 0) {
      return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: nps, textColor: 'text-yellow-900' };
    }
    return { color: 'bg-red-50 text-red-700 border-red-200', label: nps, textColor: 'text-red-900' };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Helper to get color based on NPS score
  const getNPSColor = (nps) => {
    if (nps === null || nps === undefined) return '#9CA3AF'; // gray-400
    if (nps >= 50) return '#10B981'; // green-500
    if (nps >= 0) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  return (
    <div className="space-y-6">
      <ChartCard
        title="Portfolio Overview"
        subtitle={`NPS scores for all ${allVenues.length} venues (Last 30 days)`}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {allVenues
            .map(venue => ({
              ...venue,
              stats: venueStats[venue.id]
            }))
            .filter(venue => venue.stats) // Only show venues with stats
            .sort((a, b) => {
              // Sort by NPS score: highest first, nulls last
              const aNps = a.stats.nps;
              const bNps = b.stats.nps;

              if (aNps === null && bNps === null) return 0;
              if (aNps === null) return 1;
              if (bNps === null) return -1;

              return bNps - aNps; // Descending order
            })
            .map((venue) => {
            const stats = venueStats[venue.id];
            if (!stats) return null;

            const nps = stats.nps !== null ? stats.nps : 0;
            const color = getNPSColor(stats.nps);

            // Calculate percentage for donut (NPS ranges from -100 to 100, normalize to 0-100)
            const normalizedNPS = stats.nps !== null ? ((stats.nps + 100) / 200) * 100 : 0;
            const circumference = 2 * Math.PI * 40;
            const strokeDashoffset = circumference - (normalizedNPS / 100) * circumference;

            return (
              <div
                key={venue.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all"
              >
                {/* Donut Chart */}
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="transform -rotate-90 w-24 h-24" viewBox="0 0 96 96">
                    {/* Background circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={color}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color }}>
                        {stats.nps !== null ? stats.nps : '--'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue name */}
                <h3 className="text-sm font-semibold text-gray-900 text-center mb-1 truncate" title={stats.name}>
                  {stats.name}
                </h3>

                {/* Response count */}
                <p className="text-xs text-gray-500 text-center">
                  {stats.responseCount} responses
                </p>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
};

export default OverviewDetails;
