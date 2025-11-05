import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { Trash2, AlertTriangle } from 'lucide-react';

const VenueTab = ({ 
  name, setName,
  address, setAddress,
  phone, setPhone,
  website, setWebsite,
  saveSettings,
  loading,
  message,
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
  });
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueMessage, setVenueMessage] = useState('');
  const [accountId, setAccountId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { venueId, venueName }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateWarning, setShowCreateWarning] = useState(false);

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

  const updateStripeQuantity = async () => {
    try {
      const response = await fetch('/api/update-subscription-quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();

      if (data.updated) {
        console.log('Stripe subscription updated:', data);
      } else {
        console.log('Stripe subscription not updated:', data.message);
      }
    } catch (error) {
      console.error('Error updating Stripe subscription:', error);
      // Don't fail the venue operation if Stripe update fails
    }
  };

  const handleCreateVenueSubmit = (e) => {
    e.preventDefault();
    if (!newVenue.name || !accountId || !userId) {
      setVenueMessage('Please fill in the venue name');
      return;
    }

    // Show confirmation warning first
    setShowCreateWarning(true);
  };

  const handleCreateVenue = async () => {
    setShowCreateWarning(false);
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
            primary_color: '#16A34A',
            background_color: '#ffffff',
            text_color: '#111827',
            button_text_color: '#ffffff',
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

      // Update Stripe subscription quantity (adds venue to next billing cycle)
      await updateStripeQuantity();

      setVenueMessage('Venue created successfully! This venue will be added to your next billing cycle. You can now assign managers to it in the Staff page.');
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

  const handleDeleteVenue = async () => {
    if (!deleteConfirm) return;

    setDeleteLoading(true);
    setVenueMessage('');

    try {
      const { venueId, venueName } = deleteConfirm;

      // Check if this is the current venue being viewed
      if (venueId === currentVenueId) {
        setVenueMessage('Cannot delete the venue you are currently viewing. Please switch to another venue first.');
        setDeleteConfirm(null);
        setDeleteLoading(false);
        return;
      }

      // Delete associated staff records first
      const { error: staffError } = await supabase
        .from('staff')
        .delete()
        .eq('venue_id', venueId);

      if (staffError) {
        throw new Error(`Failed to delete staff records: ${staffError.message}`);
      }

      // Delete the venue
      const { error: venueError } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId)
        .eq('account_id', accountId); // Ensure user owns this venue

      if (venueError) {
        throw new Error(`Failed to delete venue: ${venueError.message}`);
      }

      // Update Stripe subscription quantity (removes venue from next billing cycle)
      await updateStripeQuantity();

      setVenueMessage(`Venue "${venueName}" deleted successfully! This venue will be removed from your next billing cycle.`);
      setDeleteConfirm(null);
      await fetchVenues();

    } catch (error) {
      console.error('Error deleting venue:', error);
      setVenueMessage(`Failed to delete venue: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full">

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

            {/* Phone Number */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <p className="text-xs text-gray-500">Contact number for your venue</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="tel"
                  value={phone || ''}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 1234 567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Website */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <p className="text-xs text-gray-500">Your venue's web URL</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="url"
                  value={website || ''}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.yourvenue.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
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


        {/* Master-Only Section: Venue List & Delete */}
        {userRole === 'master' && venues.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Venues</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your existing venues</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      venue.id === currentVenueId
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{venue.name}</h4>
                      {venue.address?.city && (
                        <p className="text-sm text-gray-500 mt-1">{venue.address.city}</p>
                      )}
                      {venue.id === currentVenueId && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Currently Viewing
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({ venueId: venue.id, venueName: venue.name })}
                      disabled={venue.id === currentVenueId}
                      className={`p-2 rounded-lg transition-colors ${
                        venue.id === currentVenueId
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={venue.id === currentVenueId ? 'Cannot delete current venue' : 'Delete venue'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Master-Only Section: Create New Venue */}
        {userRole === 'master' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Create Additional Venue</h3>
              <p className="text-gray-600 text-sm">Expand your business by adding more venues to your account. New venues are added to your next billing cycle.</p>
            </div>

            <form onSubmit={handleCreateVenueSubmit} className="space-y-6">
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

      {/* Create Venue Confirmation Modal */}
      {showCreateWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add New Venue?</h3>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              You're about to create <strong>"{newVenue.name}"</strong>.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Billing Information:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                <li>• This venue will be added to your subscription</li>
                <li>• You'll be charged on your next billing date</li>
                <li>• Cost: £149/month or £1,430/year per venue</li>
                <li>• Prorated amount will apply for partial months</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateVenue}
                disabled={venueLoading}
                className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {venueLoading ? 'Creating...' : 'Yes, Create Venue'}
              </button>
              <button
                onClick={() => setShowCreateWarning(false)}
                disabled={venueLoading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Venue?</h3>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              Are you sure you want to delete <strong>"{deleteConfirm.venueName}"</strong>?
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This will:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4">
                <li>• Permanently delete all venue data</li>
                <li>• Remove all staff assignments</li>
                <li>• Delete all feedback and analytics</li>
                <li>• Reduce your next billing cycle amount</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteVenue}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Venue'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueTab;