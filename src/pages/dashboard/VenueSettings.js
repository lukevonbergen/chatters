import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import VenueTab from '../../components/dashboard/settings/VenueTab';
import { Building2, ChevronRight, MapPin, Phone, Globe, Edit2, ArrowLeft } from 'lucide-react';

const VenueSettingsPage = () => {
  const location = useLocation();
  const { venueId, allVenues, setCurrentVenue, userRole } = useVenue();

  // Determine if we're in multi-venue list mode (accessed from Multi Venue > Venues)
  // vs single-venue edit mode (accessed from Venue Settings submenu)
  // /settings/venues = Multi Venue list view (only for multi-venue users)
  // /settings/venue-details = Single venue edit form (always)
  const isVenueDetailsRoute = location.pathname === '/settings/venue-details';
  const initialViewMode = isVenueDetailsRoute ? 'edit' : 'list';
  const [viewMode, setViewMode] = useState(initialViewMode);
  const isMultiVenueMode = allVenues.length > 1 && viewMode === 'list' && !isVenueDetailsRoute;

  usePageTitle(isMultiVenueMode ? 'Venues Management' : 'Venue Settings');

  // All state variables for VenueTab
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
  });
  const [message, setMessage] = useState('');

  // Fetch venue data
  useEffect(() => {
    if (!venueId) {
      return;
    }

    const fetchVenueData = async () => {
      // Fetch venue data
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('id, name, address, phone, website')
        .eq('id', venueId)
        .single();

      if (venueError) {
        console.error('Error fetching venue settings:', venueError);
        return;
      }

      // Set venue data
      setName(venueData.name || '');
      setPhone(venueData.phone || '');
      setWebsite(venueData.website || '');
      setAddress(venueData.address || {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postalCode: '',
        country: '',
      });
    };

    fetchVenueData();
  }, [venueId]);

  // Save settings
  const saveSettings = async () => {
    if (!venueId) return;

    setLoading(true);
    setMessage('');

    try {
      // Update venues table
      const venueUpdates = {
        name,
        address,
        phone,
        website,
      };

      const { error: venueError } = await supabase
        .from('venues')
        .update(venueUpdates)
        .eq('id', venueId);

      if (venueError) {
        throw venueError;
      }

      setMessage('Venue settings updated successfully!');
    } catch (error) {
      console.error('Error updating venue settings:', error);
      const errorDetails = error.code ? `Error ${error.code}: ${error.message}` : error.message;
      setMessage(`Failed to update venue settings: ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };


  if (!venueId) {
    return null;
  }

  // Multi-venue list mode: Show all venues with quick switcher
  if (isMultiVenueMode) {
    return (
      <div className="space-y-6">
        <ChartCard
          title="Venues Management"
          subtitle="Manage all your venues in one place"
        >
          <div className="space-y-4">
            {allVenues.map((venue) => {
              const isActive = venue.id === venueId;
              return (
                <div
                  key={venue.id}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Building2 className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                          {isActive && (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                              Currently Selected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Venue Details */}
                      <div className="space-y-2 ml-14">
                        {venue.address && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {venue.address.line1}
                              {venue.address.line2 && `, ${venue.address.line2}`}
                              {venue.address.city && `, ${venue.address.city}`}
                              {venue.address.postalCode && ` ${venue.address.postalCode}`}
                            </span>
                          </div>
                        )}
                        {venue.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{venue.phone}</span>
                          </div>
                        )}
                        {venue.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <a
                              href={venue.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {venue.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (!isActive) {
                            setCurrentVenue(venue.id);
                          }
                          setViewMode('edit');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-300"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Details
                      </button>
                      {!isActive && (
                        <button
                          onClick={() => setCurrentVenue(venue.id)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                          Switch to this venue
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Click "Switch to this venue" to edit that venue's settings.
              You can also switch venues using the dropdown in the sidebar.
            </p>
          </div>
        </ChartCard>
      </div>
    );
  }

  // Single-venue edit mode: Show edit form for current venue
  return (
    <div className="space-y-6">
      {/* Back button for multi-venue users */}
      {allVenues.length > 1 && (
        <button
          onClick={() => setViewMode('list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Venues List
        </button>
      )}

      <ChartCard
        title="Venue Settings"
        subtitle="Configure your venue information and location details"
      >
        <VenueTab
          name={name}
          setName={setName}
          address={address}
          setAddress={setAddress}
          phone={phone}
          setPhone={setPhone}
          website={website}
          setWebsite={setWebsite}
          saveSettings={saveSettings}
          loading={loading}
          message={message}
          userRole={userRole}
          currentVenueId={venueId}
        />
      </ChartCard>
    </div>
  );
};

export default VenueSettingsPage;