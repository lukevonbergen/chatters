import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';

const OverviewDetails = () => {
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
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
          <p className="text-gray-600 text-lg">
            Comprehensive performance metrics for <span className="font-semibold">all {allVenues.length} venues</span>
          </p>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
        <p className="text-gray-600 text-lg">
          NPS scores for <span className="font-semibold">all {allVenues.length} venues</span> (Last 30 days)
        </p>
      </div>

      {/* NPS Scores Tile */}
      <ChartCard className="shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">NPS Scores by Venue</h2>
          </div>

          <div className="space-y-4">
            {allVenues.map((venue) => {
              const stats = venueStats[venue.id];
              if (!stats) return null;

              const npsBadge = getNPSBadge(stats.nps);

              return (
                <div
                  key={venue.id}
                  className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all hover:shadow-md ${npsBadge.color}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{stats.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">NPS Score</div>
                      <div className={`text-4xl font-bold ${npsBadge.textColor}`}>
                        {npsBadge.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Responses</div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.responseCount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default OverviewDetails;
