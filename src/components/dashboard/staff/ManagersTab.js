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
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigningToVenue, setAssigningToVenue] = useState(null);
  const [editingManager, setEditingManager] = useState(null);
  const [addFormLoading, setAddFormLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [assignFormLoading, setAssignFormLoading] = useState(false);
  const [deleteFormLoading, setDeleteFormLoading] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [editingManagerDetails, setEditingManagerDetails] = useState(null);
  const [editDetailsLoading, setEditDetailsLoading] = useState(false);

  // Add manager form state
  const [newManager, setNewManager] = useState({
    firstName: '',
    lastName: '',
    email: '',
    venueIds: []
  });

  // Edit manager state
  const [editManagerVenues, setEditManagerVenues] = useState([]);
  
  // Selected managers for assignment
  const [selectedManagersForAssignment, setSelectedManagersForAssignment] = useState([]);

  // Group managers by venue for display
  const managersByVenue = {};
  allVenues.forEach(venue => {
    const venueManagers = managers.filter(manager => 
      manager.venue_id === venue.id
    );
    
    managersByVenue[venue.id] = {
      venue: venue,
      managers: venueManagers
    };
  });

  // Get unique managers (not grouped by venue)
  const uniqueManagers = [];
  const seenUserIds = new Set();
  
  managers.forEach(manager => {
    if (!seenUserIds.has(manager.user_id)) {
      seenUserIds.add(manager.user_id);
      uniqueManagers.push(manager);
    }
  });

  // Add new manager
  const handleAddManager = async (e) => {
    e.preventDefault();
    
    if (!newManager.firstName || !newManager.lastName || !newManager.email || newManager.venueIds.length === 0) {
      setMessage('Please fill in all fields and select at least one venue');
      return;
    }

    setAddFormLoading(true);
    
    try {
      // Get current user's account_id
      const { data: authUser } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', authUser.user.id)
        .single();

      // Call updated API with multiple venues
      const payload = {
        email: newManager.email,
        firstName: newManager.firstName,
        lastName: newManager.lastName,
        venueIds: newManager.venueIds, // Pass all venue IDs
        accountId: userData.account_id
      };

      const res = await fetch('/api/admin/invite-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to invite manager');
      }

      // Success!
      setMessage(`Manager invited successfully! An invitation email has been sent to ${newManager.email}.`);
      setNewManager({ firstName: '', lastName: '', email: '', venueIds: [] });
      setShowAddForm(false);
      await fetchStaffData();

    } catch (error) {
      setMessage('Failed to invite manager: ' + error.message);
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

  // Handle assign managers to venue
  const handleAssignToVenue = (venue) => {
    setAssigningToVenue(venue);
    setShowAssignForm(true);
    // Pre-select managers already assigned to this venue
    const assignedManagerIds = managers
      .filter(m => m.venue_id === venue.id)
      .map(m => m.user_id);
    setSelectedManagersForAssignment(assignedManagerIds);
  };

  // Handle manager selection for assignment
  const handleManagerAssignmentToggle = (managerId) => {
    setSelectedManagersForAssignment(prev => 
      prev.includes(managerId)
        ? prev.filter(id => id !== managerId)
        : [...prev, managerId]
    );
  };

  // Save manager assignments to venue
  const handleSaveManagerAssignments = async () => {
    setAssignFormLoading(true);
    
    try {
      // Delete existing assignments for this venue
      const { error: deleteError } = await supabase
        .from('staff')
        .delete()
        .eq('venue_id', assigningToVenue.id)
        .eq('role', 'manager');

      if (deleteError) {
        throw new Error('Failed to update manager assignments: ' + deleteError.message);
      }

      // Create new assignments for selected managers
      if (selectedManagersForAssignment.length > 0) {
        const assignmentRecords = selectedManagersForAssignment.map(managerId => {
          const manager = uniqueManagers.find(m => m.user_id === managerId);
          return {
            user_id: managerId,
            venue_id: assigningToVenue.id,
            role: 'manager'
          };
        });

        const { error: insertError } = await supabase
          .from('staff')
          .insert(assignmentRecords);

        if (insertError) {
          throw new Error('Failed to assign managers: ' + insertError.message);
        }
      }

      setMessage('Manager assignments updated successfully!');
      setShowAssignForm(false);
      setAssigningToVenue(null);
      await fetchStaffData();

    } catch (error) {
      setMessage('Failed to update manager assignments: ' + error.message);
    } finally {
      setAssignFormLoading(false);
    }
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
      setMessage('Failed to update venue assignments: ' + error.message);
    } finally {
      setEditFormLoading(false);
    }
  };

  // Delete manager entirely
  const handleDeleteManager = async () => {
    if (!managerToDelete) return;
    
    setDeleteFormLoading(true);
    
    try {
      // First, delete all staff records for this manager
      const { error: staffDeleteError } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', managerToDelete.user_id);

      if (staffDeleteError) {
        throw new Error('Failed to remove manager assignments: ' + staffDeleteError.message);
      }

      // Then delete the user record
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', managerToDelete.user_id);

      if (userDeleteError) {
        throw new Error('Failed to delete manager user: ' + userDeleteError.message);
      }

      // Try to delete from auth (this might fail if user was created differently, but that's okay)
      try {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(managerToDelete.user_id);
        // We don't throw on auth delete errors as the user record is already gone
      } catch (authError) {
        // Silently handle auth deletion errors
      }

      setMessage('Manager deleted successfully!');
      setManagerToDelete(null);
      await fetchStaffData();

    } catch (error) {
      setMessage('Failed to delete manager: ' + error.message);
    } finally {
      setDeleteFormLoading(false);
    }
  };

  // Edit manager details (name, email, venues)
  const handleEditManagerDetails = (manager) => {
    const managerVenues = managers
      .filter(m => m.user_id === manager.user_id)
      .map(m => m.venue_id);
    
    setEditingManagerDetails({
      ...manager,
      first_name: manager.users?.first_name || '',
      last_name: manager.users?.last_name || '',
      email: manager.users?.email || '',
      venue_ids: managerVenues
    });
  };

  // Save manager venue assignments
  const handleSaveManagerDetails = async () => {
    if (!editingManagerDetails) return;
    
    setEditDetailsLoading(true);
    
    try {
      // Update venue assignments only
      // First, delete existing staff records for this manager
      const { error: deleteError } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', editingManagerDetails.user_id);

      if (deleteError) {
        throw new Error('Failed to update venue assignments: ' + deleteError.message);
      }

      // Create new staff records for selected venues
      if (editingManagerDetails.venue_ids.length > 0) {
        const newStaffRecords = editingManagerDetails.venue_ids.map(venueId => ({
          user_id: editingManagerDetails.user_id,
          venue_id: venueId,
          role: 'manager'
        }));

        const { error: insertError } = await supabase
          .from('staff')
          .insert(newStaffRecords);

        if (insertError) {
          throw new Error('Failed to assign venues: ' + insertError.message);
        }
      }

      setMessage('Manager venue assignments updated successfully!');
      setEditingManagerDetails(null);
      await fetchStaffData();

    } catch (error) {
      setMessage('Failed to update venue assignments: ' + error.message);
    } finally {
      setEditDetailsLoading(false);
    }
  };

  // Cancel editing manager details
  const handleCancelEditManagerDetails = () => {
    setEditingManagerDetails(null);
  };

  // Handle venue toggle for editing manager details
  const handleEditManagerVenueToggle = (venueId) => {
    setEditingManagerDetails(prev => ({
      ...prev,
      venue_ids: prev.venue_ids.includes(venueId)
        ? prev.venue_ids.filter(id => id !== venueId)
        : [...prev.venue_ids, venueId]
    }));
  };

  return (
    <div className="max-w-none lg:max-w-6xl">
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex-1">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Managers</h2>
            <p className="text-gray-600 text-sm">Manage your venue managers and their venue assignments.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium"
          >
            Add Manager
          </button>
        </div>
      </div>

      {/* Managers List */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-base lg:text-lg font-medium text-gray-900">All Managers</h3>
          <span className="text-sm text-gray-500">
            {uniqueManagers.length} manager{uniqueManagers.length !== 1 ? 's' : ''} across all venues
          </span>
        </div>

        {uniqueManagers.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No managers yet</h3>
            <p className="text-gray-600 mb-4">Add your first manager to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium"
            >
              Add First Manager
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {uniqueManagers.map(manager => {
              // Get all venues for this manager
              const managerVenues = managers
                .filter(m => m.user_id === manager.user_id)
                .map(m => allVenues.find(v => v.id === m.venue_id))
                .filter(Boolean);
              
              return editingManagerDetails?.user_id === manager.user_id ? (
                // Edit mode - Venue assignments only
                <div key={manager.user_id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="space-y-3">
                    {/* Manager Info (Read-only) */}
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900">
                        {manager.users?.first_name} {manager.users?.last_name}
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <div className="text-xs text-gray-500">{manager.users?.email}</div>
                    </div>

                    {/* Venue Assignment */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Venue Access</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {allVenues.map(venue => (
                          <label key={venue.id} className="flex items-center space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={editingManagerDetails.venue_ids.includes(venue.id)}
                              onChange={() => handleEditManagerVenueToggle(venue.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                              disabled={editDetailsLoading}
                            />
                            <span className="text-gray-700">{venue.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-blue-200">
                      <button
                        onClick={handleCancelEditManagerDetails}
                        disabled={editDetailsLoading}
                        className="px-3 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveManagerDetails}
                        disabled={editDetailsLoading || editingManagerDetails.venue_ids.length === 0}
                        className="px-6 py-2 text-sm bg-custom-green text-white rounded-lg hover:bg-custom-green-hover disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {editDetailsLoading ? 'Saving...' : 'Update Venues'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View mode
                <div key={manager.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  {/* Manager info in one line */}
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {manager.users?.first_name} {manager.users?.last_name}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="truncate">{manager.users?.email}</span>
                      <span>•</span>
                      <span>
                        {managerVenues.length === 1 
                          ? managerVenues[0]?.name 
                          : `${managerVenues.length} venues`
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button 
                      onClick={() => handleEditManagerDetails(manager)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit venue assignments"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setManagerToDelete(manager)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete manager"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary card */}
      <div className="mt-6 lg:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Manager Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-blue-700">Total Managers:</span>
            <span className="font-medium text-blue-900 sm:mt-1">{uniqueManagers.length}</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={newManager.lastName}
                      onChange={(e) => setNewManager(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Assign to Venues</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {allVenues.map(venue => (
                        <label key={venue.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newManager.venueIds.includes(venue.id)}
                            onChange={() => handleVenueToggle(venue.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm text-gray-700 flex-1">{venue.name}</span>
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
                    className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addFormLoading}
                    className="w-full sm:w-auto px-6 py-2 bg-black text-white rounded-lg hover:bg-custom-black-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {addFormLoading ? 'Inviting...' : 'Invite Manager'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Managers to Venue Modal */}
      {showAssignForm && assigningToVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-medium mb-4 lg:mb-6">
                Assign Managers to {assigningToVenue.name}
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                {uniqueManagers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm mb-2">No managers available</p>
                    <p className="text-xs text-gray-400">Create a manager first using the "Add Manager" button</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Managers</label>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {uniqueManagers.map(manager => (
                          <label key={manager.user_id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedManagersForAssignment.includes(manager.user_id)}
                              onChange={() => handleManagerAssignmentToggle(manager.user_id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div className="flex items-center space-x-2 flex-1">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-gray-700">
                                  {manager.users?.first_name?.[0]}{manager.users?.last_name?.[0]}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {manager.users?.first_name} {manager.users?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{manager.users?.email}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Select managers to assign to this venue</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowAssignForm(false);
                      setAssigningToVenue(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  {uniqueManagers.length > 0 && (
                    <button
                      onClick={handleSaveManagerAssignments}
                      disabled={assignFormLoading}
                      className="w-full sm:w-auto px-6 py-2 bg-custom-green text-white rounded-lg hover:bg-custom-green-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {assignFormLoading ? 'Saving...' : 'Save Assignments'}
                    </button>
                  )}
                </div>
              </div>
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
                Edit Venues for {editingManager.users?.first_name} {editingManager.users?.last_name}
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Venue Access</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {allVenues.map(venue => (
                        <label key={venue.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editManagerVenues.includes(venue.id)}
                            onChange={() => handleEditVenueToggle(venue.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm text-gray-700 flex-1">{venue.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select venues this manager should have access to</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setEditingManager(null)}
                    className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVenueAssignments}
                    disabled={editFormLoading}
                    className="w-full sm:w-auto px-6 py-2 bg-custom-green text-white rounded-lg hover:bg-custom-green-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {editFormLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Manager Confirmation Modal */}
      {managerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 lg:p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.95-.833-2.72 0L4.094 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Manager
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to permanently delete <strong>{managerToDelete.users?.first_name} {managerToDelete.users?.last_name}</strong>?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>Warning:</strong> This action cannot be undone. The manager will be removed from all venues and their account will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setManagerToDelete(null)}
                  disabled={deleteFormLoading}
                  className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteManager}
                  disabled={deleteFormLoading}
                  className="w-full sm:w-auto px-6 py-2 bg-custom-red text-white rounded-lg hover:bg-custom-red-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {deleteFormLoading ? 'Deleting...' : 'Delete Manager'}
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