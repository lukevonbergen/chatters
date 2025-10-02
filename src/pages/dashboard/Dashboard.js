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
import MultiSiteSelector from '../../components/dashboard/overview/MultiSiteSelector';
import usePageTitle from '../../hooks/usePageTitle';
import useMultiVenueStats from '../../hooks/useMultiVenueStats';
import { useVenue } from '../../context/VenueContext';
import { Monitor, AlertTriangle, Clock, TrendingUp, Users, Star, BarChart3, Zap, HandHeart } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  usePageTitle('Overview');
  const { venueId, venueName, allVenues } = useVenue();
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState('online');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  
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
    
    // Load assistance requests for current venue only (multi-venue assistance requests handled differently)
    if (!isMultiSite) {
      loadAssistanceRequests();
    }
    
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Welcome{userName ? `, ${userName}` : ''} 👋
              </h1>
              
              {/* Multi-Site Selector */}
              <MultiSiteSelector
                onSelectionChange={handleSelectionChange}
                selectedVenues={selectedVenues}
                componentId="dashboard-overview"
              />
            </div>
            
            <p className="text-gray-600 text-sm lg:text-base">
              {isMultiSite ? (
                selectedVenues.length === allVenues?.length ? 
                  `Here's what's happening across all ${selectedVenues.length} venues today...` :
                  `Here's what's happening across ${selectedVenues.length} selected venues today...`
              ) : (
                <>Here's what's happening at <span className="font-semibold text-gray-800">{venueName ? `${venueName}` : 'your venue'}</span> today...</>
              )}
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
          <SessionsActionedTile 
            venueId={venueId} 
            multiVenueStats={isMultiSite ? multiVenueStats : null}
            venueBreakdowns={venueBreakdowns}
            allVenues={allVenues}
            isMultiSite={isMultiSite}
          />
          <UnresolvedAlertsTile 
            venueId={venueId}
            multiVenueStats={isMultiSite ? multiVenueStats : null}
            venueBreakdowns={venueBreakdowns}
            allVenues={allVenues}
            isMultiSite={isMultiSite}
          />
          <AvgSatisfactionTile 
            venueId={venueId}
            multiVenueStats={isMultiSite ? multiVenueStats : null}
            venueBreakdowns={venueBreakdowns}
            allVenues={allVenues}
            isMultiSite={isMultiSite}
          />
          <ActionCompletionRateTile 
            venueId={venueId}
            multiVenueStats={isMultiSite ? multiVenueStats : null}
            venueBreakdowns={venueBreakdowns}
            allVenues={allVenues}
            isMultiSite={isMultiSite}
          />
          <GoogleRatingKPITile 
            venueId={venueId}
            selectedVenues={isMultiSite ? selectedVenues : [venueId]}
            isMultiSite={isMultiSite}
          />
          <TripAdvisorRatingKPITile 
            venueId={venueId}
            selectedVenues={isMultiSite ? selectedVenues : [venueId]}
            isMultiSite={isMultiSite}
          />
        </div>
      </div>


      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        
        {/* Full width recent activity section */}
        <div className="space-y-6">
          <RecentSessionsTile 
            venueId={venueId}
            selectedVenues={isMultiSite ? selectedVenues : [venueId]}
            isMultiSite={isMultiSite}
          />
          
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