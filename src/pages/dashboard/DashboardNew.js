import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import OverviewStats from '../../components/dashboard/overview/OverviewStats';
import RecentActivity from '../../components/dashboard/overview/RecentActivity';
import RatingsTrendBar from '../../components/dashboard/reports/RatingsTrendBar';
import RatingsTrendChart from '../../components/dashboard/reports/RatingsTrendChart';
import { ChartCard, ActivityCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import useMultiVenueStats from '../../hooks/useMultiVenueStats';
import { useVenue } from '../../context/VenueContext';
import { Activity, TrendingUp, Calendar, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardNew = () => {
  usePageTitle('Overview');
  const { venueId, venueName, allVenues, userRole } = useVenue();
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  // Multi-venue state
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [isMultiSite, setIsMultiSite] = useState(false);
  
  // Use multi-venue stats hook
  const { stats: multiVenueStats, loading: statsLoading, venueBreakdowns } = useMultiVenueStats(selectedVenues, isMultiSite);

  // Handle venue selection change
  const handleSelectionChange = (venues, isMulti) => {
    setSelectedVenues(venues);
    setIsMultiSite(isMulti);
  };

  // Initialize with current venue if no selection
  useEffect(() => {
    if (venueId && selectedVenues.length === 0) {
      setSelectedVenues([venueId]);
    }
  }, [venueId, selectedVenues.length]);

  useEffect(() => {
    loadUserName();
    if (!venueId) return;
    
    // Load recent activity - update for multi-venue when needed
    loadRecentActivity();
    
    // Real-time subscription for assistance requests
    const subscription = supabase
      .channel(`dashboard-activity-${venueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assistance_requests',
          filter: `venue_id=eq.${venueId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const request = payload.new;
            toast((t) => (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    New Assistance Request
                  </div>
                  <div className="text-xs text-gray-600">
                    Table {request.table_number} needs help
                  </div>
                </div>
              </div>
            ), {
              duration: 5000,
              style: {
                background: '#FFF7ED',
                border: '1px solid #FB923C',
                color: '#EA580C'
              }
            });
          }
          loadRecentActivity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback',
          filter: `venue_id=eq.${venueId}`
        },
        () => {
          loadRecentActivity();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [venueId]);

  const loadUserName = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError) {
        if (auth.user?.email) {
          const emailName = auth.user.email.split('@')[0];
          const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setUserName(capitalizedName);
        }
      } else {
        if (userData.first_name) {
          setUserName(userData.first_name);
        } else if (auth.user?.email) {
          const emailName = auth.user.email.split('@')[0];
          const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setUserName(capitalizedName);
        }
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const loadRecentActivity = async () => {
    if (!venueId) return;

    try {
      setActivityLoading(true);

      // Get recent feedback and assistance requests
      const { data: feedback } = await supabase
        .from('feedback')
        .select('id, table_number, rating, additional_feedback, created_at')
        .eq('venue_id', venueId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: assistance } = await supabase
        .from('assistance_requests')
        .select('id, table_number, created_at, acknowledged_at, resolved_at')
        .eq('venue_id', venueId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort activities
      const allActivities = [
        ...(feedback || []),
        ...(assistance || [])
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setRecentActivity(allActivities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMultiVenueGreeting = () => {
    if (allVenues.length <= 1) return '';
    
    if (userRole === 'master') {
      return `You're managing ${allVenues.length} venues`;
    }
    return `You have access to ${allVenues.length} venues`;
  };

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-gray-600 mt-1">
              {isMultiSite ? (
                selectedVenues.length === allVenues?.length ? 
                  `Overview across all ${selectedVenues.length} venues` :
                  `Overview across ${selectedVenues.length} selected venues`
              ) : (
                <>Welcome back to <span className="font-semibold text-gray-800">{venueName}</span></>
              )}
            </p>
          </div>
        </div>
        
        {getMultiVenueGreeting() && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mt-4">
            <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              {getMultiVenueGreeting()}
            </p>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      <OverviewStats 
        multiVenueStats={isMultiSite ? multiVenueStats : null}
        venueBreakdowns={venueBreakdowns}
        allVenues={allVenues}
        isMultiSite={isMultiSite}
        selectedVenues={selectedVenues}
        onSelectionChange={handleSelectionChange}
      />

      {/* Charts and Activity - Full Width */}
      <div className="space-y-8">
        {/* Ratings Impact Chart from Impact Tab */}
        <ChartCard
          title="Ratings Impact Analysis"
          subtitle={isMultiSite ? 
            "Track ratings progress across selected venues over time" : 
            "Track your Google and TripAdvisor ratings progress over time"
          }
        >
          <RatingsTrendChart 
            venueId={venueId} 
            timeframe="last30"
            selectedVenues={isMultiSite ? selectedVenues : [venueId]}
            isMultiSite={isMultiSite}
          />
        </ChartCard>
        
        {/* Recent Activity - Full Width */}
        <ChartCard 
          title="Recent Activity" 
          subtitle={isMultiSite ?
            "Customer interactions across selected venues from the last 24 hours" :
            "Customer interactions from the last 24 hours"
          }
        >
          <RecentActivity 
            activities={recentActivity} 
            loading={activityLoading}
            selectedVenues={isMultiSite ? selectedVenues : [venueId]}
            isMultiSite={isMultiSite}
            allVenues={allVenues}
          />
        </ChartCard>
      </div>

    </div>
  );
};

export default DashboardNew;