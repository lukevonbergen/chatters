import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';

const InvitesTab = ({ userRole, message, setMessage, allVenues, managers, fetchStaffData }) => {
  const [actionLoading, setActionLoading] = useState({});
  const [managerData, setManagerData] = useState([]);

  // Process managers data (same logic as ManagersTab)
  useEffect(() => {
    // Get unique managers
    const uniqueManagers = [];
    const seenUserIds = new Set();
    
    (managers || []).forEach(manager => {
      if (!seenUserIds.has(manager.user_id)) {
        seenUserIds.add(manager.user_id);
        uniqueManagers.push(manager);
      }
    });

    // Process active managers
    const processedManagers = uniqueManagers.map(manager => {
      // Get venue names for this manager
      const managerVenues = (managers || [])
        .filter(m => m.user_id === manager.user_id)
        .map(m => allVenues.find(v => v.id === m.venue_id)?.name)
        .filter(Boolean);
      
      return {
        id: manager.user_id,
        email: manager.email,
        first_name: manager.first_name,
        last_name: manager.last_name,
        status: 'accepted',
        invited_at: manager.created_at,
        venue_names: managerVenues.join(', ') || 'No venues assigned',
        originalData: manager
      };
    });

    setManagerData(processedManagers);
    setMessage(''); // Clear any existing messages
  }, [managers, allVenues, setMessage]);

  // Revoke manager access
  const handleRevokeAccess = async (manager) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${manager.email}?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [manager.id]: 'revoking' }));
    
    try {
      // Remove from staff table (same logic as ManagersTab)
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', manager.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage(`Manager access revoked for ${manager.email}`);
      
      // Refresh staff data to update the managers list
      if (fetchStaffData) {
        await fetchStaffData();
      }
    } catch (error) {
      setMessage('Failed to revoke access: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [manager.id]: null }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userRole !== 'master') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Only master users can manage manager access.</p>
      </div>
    );
  }

  return (
    <div className="max-w-none lg:max-w-6xl">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Manager Access</h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Manage current active managers. Pending invitations are sent via email.
        </p>
      </div>

      {/* Manager List */}
      {managerData.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm lg:text-base">No active managers found.</p>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Invite managers from the Managers tab to see them here once they accept.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managerData.map((manager) => (
                  <tr key={manager.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-700">
                            {manager.first_name?.[0]}{manager.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {manager.first_name} {manager.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{manager.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{manager.venue_names}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(manager.invited_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRevokeAccess(manager)}
                        disabled={actionLoading[manager.id] === 'revoking'}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[manager.id] === 'revoking' ? 'Revoking...' : 'Revoke Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {managerData.map((manager) => (
              <div key={manager.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {manager.first_name?.[0]}{manager.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {manager.first_name} {manager.last_name}
                      </p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{manager.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Venues: {manager.venue_names}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-400">
                        <div>Added: {formatDate(manager.invited_at)}</div>
                      </div>
                      <button
                        onClick={() => handleRevokeAccess(manager)}
                        disabled={actionLoading[manager.id] === 'revoking'}
                        className="text-xs text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {actionLoading[manager.id] === 'revoking' ? 'Revoking...' : 'Revoke Access'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {managerData.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Manager Summary</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm lg:text-base">
            <div className="flex flex-col">
              <span className="text-blue-700">Active Managers:</span>
              <span className="font-medium text-blue-900">{managerData.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700">Total Venues:</span>
              <span className="font-medium text-blue-900">{allVenues.length}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600">
            Note: Pending invitations are managed via email. Managers will appear here once they accept their invitation.
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitesTab;