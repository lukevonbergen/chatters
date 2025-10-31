import React, { useState, useEffect } from 'react';
import { useVenue } from '../../../context/VenueContext';
import { supabase } from '../../../utils/supabase';
import UnifiedReviewsCard from './UnifiedReviewsCard';
import GoogleBusinessConnect from './GoogleBusinessConnect';

const IntegrationsTab = () => {
  const { venueId } = useVenue();
  const [venueData, setVenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load venue data on mount
  useEffect(() => {
    if (venueId) {
      loadVenueData();
    }
  }, [venueId]);

  const loadVenueData = async () => {
    try {
      const { data: venue, error } = await supabase
        .from('venues')
        .select('id, name, place_id, tripadvisor_location_id, google_review_link, tripadvisor_link')
        .eq('id', venueId)
        .single();

      if (!error && venue) {
        setVenueData(venue);
      }
    } catch (error) {
      console.error('Error loading venue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading integrations...</div>
        </div>
      </div>
    );
  }

  const googleConnected = venueData?.place_id ? true : false;
  const tripadvisorConnected = venueData?.tripadvisor_location_id ? true : false;

  return (
    <div className="w-full">
      {/* Two Column Integration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Google Business Profile - New OAuth Integration */}
        <GoogleBusinessConnect />

        {/* TripAdvisor Integration Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                <img 
                  src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/tripadvisor-icon.png"
                  alt="TripAdvisor"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">TripAdvisor</h3>
                <p className="text-sm text-gray-500">Listing integration</p>
              </div>
            </div>
            {tripadvisorConnected ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-500">Not Connected</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {tripadvisorConnected ? (
              <>
                <p className="mb-2">✅ TripAdvisor listing is connected</p>
                <p>Your TripAdvisor reviews are being tracked automatically.</p>
              </>
            ) : (
              <>
                <p className="mb-3">Connect your TripAdvisor listing to:</p>
                <ul className="space-y-1 text-xs mb-4">
                  <li>• Track TripAdvisor reviews automatically</li>
                  <li>• Generate review request links</li>
                  <li>• Monitor rating changes over time</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search for your business on TripAdvisor
                  </label>
                  <input
                    type="text"
                    placeholder="Search for your business on TripAdvisor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Start typing to search for your TripAdvisor listing</p>
                </div>
              </>
            )}
          </div>
        </div>
        
      </div>

      {/* Connection Status Bar */}
      {googleConnected && tripadvisorConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-800">Both integrations are connected</h4>
              <p className="text-sm text-green-700">
                Your integrations are locked and cannot be changed for reporting purposes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show detailed management only if neither platform is connected */}
      {!googleConnected && !tripadvisorConnected && (
        <div className="space-y-6">
          <div className="text-center py-8 text-gray-500 text-sm">
            Use the search boxes above to connect your Google Business and TripAdvisor listings.
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsTab;