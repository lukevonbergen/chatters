import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import OverviewStats from '../../components/dashboard/overview/OverviewStats';
import RecentActivity from '../../components/dashboard/overview/RecentActivity';
import RatingsTrendBar from '../../components/dashboard/reports/RatingsTrendBar';
import { ChartCard, ActivityCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Sparkles, Activity, TrendingUp, Calendar, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardNew = () => {
  usePageTitle('Overview');
  const { venueId, venueName, allVenues, userRole } = useVenue();
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserName();
    if (!venueId) return;
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
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back to <span className="font-semibold text-gray-800">{venueName}</span>
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
      <OverviewStats />

      {/* Performance & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Rating Trends Chart */}
        <div className="xl:col-span-3">
          <ChartCard
            title="Review Platform Ratings"
            subtitle="Daily ratings from Google and TripAdvisor"
          >
            <div className="h-64">
              <RatingsTrendBar venueId={venueId} />
            </div>
          </ChartCard>
        </div>
        
        {/* Recent Activity */}
        <div>
          <ChartCard title="Recent Activity" subtitle="Last 24 hours">
            <RecentActivity activities={recentActivity} loading={activityLoading} />
          </ChartCard>
        </div>
      </div>

      {/* Smart Insights */}
      <ChartCard
        title="Smart Insights"
        subtitle="AI-powered recommendations based on your venue's performance"
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 rounded-xl p-6 border border-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Response Time</h4>
            </div>
            <p className="text-sm text-gray-600">
              Track assistance response times to identify improvement opportunities and enhance customer satisfaction.
            </p>
          </div>
          
          <div className="bg-white/80 rounded-xl p-6 border border-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Peak Hours</h4>
            </div>
            <p className="text-sm text-gray-600">
              Monitor busy periods to optimize staff scheduling and ensure adequate coverage during high-demand times.
            </p>
          </div>

          <div className="bg-white/80 rounded-xl p-6 border border-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Satisfaction Trends</h4>
            </div>
            <p className="text-sm text-gray-600">
              Analyze customer feedback patterns to identify areas for service improvement and staff training.
            </p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default DashboardNew;