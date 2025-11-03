// DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import SessionsActionedTile from '../../components/dashboard/reports/today_TotalSessionsTile';
import UnresolvedAlertsTile from '../../components/dashboard/reports/UnresolvedAlertsTile';
import AvgSatisfactionTile from '../../components/dashboard/reports/AvgSatisfactionTile';
import ActionCompletionRateTile from '../../components/dashboard/reports/ActionCompletionRateTile';
import GoogleRatingKPITile from '../../components/dashboard/reports/GoogleRatingKPITile';
import TripAdvisorRatingKPITile from '../../components/dashboard/reports/TripAdvisorRatingKPITile';
import RecentSessionsTile from '../../components/dashboard/reports/RecentSessionsTile';
import QuickInsightsTile from '../../components/dashboard/reports/QuickInsightsTile';
import PeakHoursTile from '../../components/dashboard/reports/PeakHoursTile';
import ConfigurableMultiVenueTile from '../../components/dashboard/reports/ConfigurableMultiVenueTile';
import MetricSelectorModal from '../../components/dashboard/modals/MetricSelectorModal';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Monitor, AlertTriangle, Clock, TrendingUp, Users, Star, BarChart3, Zap, HandHeart, Lightbulb, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  usePageTitle('Overview');
  const { venueId, venueName } = useVenue();
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState('online');
  const [userName, setUserName] = useState('');
  const [userTiles, setUserTiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTilePosition, setEditingTilePosition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserName();
    loadUserTiles();
    if (!venueId) return;

    // Load assistance requests for current venue
    loadAssistanceRequests();
    
    // Real-time subscription for assistance requests
    const subscription = supabase
      .channel(`assistance-requests-${venueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assistance_requests',
          filter: `venue_id=eq.${venueId}`
        },
        (payload) => {
          // Show toast notification for new assistance requests
          if (payload.eventType === 'INSERT') {
            const request = payload.new;
            toast((t) => (
              <div className="flex items-center gap-3">
                <HandHeart className="w-5 h-5 text-orange-500" />
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
          loadAssistanceRequests();
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

      if (!userId) {
        console.error('User not authenticated');
        return;
      }

      // Fetch user profile data from users table (same as SettingsPage)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        // Fallback to first part of email if no first name in database
        if (auth.user?.email) {
          const emailName = auth.user.email.split('@')[0];
          const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setUserName(capitalizedName);
        }
      } else {
        // Use first_name from database, fallback to email if empty
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

  const loadAssistanceRequests = async () => {
    if (!venueId) return;

    // Temporary fix: Remove staff joins to get basic functionality working
    const { data } = await supabase
      .from('assistance_requests')
      .select('*')
      .eq('venue_id', venueId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(10);

    setAssistanceRequests(data || []);
  };

  const loadUserTiles = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from('user_dashboard_tiles')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading user tiles:', error);
        return;
      }

      setUserTiles(data || []);
    } catch (error) {
      console.error('Error in loadUserTiles:', error);
    }
  };

  const handleAddTile = () => {
    setEditingTilePosition(null);
    setIsModalOpen(true);
  };

  const handleChangeTileMetric = (position) => {
    setEditingTilePosition(position);
    setIsModalOpen(true);
  };

  const handleMetricSelect = async (metricType) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      if (editingTilePosition !== null) {
        // Update existing tile
        const { error } = await supabase
          .from('user_dashboard_tiles')
          .update({ metric_type: metricType })
          .eq('user_id', userId)
          .eq('position', editingTilePosition);

        if (error) {
          console.error('Error updating tile:', error);
          toast.error('Failed to update tile');
          return;
        }

        toast.success('Tile updated successfully');
      } else {
        // Add new tile - find next available position
        const nextPosition = userTiles.length; // 0, 1, or 2

        const { error } = await supabase
          .from('user_dashboard_tiles')
          .insert({
            user_id: userId,
            metric_type: metricType,
            position: nextPosition
          });

        if (error) {
          console.error('Error adding tile:', error);
          toast.error('Failed to add tile');
          return;
        }

        toast.success('Tile added successfully');
      }

      loadUserTiles();
    } catch (error) {
      console.error('Error in handleMetricSelect:', error);
      toast.error('An error occurred');
    }
  };

  const handleRemoveTile = async (position) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { error } = await supabase
        .from('user_dashboard_tiles')
        .delete()
        .eq('user_id', userId)
        .eq('position', position);

      if (error) {
        console.error('Error removing tile:', error);
        toast.error('Failed to remove tile');
        return;
      }

      toast.success('Tile removed successfully');

      // Reorder remaining tiles to fill gap
      const remainingTiles = userTiles.filter(t => t.position !== position);
      for (let i = 0; i < remainingTiles.length; i++) {
        if (remainingTiles[i].position !== i) {
          await supabase
            .from('user_dashboard_tiles')
            .update({ position: i })
            .eq('user_id', userId)
            .eq('id', remainingTiles[i].id);
        }
      }

      loadUserTiles();
    } catch (error) {
      console.error('Error in handleRemoveTile:', error);
      toast.error('An error occurred');
    }
  };

  const goToKioskMode = () => {
    const kioskWindow = window.open('/kiosk', '_blank', 'fullscreen=yes,scrollbars=yes,resizable=yes');
    // Fallback to maximize if fullscreen doesn't work
    if (kioskWindow) {
      kioskWindow.moveTo(0, 0);
      kioskWindow.resizeTo(window.screen.width, window.screen.height);
    }
  };

  const goToReports = () => {
    navigate('/reports');
  };

  const goToFloorplan = () => {
    navigate('/floorplan');
  };

  // Just return null if no venueId yet - no loading screen
  if (!venueId) {
    return null;
  }

  return (
    <PageContainer>
      {/* Header with Quick Actions */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Welcome{userName ? `, ${userName}` : ''} 👋
            </h1>

            <p className="text-gray-600 text-sm lg:text-base">
              Here's what's happening at <span className="font-semibold text-gray-800">{venueName ? `${venueName}` : 'your venue'}</span> today...
            </p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={goToFloorplan}
              className="hidden lg:flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              Floor Plan
            </button>
            <button
              onClick={goToReports}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Detailed Reports
            </button>
            <button
              onClick={goToKioskMode}
              className="hidden lg:flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Monitor className="w-4 h-4" />
              Launch Kiosk Mode
            </button>
          </div>
        </div>
      </div>

      {/* Today's Key Metrics & Review Platform Ratings */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Today's Key Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <SessionsActionedTile venueId={venueId} />
          <UnresolvedAlertsTile venueId={venueId} />
          <AvgSatisfactionTile venueId={venueId} />
          <ActionCompletionRateTile venueId={venueId} />
          <GoogleRatingKPITile venueId={venueId} />
          <TripAdvisorRatingKPITile venueId={venueId} />
        </div>
      </div>

      {/* Configurable Multi-Venue Tiles */}
      {(userTiles.length > 0 || userTiles.length < 3) && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Multi-Venue Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTiles.map((tile) => (
              <ConfigurableMultiVenueTile
                key={tile.id}
                metricType={tile.metric_type}
                position={tile.position}
                onRemove={() => handleRemoveTile(tile.position)}
                onChangeMetric={() => handleChangeTileMetric(tile.position)}
              />
            ))}

            {userTiles.length < 3 && (
              <button
                onClick={handleAddTile}
                className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
              >
                <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-full transition-colors">
                  <Plus className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                    Add Metric Tile
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Track metrics across all venues
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Metric Selector Modal */}
      <MetricSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleMetricSelect}
        currentMetric={
          editingTilePosition !== null
            ? userTiles.find(t => t.position === editingTilePosition)?.metric_type
            : null
        }
        existingMetrics={userTiles.map(t => t.metric_type)}
      />

      {/* Quick Insights & Peak Hours */}
      {venueId && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Insights & Analytics</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QuickInsightsTile venueId={venueId} />
            <PeakHoursTile venueId={venueId} />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        
        {/* Full width recent activity section */}
        <div className="space-y-6">
          <RecentSessionsTile venueId={venueId} />
          
          {/* Recent Assistance Requests - Full Width */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-800">Recent Assistance Requests</h3>
            </div>
            
            {assistanceRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No assistance requests in the last 24 hours</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {assistanceRequests.slice(0, 8).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        request.resolved_at ? 'bg-green-500' : 
                        request.acknowledged_at ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Table {request.table_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleTimeString()}
                        </p>
                        {request.resolved_by && (
                          <p className="text-xs text-gray-400">
                            Resolved by staff
                          </p>
                        )}
                        {!request.resolved_by && request.acknowledged_by && (
                          <p className="text-xs text-gray-400">
                            In progress
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.resolved_at ? 'bg-green-100 text-green-800' :
                        request.acknowledged_at ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.resolved_at ? 'Resolved' : 
                         request.acknowledged_at ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {assistanceRequests.length > 8 && (
              <div className="mt-4 text-center">
                <button
                  onClick={goToKioskMode}
                  className="text-sm text-blue-600 hover:text-blue-800 py-2"
                >
                  View all requests in Kiosk Mode →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;