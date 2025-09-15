import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import FeedbackTimeSelection from './venuetabcomponents/FeedbackTimeSelection';

const VenueTab = ({ 
  name, setName,
  address, setAddress,
  tripadvisorLink, setTripadvisorLink,
  googleReviewLink, setGoogleReviewLink,
  saveSettings,
  saveReviewLinks,
  loading,
  reviewLinksLoading,
  message,
  reviewLinksMessage,
  userRole,
  currentVenueId  // Add this prop
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
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState(2);
  const [sessionTimeoutLoading, setSessionTimeoutLoading] = useState(false);
  const [sessionTimeoutMessage, setSessionTimeoutMessage] = useState('');

  // Fetch venues for masters
  useEffect(() => {
    if (userRole === 'master') {
      fetchVenues();
    }
  }, [userRole]);

  // Fetch session timeout for current venue
  useEffect(() => {
    if (currentVenueId) {
      fetchSessionTimeout();
    }
  }, [currentVenueId]);

  const fetchSessionTimeout = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('session_timeout_hours')
        .eq('id', currentVenueId)
        .single();
      
      if (!error && data) {
        setSessionTimeoutHours(data.session_timeout_hours || 2);
      }
    } catch (error) {
      console.error('Error fetching session timeout:', error);
    }
  };

  const saveSessionTimeout = async () => {
    if (!currentVenueId) return;
    
    setSessionTimeoutLoading(true);
    setSessionTimeoutMessage('');
    
    try {
      const { data, error, count } = await supabase
        .from('venues')
        .update({ session_timeout_hours: sessionTimeoutHours })
        .eq('id', currentVenueId)
        .select();
      
      if (error) throw error;
      
      if (count === 0 || !data || data.length === 0) {
        throw new Error('No rows updated. You may not have permission to update this venue.');
      }
      
      setSessionTimeoutMessage('Session timeout updated successfully!');
    } catch (error) {
      console.error('Error saving session timeout:', error);
      // Show detailed error info to user for support purposes
      const errorDetails = error.code ? `Error ${error.code}: ${error.message}` : error.message;
      setSessionTimeoutMessage(`Failed to save session timeout: ${errorDetails}. Please contact support with this error code.`);
    } finally {
      setSessionTimeoutLoading(false);
    }
  };

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
      // Show detailed error info to user for support purposes
      const errorDetails = error.code ? `Error ${error.code}: ${error.message}` : error.message;
      setVenueMessage(`Failed to create venue: ${errorDetails}. Please contact support with this error code.`);
    } finally {
      setVenueLoading(false);
    }
  };

  return (
    <div className="max-w-none lg:max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Venue Settings</h2>
        <p className="text-gray-600 text-sm">Configure your venue information and feedback collection preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Basic Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Section Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-500 mt-1">Venue name, address, and location details</p>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="p-6 space-y-6">
            {/* Venue Name */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500">The name customers will see</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter your venue name"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-xs text-gray-500">Physical location of your venue</p>
              </div>
              <div className="lg:col-span-2 space-y-3">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={address.line1}
                  onChange={(e) => setAddress({...address, line1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={address.line2}
                  onChange={(e) => setAddress({...address, line2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={address.postalCode}
                    onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Save Action */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Changes to basic information are saved immediately
              </div>
              <button
                onClick={saveSettings}
                disabled={loading}
                className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            {message && (
              <div className={`text-xs p-2 rounded-lg mt-3 ${
                message.includes('success') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Review Links Card */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Section Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Review Platform Links</h3>
                <p className="text-sm text-gray-500 mt-1">Direct satisfied customers to leave positive reviews</p>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="p-6 space-y-6">
            {/* TripAdvisor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TripAdvisor
                </label>
                <p className="text-xs text-gray-500">Your TripAdvisor review page</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="url"
                  placeholder="https://www.tripadvisor.com/your-venue"
                  value={tripadvisorLink}
                  onChange={(e) => setTripadvisorLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Google Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Reviews
                </label>
                <p className="text-xs text-gray-500">Your Google Business review link</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="url"
                  placeholder="https://g.page/your-business/review"
                  value={googleReviewLink}
                  onChange={(e) => setGoogleReviewLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Card Save Action */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Update review links to guide satisfied customers
              </div>
              <button
                onClick={saveReviewLinks}
                disabled={reviewLinksLoading}
                className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewLinksLoading ? 'Saving...' : 'Save Review Links'}
              </button>
            </div>
            {reviewLinksMessage && (
              <div className={`text-xs p-2 rounded-lg mt-3 ${
                reviewLinksMessage.includes('success') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {reviewLinksMessage}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Session Timeout Settings */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Section Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Session Timeout</h3>
                <p className="text-sm text-gray-500 mt-1">Configure how long feedback sessions remain visible in the kiosk view</p>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout Duration (Hours)
                </label>
                <p className="text-xs text-gray-500">
                  Feedback older than this will be filtered from kiosk view
                </p>
              </div>
              <div className="lg:col-span-2">
                <select
                  value={sessionTimeoutHours}
                  onChange={(e) => setSessionTimeoutHours(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours (default)</option>
                  <option value={4}>4 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={8}>8 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Current setting: Feedback older than {sessionTimeoutHours} hour{sessionTimeoutHours !== 1 ? 's' : ''} will be hidden from staff kiosk
                </p>
              </div>
            </div>
          </div>

          {/* Card Save Action */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Changes apply immediately to all staff devices
              </div>
              <button
                onClick={saveSessionTimeout}
                disabled={sessionTimeoutLoading}
                className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sessionTimeoutLoading ? 'Saving...' : 'Save Timeout Setting'}
              </button>
            </div>
            {sessionTimeoutMessage && (
              <div className={`text-xs p-2 rounded-lg mt-3 ${
                sessionTimeoutMessage.includes('success') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {sessionTimeoutMessage}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Feedback Collection Hours */}
        <FeedbackTimeSelection currentVenueId={currentVenueId} />

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={newVenue.address.postalCode}
                      onChange={(e) => setNewVenue(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={venueLoading}
                  className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {venueLoading ? 'Creating Venue...' : 'Create New Venue'}
                </button>
              </div>

              {/* Venue Creation Message */}
              {venueMessage && (
                <div className={`text-sm p-3 rounded-lg ${
                  venueMessage.includes('success') 
                    ? 'text-green-700 bg-green-50 border border-green-200' 
                    : 'text-red-700 bg-red-50 border border-red-200'
                }`}>
                  {venueMessage}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueTab;