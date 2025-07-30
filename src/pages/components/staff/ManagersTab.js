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
    <div className="max-w-none lg:max-w-6xl">
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex-1">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Managers</h2>
            <p className="text-gray-600 text-sm lg:text-base">Manage your venue managers and their venue assignments.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-black text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm lg:text-base font-medium"
          >
            Add Manager
          </button>
        </div>
      </div>

      {/* Managers grouped by venue */}
      <div className="space-y-4 lg:space-y-6">
        {Object.values(managersByVenue).map(({ venue, managers: venueManagers }) => (
          <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
              <h3 className="text-base lg:text-lg font-medium text-gray-900">{venue.name}</h3>
              <span className="text-sm text-gray-500 self-start sm:self-auto">
                {venueManagers.length} manager{venueManagers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {venueManagers.length === 0 ? (
              <div className="text-center py-6 lg:py-8 text-gray-500">
                <p className="text-sm lg:text-base mb-2">No managers assigned to this venue</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-black hover:underline text-sm lg:text-base font-medium"
                >
                  Assign a manager
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {venueManagers.map(manager => (
                  <div 
                    key={manager.id} 
                    className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 lg:p-4 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm lg:text-base font-medium text-gray-700">
                          {manager.first_name?.[0]}{manager.last_name?.[0]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                          {manager.first_name} {manager.last_name}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500 truncate">{manager.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Manager
                      </span>
                      <button
                        onClick={() => handleVenueAssignment(manager)}
                        className="text-sm lg:text-base text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
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
      <div className="mt-6 lg:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Manager Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm lg:text-base">
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-blue-700">Total Managers:</span>
            <span className="font-medium text-blue-900 sm:mt-1">{managers.length}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-blue-700">Total Venues:</span>
            <span className="font-medium text-blue-900 sm:mt-1">{allVenues.length}</span>
          </div>
        </div>
      </div>

      {/* Add Manager Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-medium mb-4 lg:mb-6">Add New Manager</h3>
              
              <form onSubmit={handleAddManager} className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={newManager.firstName}
                      onChange={(e) => setNewManager(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={newManager.lastName}
                      onChange={(e) => setNewManager(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newManager.email}
                    onChange={(e) => setNewManager(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Assign to Venues</label>
                  <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {allVenues.map(venue => (
                        <label key={venue.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newManager.venueIds.includes(venue.id)}
                            onChange={() => handleVenueToggle(venue.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm lg:text-base text-gray-700 flex-1">{venue.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select at least one venue for this manager</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewManager({ firstName: '', lastName: '', email: '', venueIds: [] });
                    }}
                    className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm lg:text-base font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addFormLoading}
                    className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base font-medium"
                  >
                    {addFormLoading ? 'Creating...' : 'Create Manager'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Manager Venues Modal */}
      {editingManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-medium mb-4 lg:mb-6">
                Edit Venues for {editingManager.first_name} {editingManager.last_name}
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Venue Access</label>
                  <div className="border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {allVenues.map(venue => (
                        <label key={venue.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editManagerVenues.includes(venue.id)}
                            onChange={() => handleEditVenueToggle(venue.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm lg:text-base text-gray-700 flex-1">{venue.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select venues this manager should have access to</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setEditingManager(null)}
                    className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm lg:text-base font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVenueAssignments}
                    disabled={editFormLoading}
                    className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base font-medium"
                  >
                    {editFormLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagersTab;