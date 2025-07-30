import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';

const VenueTab = ({ 
  userRole,
  loading,
  message,
  setMessage 
}) => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [editingVenue, setEditingVenue] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [venueLoading, setVenueLoading] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Form states
  const [newVenue, setNewVenue] = useState({
    name: '',
    email: '',
  });

  const [editVenueData, setEditVenueData] = useState({
    name: '',
    email: '',
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

  // Fetch venues on component mount
  useEffect(() => {
    fetchVenues();
  }, []);

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
      setMessage('Please fill in all required fields');
      return;
    }

    setVenueLoading(true);
    setMessage('');

    try {
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([
          {
            name: newVenue.name,
            email: newVenue.email || null,
            account_id: accountId,
            logo: null,
            address: {},
            primary_color: '#000000',
            secondary_color: '#ffffff',
            tripadvisor_link: '',
            google_review_link: '',
            table_count: 0,
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
          email: newVenue.email || '',
        },
      ]);

      if (staffError) {
        console.error('Staff creation error:', staffError);
      }

      setMessage('Venue created successfully!');
      setNewVenue({ name: '', email: '' });
      setShowAddForm(false);
      await fetchVenues();

    } catch (error) {
      console.error('Error creating venue:', error);
      setMessage('Failed to create venue: ' + error.message);
    } finally {
      setVenueLoading(false);
    }
  };

  const handleEditVenue = (venue) => {
    setEditingVenue(venue);
    setEditVenueData({
      name: venue.name || '',
      email: venue.email || '',
      tableCount: venue.table_count || '',
      address: venue.address || {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postalCode: '',
        country: '',
      },
      tripadvisorLink: venue.tripadvisor_link || '',
      googleReviewLink: venue.google_review_link || '',
    });
  };

  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    if (!editingVenue) return;

    setVenueLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('venues')
        .update({
          name: editVenueData.name,
          email: editVenueData.email || null,
          table_count: editVenueData.tableCount || 0,
          address: editVenueData.address,
          tripadvisor_link: editVenueData.tripadvisorLink,
          google_review_link: editVenueData.googleReviewLink,
        })
        .eq('id', editingVenue.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage('Venue updated successfully!');
      setEditingVenue(null);
      await fetchVenues();

    } catch (error) {
      console.error('Error updating venue:', error);
      setMessage('Failed to update venue: ' + error.message);
    } finally {
      setVenueLoading(false);
    }
  };

  const handleDeleteVenue = async (venue) => {
    if (!window.confirm(`Are you sure you want to delete "${venue.name}"? This action cannot be undone.`)) {
      return;
    }

    setVenueLoading(true);
    setMessage('');

    try {
      // Delete staff records first
      await supabase
        .from('staff')
        .delete()
        .eq('venue_id', venue.id);

      // Delete venue
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venue.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage('Venue deleted successfully!');
      await fetchVenues();

    } catch (error) {
      console.error('Error deleting venue:', error);
      setMessage('Failed to delete venue: ' + error.message);
    } finally {
      setVenueLoading(false);
    }
  };

  // Only show this tab to masters
  if (userRole !== 'master') {
    return null;
  }

  return (
    <div className="max-w-none lg:max-w-6xl">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Venue Management</h2>
            <p className="text-gray-600 text-sm">Manage all your venues and their settings.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-black text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm lg:text-base font-medium"
          >
            Add New Venue
          </button>
        </div>
      </div>

      {/* Venues List */}
      <div className="space-y-4 lg:space-y-6">
        {venues.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">No venues created yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Create Your First Venue
            </button>
          </div>
        ) : (
          venues.map((venue) => (
            <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">{venue.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Email:</span> {venue.email || 'Not set'}
                    </div>
                    <div>
                      <span className="font-medium">Tables:</span> {venue.table_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(venue.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {venue.address && (venue.address.line1 || venue.address.city) && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Address:</span> 
                      {venue.address.line1 && ` ${venue.address.line1}`}
                      {venue.address.city && `, ${venue.address.city}`}
                      {venue.address.postalCode && ` ${venue.address.postalCode}`}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                  <button
                    onClick={() => handleEditVenue(venue)}
                    className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVenue(venue)}
                    className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 lg:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Venues Summary</h3>
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
            <span className="font-medium text-blue-900 sm:mt-1">
              {venues[0]?.name || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Add Venue Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-medium mb-4 lg:mb-6">Add New Venue</h3>
              
              <form onSubmit={handleCreateVenue} className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={newVenue.email}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewVenue({ name: '', email: '' });
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={venueLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {venueLoading ? 'Creating...' : 'Create Venue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Venue Modal */}
      {editingVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-medium mb-4 lg:mb-6">Edit Venue: {editingVenue.name}</h3>
              
              <form onSubmit={handleUpdateVenue} className="space-y-4 lg:space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                    <input
                      type="text"
                      value={editVenueData.name}
                      onChange={(e) => setEditVenueData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editVenueData.email}
                      onChange={(e) => setEditVenueData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                  </div>
                </div>

                {/* Table Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Table Count</label>
                  <input
                    type="number"
                    value={editVenueData.tableCount}
                    onChange={(e) => setEditVenueData(prev => ({ ...prev, tableCount: e.target.value }))}
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
                      value={editVenueData.address.line1}
                      onChange={(e) => setEditVenueData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, line1: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={editVenueData.address.line2}
                      onChange={(e) => setEditVenueData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, line2: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={editVenueData.address.city}
                        onChange={(e) => setEditVenueData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={editVenueData.address.postalCode}
                        onChange={(e) => setEditVenueData(prev => ({ 
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
                        value={editVenueData.tripadvisorLink}
                        onChange={(e) => setEditVenueData(prev => ({ ...prev, tripadvisorLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">Link to your Tripadvisor page</p>
                    </div>
                    <div>
                      <input
                        type="url"
                        placeholder="Google Review Link"
                        value={editVenueData.googleReviewLink}
                        onChange={(e) => setEditVenueData(prev => ({ ...prev, googleReviewLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">Link to your Google Reviews</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingVenue(null)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={venueLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {venueLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          message.includes('success') 
            ? 'text-green-700 bg-green-50 border border-green-200' 
            : 'text-red-700 bg-red-50 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default VenueTab;