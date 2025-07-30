import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';

const VenueTab = ({ 
  name, setName,
  tableCount, setTableCount,
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
    tableCount: '',
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
            table_count: parseInt(newVenue.tableCount) || 0,
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
        tableCount: '',
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
    <div className="max-w-none lg:max-w-2xl">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Venue Settings</h2>
        <p className="text-gray-600 text-sm">Manage your venue information and settings.</p>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {/* Venue Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
          />
        </div>

        {/* Table Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Table Count</label>
          <input
            type="number"
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
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
              placeholder="Address Line 2"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Review Links</label>
          <div className="space-y-3">
            <div>
              <input
                type="url"
                placeholder="Tripadvisor Link"
                value={tripadvisorLink}
                onChange={(e) => setTripadvisorLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Link to your Tripadvisor page</p>
            </div>
            <div>
              <input
                type="url"
                placeholder="Google Review Link"
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Link to your Google Reviews</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`text-sm p-3 rounded-md ${
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
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
          <div className="mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Create New Venue</h3>
            <p className="text-gray-600 text-sm">Add additional venues to your account. After creating, assign managers in the Staff page.</p>
          </div>

          <form onSubmit={handleCreateVenue} className="space-y-4 lg:space-y-6">
            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
              <input
                type="text"
                value={newVenue.name}
                onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                required
              />
            </div>

            {/* Table Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Count</label>
              <input
                type="number"
                value={newVenue.tableCount}
                onChange={(e) => setNewVenue(prev => ({ ...prev, tableCount: e.target.value }))}
                className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
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
                <input
                  type="text"
                  placeholder="Address Line 2"
                  value={newVenue.address.line2}
                  onChange={(e) => setNewVenue(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, line2: e.target.value }
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

            {/* Review Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Links</label>
              <div className="space-y-3">
                <div>
                  <input
                    type="url"
                    placeholder="Tripadvisor Link"
                    value={newVenue.tripadvisorLink}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, tripadvisorLink: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Link to your Tripadvisor page</p>
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Google Review Link"
                    value={newVenue.googleReviewLink}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, googleReviewLink: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Link to your Google Reviews</p>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={venueLoading}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-6 lg:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
              <h4 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Your Venues Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm lg:text-base">
                <div className="flex justify-between sm:flex-col sm:justify-start">
                  <span className="text-blue-700">Total Venues:</span>
                  <span className="font-medium text-blue-900 sm:mt-1">{venues.length}</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:justify-start">
                  <span className="text-blue-700">Total Tables:</span>
                  <span className="font-medium text-blue-900 sm:mt-1">
                    {venues.reduce((sum, venue) => sum + (venue.table_count || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between sm:flex-col sm:justify-start">
                  <span className="text-blue-700">Latest Venue:</span>
                  <span className="font-medium text-blue-900 sm:mt-1 truncate">
                    {venues[0]?.name || 'None'}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  💡 After creating a venue, go to the <strong>Staff</strong> page to assign managers and employees.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueTab;