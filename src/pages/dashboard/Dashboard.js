// DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import SessionsActionedTile from '../../components/dashboard/reports/today_TotalSessionsTile';
import UnresolvedAlertsTile from '../../components/dashboard/reports/UnresolvedAlertsTile';
import AvgSatisfactionTile from '../../components/dashboard/reports/AvgSatisfactionTile';
import SatisfactionTrendTile from '../../components/dashboard/reports/SatisfactionTrendTile';
import PeakHoursAnalysisTile from '../../components/dashboard/reports/PeakHoursAnalysisTile';
import TablePerformanceRankingTile from '../../components/dashboard/reports/TablePerformanceRankingTile';
import ActionCompletionRateTile from '../../components/dashboard/reports/ActionCompletionRateTile';
import AverageResolutionTimeTile from '../../components/dashboard/reports/AverageResolutionTimeTile';
import RecentSessionsTile from '../../components/dashboard/reports/RecentSessionsTile';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Monitor, AlertTriangle, Clock, TrendingUp, Users, Star, BarChart3, Zap } from 'lucide-react';

const DashboardPage = () => {
  usePageTitle('Overview');
  const { venueId } = useVenue();
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState('online');
  const navigate = useNavigate();

  useEffect(() => {
    if (!venueId) return;
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
        () => {
          loadAssistanceRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [venueId]);

  const loadAssistanceRequests = async () => {
    if (!venueId) return;

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
    navigate('/kiosk');
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Daily Overview</h1>
            <p className="text-gray-600 text-sm lg:text-base">Your daily dashboard for venue performance and operations.</p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={goToKioskMode}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Monitor className="w-4 h-4" />
              Launch Kiosk Mode
            </button>
            <button
              onClick={goToReports}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Detailed Reports
            </button>
            <button
              onClick={goToFloorplan}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              Floor Plan
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Status Banner */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">System Status: Online</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              Ready for service
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SessionsActionedTile venueId={venueId} />
        <UnresolvedAlertsTile venueId={venueId} />
        <AvgSatisfactionTile venueId={venueId} />
        <ActionCompletionRateTile venueId={venueId} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Performance Charts */}
        <div className="lg:col-span-2 space-y-6">
          <SatisfactionTrendTile venueId={venueId} />
          <PeakHoursAnalysisTile venueId={venueId} />
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          <TablePerformanceRankingTile venueId={venueId} />
          <AverageResolutionTimeTile venueId={venueId} />
        </div>
      </div>

      {/* Bottom Section - Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSessionsTile venueId={venueId} />
        
        {/* Recent Assistance Requests */}
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
            <div className="space-y-3">
              {assistanceRequests.slice(0, 5).map((request) => (
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
              
              {assistanceRequests.length > 5 && (
                <button
                  onClick={goToKioskMode}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                >
                  View all requests in Kiosk Mode →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Call-to-Action */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Ready to start service?</h3>
            <p className="text-blue-100 text-sm">Launch Kiosk Mode to begin monitoring real-time feedback and assistance requests.</p>
          </div>
          <button
            onClick={goToKioskMode}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Monitor className="w-5 h-5" />
            Launch Kiosk Mode
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;