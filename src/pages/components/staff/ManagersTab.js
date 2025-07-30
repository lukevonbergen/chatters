import React, { useState } from 'react';
import { supabase } from '../../../utils/supabase';

const ManagersTab = ({ 
  managers, 
  allVenues, 
  fetchStaffData,
  loading,
  setMessage 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [addFormLoading, setAddFormLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Add manager form state
  const [newManager, setNewManager] = useState({
    firstName: '',
    lastName: '',
    email: '',
    venueIds: []
  });

  // Edit manager state
  const [editManagerVenues, setEditManagerVenues] = useState([]);

  // Group managers by venue for display
  const managersByVenue = {};
  allVenues.forEach(venue => {
    managersByVenue[venue.id] = {
      venue: venue,
      managers: managers.filter(manager => 
        manager.venue_id === venue.id
      )
    };
  });

  // Generate a random temporary password
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Add new manager
  const handleAddManager = async (e) => {
    e.preventDefault();
    
    if (!newManager.firstName || !newManager.lastName || !newManager.email || newManager.venueIds.length === 0) {
      setMessage('Please fill in all fields and select at least one venue');
      return;
    }

    setAddFormLoading(true);
    
    try {
      // Generate temporary password
      const tempPassword = generateTempPassword();
      
      // Get current user's account_id
      const { data: authUser } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', authUser.user.id)
        .single();

      // 1. Create user in auth.users
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: newManager.email,
        password: tempPassword,
        email_confirm: true
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw new Error('Failed to create user account: ' + authError.message);
      }

      // 2. Create user in public.users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: newAuthUser.user.id,
          email: newManager.email,
          role: 'manager',
          account_id: userData.account_id
        });

      if (userError) {
        console.error('Public user creation error:', userError);
        throw new Error('Failed to create user profile: ' + userError.message);
      }

      // 3. Create staff records for each venue
      const staffRecords = newManager.venueIds.map(venueId => ({
        user_id: newAuthUser.user.id,
        venue_id: venueId,
        first_name: newManager.firstName,
        last_name: newManager.lastName,
        email: newManager.email,
        role: 'manager'
      }));

      const { error: staffError } = await supabase
        .from('staff')
        .insert(staffRecords);

      if (staffError) {
        console.error('Staff creation error:', staffError);
        throw new Error('Failed to assign venues: ' + staffError.message);
      }

      // Success!
      setMessage(`Manager added successfully! Temporary password: ${tempPassword} (Share this securely with the new manager)`);
      setNewManager({ firstName: '', lastName: '', email: '', venueIds: [] });
      setShowAddForm(false);
      await fetchStaffData();

    } catch (error) {
      console.error('Error adding manager:', error);
      setMessage('Failed to add manager: ' + error.message);
    } finally {
      setAddFormLoading(false);
    }
  };

  // Handle venue selection for new manager
  const handleVenueToggle = (venueId) => {
    setNewManager(prev => ({
      ...prev,
      venueIds: prev.venueIds.includes(venueId)
        ? prev.venueIds.filter(id => id !== venueId)
        : [...prev.venueIds, venueId]
    }));
  };

  // Start editing manager venues
  const handleVenueAssignment = (manager) => {
    setEditingManager(manager);
    // Get current venue assignments for this manager
    const currentVenues = managers
      .filter(m => m.user_id === manager.user_id)
      .map(m => m.venue_id);
    setEditManagerVenues(currentVenues);
  };

  // Handle venue toggle for editing
  const handleEditVenueToggle = (venueId) => {
    setEditManagerVenues(prev => 
      prev.includes(venueId)
        ? prev.filter(id => id !== venueId)
        : [...prev, venueId]
    );
  };

  // Save venue assignments
  const handleSaveVenueAssignments = async () => {
    setEditFormLoading(true);
    
    try {
      // Delete existing staff records for this manager
      const { error: deleteError } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', editingManager.user_id);

      if (deleteError) {
        throw new Error('Failed to update venue assignments: ' + deleteError.message);
      }

      // Create new staff records for selected venues
      if (editManagerVenues.length > 0) {
        const newStaffRecords = editManagerVenues.map(venueId => ({
          user_id: editingManager.user_id,
          venue_id: venueId,
          first_name: editingManager.first_name,
          last_name: editingManager.last_name,
          email: editingManager.email,
          role: 'manager'
        }));

        const { error: insertError } = await supabase
          .from('staff')
          .insert(newStaffRecords);

        if (insertError) {
          throw new Error('Failed to assign venues: ' + insertError.message);
        }
      }

      setMessage('Venue assignments updated successfully!');
      setEditingManager(null);
      await fetchStaffData();

    } catch (error) {
      console.error('Error updating venue assignments:', error);
      setMessage('Failed to update venue assignments: ' + error.message);
    } finally {
      setEditFormLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Managers</h2>
            <p className="text-gray-600 text-sm">Manage your venue managers and their venue assignments.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Add Manager
          </button>
        </div>
      </div>

      {/* Managers grouped by venue */}
      <div className="space-y-6">
        {Object.values(managersByVenue).map(({ venue, managers: venueManagers }) => (
          <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{venue.name}</h3>
              <span className="text-sm text-gray-500">
                {venueManagers.length} manager{venueManagers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {venueManagers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No managers assigned to this venue</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-black hover:underline text-sm"
                >
                  Assign a manager
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {venueManagers.map(manager => (
                  <div 
                    key={manager.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {manager.first_name?.[0]}{manager.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {manager.first_name} {manager.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{manager.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Manager
                      </span>
                      <button
                        onClick={() => handleVenueAssignment(manager)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Edit Venues
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Manager Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Total Managers:</span>
            <span className="ml-2 font-medium">{managers.length}</span>
          </div>
          <div>
            <span className="text-blue-700">Total Venues:</span>
            <span className="ml-2 font-medium">{allVenues.length}</span>
          </div>
        </div>
      </div>

      {/* Add Manager Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add New Manager</h3>
            
            <form onSubmit={handleAddManager} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newManager.firstName}
                    onChange={(e) => setNewManager(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newManager.lastName}
                    onChange={(e) => setNewManager(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newManager.email}
                  onChange={(e) => setNewManager(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Assign to Venues</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allVenues.map(venue => (
                    <label key={venue.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newManager.venueIds.includes(venue.id)}
                        onChange={() => handleVenueToggle(venue.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{venue.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewManager({ firstName: '', lastName: '', email: '', venueIds: [] });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addFormLoading}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {addFormLoading ? 'Creating...' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Venues Modal */}
      {editingManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              Edit Venues for {editingManager.first_name} {editingManager.last_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Venue Access</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allVenues.map(venue => (
                    <label key={venue.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editManagerVenues.includes(venue.id)}
                        onChange={() => handleEditVenueToggle(venue.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{venue.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setEditingManager(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVenueAssignments}
                  disabled={editFormLoading}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {editFormLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagersTab;