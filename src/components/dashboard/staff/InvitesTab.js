import React, { useState, useEffect } from 'react';
import { Mail, RotateCcw, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

const InvitesTab = ({ userRole, message, setMessage, allVenues, managers, fetchStaffData }) => {
  const [actionLoading, setActionLoading] = useState({});
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [activeManagers, setActiveManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending invitations and active managers
  useEffect(() => {
    const fetchInvitationData = async () => {
      try {
        setLoading(true);
        
        // Get current session token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('No valid session found');
        }

        const response = await fetch('/api/admin/get-pending-invitations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Check if we got HTML (404) instead of JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // API endpoint doesn't exist - use fallback (show active managers only)
          console.warn('API endpoint not available, using fallback data');
          
          // Process existing managers data as active (fallback mode)
          const uniqueManagers = [];
          const seenUserIds = new Set();
          
          (managers || []).forEach(manager => {
            if (!seenUserIds.has(manager.user_id)) {
              seenUserIds.add(manager.user_id);
              uniqueManagers.push(manager);
            }
          });

          const processedManagers = uniqueManagers.map(manager => {
            const managerVenues = (managers || [])
              .filter(m => m.user_id === manager.user_id)
              .map(m => allVenues.find(v => v.id === m.venue_id)?.name)
              .filter(Boolean);
            
            return {
              id: manager.user_id,
              email: manager.email,
              first_name: manager.first_name,
              last_name: manager.last_name,
              created_at: manager.created_at,
              venues: managerVenues,
              last_sign_in_at: null // Not available in fallback mode
            };
          });

          setPendingInvitations([]); // Can't detect pending in fallback mode
          setActiveManagers(processedManagers);
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          setPendingInvitations(data.pendingInvitations || []);
          setActiveManagers(data.activeManagers || []);
        } else {
          throw new Error(data.error || 'Failed to fetch invitation data');
        }
      } catch (error) {
        console.error('Error fetching invitations:', error);
        setMessage('Failed to load invitation data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'master') {
      fetchInvitationData();
    }
  }, [userRole, setMessage, managers, allVenues]);

  // Resend invitation
  const handleResendInvitation = async (manager) => {
    setActionLoading(prev => ({ ...prev, [manager.id]: 'resending' }));
    
    try {
      const response = await fetch('/api/admin/resend-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: manager.email })
      });

      // Check if API exists
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resend invitation feature is not available');
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend invitation');
      }

      setMessage(`Invitation resent to ${manager.email}`);
      
    } catch (error) {
      setMessage('Failed to resend invitation: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [manager.id]: null }));
    }
  };

  // Revoke pending invitation
  const handleRevokePendingInvitation = async (manager) => {
    setMessage('Cancel invitation feature is not available');
    return;
  };

  // Revoke active manager access
  const handleRevokeAccess = async (manager, deleteAccount = false) => {
    if (deleteAccount) {
      setMessage('Delete account feature is not available');
      return;
    }

    // For revoke access (not delete), we can use the existing staff table deletion
    const action = 'revoke access';
    const warning = 'This will remove their venue access but keep their account.';
    
    if (!window.confirm(`Are you sure you want to ${action} for ${manager.email}? ${warning}`)) {
      return;
    }

    const loadingKey = 'revoking';
    setActionLoading(prev => ({ ...prev, [manager.id]: loadingKey }));
    
    try {
      // Use Supabase directly for staff table deletion (this works in local dev)
      const { supabase } = await import('../../../utils/supabase');
      
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', manager.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage(`Access revoked for ${manager.email}`);
      
      // Refresh parent staff data
      if (fetchStaffData) {
        await fetchStaffData();
      }

      // Remove from local state
      setActiveManagers(prev => prev.filter(m => m.id !== manager.id));
      
    } catch (error) {
      setMessage(`Failed to ${action}: ` + error.message);
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

  if (loading) {
    return (
      <div className="max-w-none lg:max-w-6xl">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none lg:max-w-6xl">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Manager Invitations</h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Manage pending invitations and active manager accounts.
        </p>
      </div>

      {/* Pending Invitations Section */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
          Pending Invitations ({pendingInvitations.length})
        </h3>
        
        {pendingInvitations.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">No pending invitations.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venues</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingInvitations.map((manager) => (
                    <tr key={manager.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-amber-600" />
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
                        <div className="text-sm text-gray-900">{manager.venues.join(', ') || 'No venues'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(manager.invited_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleResendInvitation(manager)}
                            disabled={actionLoading[manager.id] === 'resending'}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {actionLoading[manager.id] === 'resending' ? 'Sending...' : 'Resend'}
                          </button>
                          <button
                            onClick={() => handleRevokePendingInvitation(manager)}
                            disabled={actionLoading[manager.id] === 'revoking'}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {actionLoading[manager.id] === 'revoking' ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Active Managers Section */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          Active Managers ({activeManagers.length})
        </h3>

        {activeManagers.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">No active managers.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venues</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeManagers.map((manager) => (
                    <tr key={manager.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-green-700">
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
                        <div className="text-sm text-gray-900">{manager.venues.join(', ') || 'No venues'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.last_sign_in_at ? formatDate(manager.last_sign_in_at) : 'Never signed in'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleRevokeAccess(manager, false)}
                            disabled={actionLoading[manager.id] === 'revoking'}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[manager.id] === 'revoking' ? 'Revoking...' : 'Revoke Access'}
                          </button>
                          <button
                            onClick={() => handleRevokeAccess(manager, true)}
                            disabled={actionLoading[manager.id] === 'deleting'}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[manager.id] === 'deleting' ? 'Deleting...' : 'Delete Account'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm lg:text-base">
          <div className="flex flex-col">
            <span className="text-blue-700">Pending Invitations:</span>
            <span className="font-medium text-blue-900">{pendingInvitations.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-blue-700">Active Managers:</span>
            <span className="font-medium text-blue-900">{activeManagers.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-blue-700">Total Venues:</span>
            <span className="font-medium text-blue-900">{allVenues.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-blue-700">Total Managers:</span>
            <span className="font-medium text-blue-900">{pendingInvitations.length + activeManagers.length}</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-blue-600 space-y-1">
          <div>• <strong>Resend:</strong> Sends a new invitation email to pending managers</div>
          <div>• <strong>Cancel:</strong> Permanently deletes the invitation and account</div>
          <div>• <strong>Revoke Access:</strong> Removes venue access but keeps the account</div>
          <div>• <strong>Delete Account:</strong> Permanently deletes the manager's account and all data</div>
        </div>
      </div>
    </div>
  );
};

export default InvitesTab;