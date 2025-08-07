import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import FeedbackTimeSelection from './venuetabcomponents/FeedbackTimeSelection';

const VenueTab = ({ 
  name, setName,
  address, setAddress,
  tripadvisorLink, setTripadvisorLink,
  googleReviewLink, setGoogleReviewLink,
  saveSettings,
  loading,
  message,
  userRole 
}) => {
  // Master-only states for venue management
  const [venues, setVenues] = useState([]);
  const [newVenue, setNewVenue] = useState({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postalCode: '',
      country: '',
    },
    tripadvisorLink: '',
    googleReviewLink: '',
  });
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueMessage, setVenueMessage] = useState('');
  const [accountId, setAccountId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch venues for masters
  useEffect(() => {
    if (userRole === 'master') {
      fetchVenues();
    }
  }, [userRole]);

  const fetchVenues = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    setUserId(user.id);

    const { data: userRow } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', user.id)
      .single();

    if (!userRow) return;

    setAccountId(userRow.account_id);

    const { data: venuesData } = await supabase
      .from('venues')
      .select('*')
      .eq('account_id', userRow.account_id)
      .order('created_at', { ascending: false });

    setVenues(venuesData || []);
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!newVenue.name || !accountId || !userId) {
      setVenueMessage('Please fill in the venue name');
      return;
    }

    setVenueLoading(true);
    setVenueMessage('');

    try {
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([
          {
            name: newVenue.name,
            account_id: accountId,
            logo: null,
            address: newVenue.address,
            primary_color: '#000000',
            secondary_color: '#ffffff',
            tripadvisor_link: newVenue.tripadvisorLink,
            google_review_link: newVenue.googleReviewLink,
          },
        ])
        .select()
        .single();

      if (venueError) {
        throw new Error(venueError.message);
      }

      // Create initial staff record for the master
      const { error: staffError } = await supabase.from('staff').insert([
        {
          first_name: 'Master',
          last_name: 'User',
          user_id: userId,
          venue_id: venueData.id,
          role: 'master',
          email: '',
        },
      ]);

      if (staffError) {
        console.error('Staff creation error:', staffError);
      }

      setVenueMessage('Venue created successfully! You can now assign managers to it in the Staff page.');
      setNewVenue({
        name: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postalCode: '',
          country: '',
        },
        tripadvisorLink: '',
        googleReviewLink: '',
      });
      await fetchVenues();

    } catch (error) {
      console.error('Error creating venue:', error);
      setVenueMessage('Failed to create venue: ' + error.message);
    } finally {
      setVenueLoading(false);
    }
  };

  return (
    <div className="max-w-none lg:max-w-4xl">
      {/* Page Header */}
      <div className="mb-8 lg:mb-10">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Venue Management</h2>
        <p className="text-gray-600">Configure your venue settings, feedback collection hours, and manage multiple venues.</p>
      </div>

      <div className="space-y-8 lg:space-y-12">
        
        {/* Section 1: Basic Venue Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
          <div className="mb-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
            <p className="text-gray-600 text-sm">Update your venue's core details and contact information.</p>
          </div>

          <div className="space-y-6">
            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                placeholder="Enter your venue name"
              />
            </div>

            {/* Address Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={address.line1}
                  onChange={(e) => setAddress({...address, line1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={address.line2}
                  onChange={(e) => setAddress({...address, line2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={address.postalCode}
                    onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Review Links Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Platform Links</label>
              <div className="space-y-3">
                <div>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://www.tripadvisor.com/your-venue"
                      value={tripadvisorLink}
                      onChange={(e) => setTripadvisorLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base pl-8"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">🏨</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Direct customers to leave reviews on Tripadvisor</p>
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://g.page/your-business/review"
                      value={googleReviewLink}
                      onChange={(e) => setGoogleReviewLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base pl-8"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">🌟</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Direct customers to leave Google reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Feedback Collection Hours */}
        <FeedbackTimeSelection />

        {/* Save Basic Settings Button */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h4 className="text-sm font-medium text-gray-900">Save Basic Settings</h4>
              <p className="text-xs text-gray-600">Save changes to venue name, address, and review links</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Basic Settings'}
            </button>
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-md mt-4 ${
              message.includes('success') 
                ? 'text-green-700 bg-green-50 border border-green-200' 
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Master-Only Section: Create New Venue */}
        {userRole === 'master' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Create Additional Venue</h3>
              <p className="text-gray-600 text-sm">Expand your business by adding more venues to your account. Assign managers after creation.</p>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-6">
              {/* Venue Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Venue Name *</label>
                <input
                  type="text"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  placeholder="Enter the new venue name"
                  required
                />
              </div>

              {/* Simplified Address for New Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={newVenue.address.line1}
                    onChange={(e) => setNewVenue(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, line1: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={newVenue.address.city}
                      onChange={(e) => setNewVenue(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={newVenue.address.postalCode}
                      onChange={(e) => setNewVenue(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={venueLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {venueLoading ? 'Creating Venue...' : 'Create New Venue'}
                </button>
              </div>

              {/* Venue Creation Message */}
              {venueMessage && (
                <div className={`text-sm p-3 rounded-md ${
                  venueMessage.includes('success') 
                    ? 'text-green-700 bg-green-50 border border-green-200' 
                    : 'text-red-700 bg-red-50 border border-red-200'
                }`}>
                  {venueMessage}
                </div>
              )}
            </form>

            {/* Venues Summary for Masters */}
            {venues.length > 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-base font-medium text-blue-900 mb-3">📊 Your Venues Overview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{venues.length}</div>
                    <div className="text-blue-700">Total Venues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-900 truncate">
                      {venues[0]?.name || 'None'}
                    </div>
                    <div className="text-blue-700">Latest Venue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded">
                      Go to Staff page →
                    </div>
                    <div className="text-xs text-blue-600">Assign managers</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueTab;