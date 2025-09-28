import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import VenueSelector from '../../components/dashboard/overview/VenueSelector';
import OverviewStats from '../../components/dashboard/overview/OverviewStats';
import QuickActions from '../../components/dashboard/overview/QuickActions';
import RecentActivity from '../../components/dashboard/overview/RecentActivity';
import RatingsTrendBar from '../../components/dashboard/reports/RatingsTrendBar';
import usePageTitle from '../../hooks/usePageTitle';
import useOverviewStats from '../../hooks/useOverviewStats';
import { useVenue } from '../../context/VenueContext';
import { Sparkles, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardNew = () => {
  usePageTitle('Overview');
  const { venueId, venueName, allVenues, userRole } = useVenue();
  const { stats, loading: statsLoading } = useOverviewStats(venueId);
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
        .select('id, table_number, satisfaction_rating, feedback_comment, created_at')
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
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {getGreeting()}{userName ? `, ${userName}` : ''}
              </h1>
            </div>
            
            <p className="text-gray-600 mb-1">
              Welcome back to <span className="font-semibold text-gray-800">{venueName}</span>
            </p>
            
            {getMultiVenueGreeting() && (
              <p className="text-sm text-blue-600 font-medium">
                {getMultiVenueGreeting()}
              </p>
            )}
          </div>
          
          <VenueSelector />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Today's Overview</h2>
        </div>
        <OverviewStats stats={stats} loading={statsLoading} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions venueId={venueId} userRole={userRole} />
      </div>

      {/* Performance & Activity */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Performance & Activity</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Trends Chart */}
          <div className="lg:col-span-2">
            <RatingsTrendBar venueId={venueId} />
          </div>
          
          {/* Recent Activity */}
          <div>
            <RecentActivity activities={recentActivity} loading={activityLoading} />
          </div>
        </div>
      </div>

      {/* Insights & Tips */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Insights
            </h3>
            <p className="text-gray-600 mb-4">
              Based on your venue's performance, here are some recommendations to improve customer satisfaction:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">Response Time</h4>
                <p className="text-sm text-gray-600">
                  {stats?.avgResponseTime 
                    ? `Average ${stats.avgResponseTime} - consider optimizing staff workflows`
                    : 'Track assistance response times to identify improvement opportunities'
                  }
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">Peak Hours</h4>
                <p className="text-sm text-gray-600">
                  {stats?.peakHour 
                    ? `Busiest at ${stats.peakHour} - ensure adequate staffing`
                    : 'Monitor busy periods to optimize staff scheduling'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardNew;