import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';

const InvitesTab = ({ userRole, message, setMessage, allVenues, managers, fetchStaffData }) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [combinedManagerData, setCombinedManagerData] = useState([]);

  // Fetch pending invites data
  const fetchInvites = async () => {
    if (userRole !== 'master') return;
    
    setLoading(true);
    try {
      // Get current user's account_id
      const { data: authUser } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', authUser.user.id)
        .single();

      if (!userData?.account_id) {
        console.error('No account_id found for user');
        setLoading(false);
        return;
      }

      // Fetch pending invites for this account
      const { data: invitesData, error } = await supabase
        .from('user_invites')
        .select(`
          id,
          email,
          first_name,
          last_name,
          status,
          invited_at,
          expires_at,
          venue_ids
        `)
        .eq('account_id', userData.account_id)
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Error fetching invites:', error);
        setMessage('Failed to fetch invites: ' + error.message);
        return;
      }

      setInvites(invitesData || []);

    } catch (error) {
      console.error('Error in fetchInvites:', error);
      setMessage('Failed to fetch invite data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Combine managers and invites data
  useEffect(() => {
    // Get unique managers (same logic as ManagersTab)
    const uniqueManagers = [];
    const seenUserIds = new Set();
    
    (managers || []).forEach(manager => {
      if (!seenUserIds.has(manager.user_id)) {
        seenUserIds.add(manager.user_id);
        uniqueManagers.push(manager);
      }
    });

    // Process active managers
    const activeManagers = uniqueManagers.map(manager => {
      // Get venue names for this manager (they might be assigned to multiple venues)
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
        expires_at: null,
        venue_names: managerVenues.join(', ') || 'No venues assigned',
        source: 'manager',
        originalData: manager
      };
    });

    // Process pending invites
    const pendingInvites = (invites || []).map(invite => {
      // Parse venue_ids if it's a string
      let venueIds = invite.venue_ids;
      if (typeof venueIds === 'string') {
        try {
          venueIds = JSON.parse(venueIds);
        } catch (e) {
          venueIds = [];
        }
      }

      // Get venue names from allVenues prop
      const venueNames = (venueIds || [])
        .map(id => allVenues?.find(v => v.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'No venues assigned';

      return {
        id: invite.id,
        email: invite.email,
        first_name: invite.first_name,
        last_name: invite.last_name,
        status: invite.status,
        invited_at: invite.invited_at,
        expires_at: invite.expires_at,
        venue_names: venueNames,
        source: 'invite',
        originalData: invite
      };
    });

    // Combine and deduplicate (prioritize active managers over pending invites)
    const emailMap = new Map();
    
    // Add active managers first
    activeManagers.forEach(manager => {
      emailMap.set(manager.email, manager);
    });

    // Add pending invites, but don't overwrite existing active managers
    pendingInvites.forEach(invite => {
      if (!emailMap.has(invite.email)) {
        emailMap.set(invite.email, invite);
      }
    });

    const combined = Array.from(emailMap.values());
    setCombinedManagerData(combined);
  }, [managers, invites, allVenues]);

  // Initial load
  useEffect(() => {
    setMessage(''); // Clear any existing messages
    fetchInvites();
  }, [userRole]);

  // Resend invite (only for pending invites)
  const handleResendInvite = async (manager) => {
    setActionLoading(prev => ({ ...prev, [manager.id]: 'resending' }));
    
    try {
      const response = await fetch('/api/admin/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteId: manager.id,
          email: manager.email,
          firstName: manager.first_name,
          lastName: manager.last_name
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend invite');
      }

      setMessage(`Invite resent successfully to ${manager.email}`);
      await fetchInvites(); // Refresh the invites
    } catch (error) {
      setMessage('Failed to resend invite: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [manager.id]: null }));
    }
  };

  // Revoke access/invite
  const handleRevoke = async (manager) => {
    const action = manager.status === 'accepted' ? 'revoke access for' : 'revoke the invite for';
    if (!window.confirm(`Are you sure you want to ${action} ${manager.email}?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [manager.id]: 'revoking' }));
    
    try {
      if (manager.source === 'manager') {
        // Revoke access for active manager - remove from staff table (same logic as ManagersTab)
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
      } else {
        // Revoke pending invite
        const { error } = await supabase
          .from('user_invites')
          .update({ status: 'revoked' })
          .eq('id', manager.id);

        if (error) {
          throw new Error(error.message);
        }

        setMessage(`Invite revoked for ${manager.email}`);
        await fetchInvites(); // Refresh the invites
      }
    } catch (error) {
      setMessage('Failed to revoke: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [manager.id]: null }));
    }
  };

  // Get status badge styling
  const getStatusBadge = (status, expiresAt) => {
    if (status === 'accepted') {
      return 'bg-green-100 text-green-800';
    }
    
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    
    if (status === 'revoked') {
      return 'bg-gray-100 text-gray-800';
    } else if (isExpired) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status, expiresAt) => {
    if (status === 'accepted') return 'Active';
    
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    
    if (status === 'revoked') return 'Revoked';
    if (isExpired) return 'Expired';
    return 'Pending';
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
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading manager data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-none lg:max-w-6xl">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Manager Access</h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Manage current managers and pending invitations.
        </p>
      </div>

      {/* Manager List */}
      {combinedManagerData.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm lg:text-base">No managers found.</p>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Invite managers from the Managers tab to see them here.
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinedManagerData.map((manager) => {
                  const currentStatus = getStatusText(manager.status, manager.expires_at);
                  const canResend = manager.source === 'invite' && manager.status === 'pending' && manager.expires_at && new Date(manager.expires_at) < new Date();
                  const canRevoke = manager.status === 'pending' || manager.status === 'accepted';
                  
                  return (
                    <tr key={`${manager.source}-${manager.id}`}>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(manager.status, manager.expires_at)}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(manager.invited_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {canResend && (
                            <button
                              onClick={() => handleResendInvite(manager)}
                              disabled={actionLoading[manager.id] === 'resending'}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[manager.id] === 'resending' ? 'Resending...' : 'Resend'}
                            </button>
                          )}
                          {canRevoke && (
                            <button
                              onClick={() => handleRevoke(manager)}
                              disabled={actionLoading[manager.id] === 'revoking'}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[manager.id] === 'revoking' ? 'Revoking...' : 'Revoke'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {combinedManagerData.map((manager) => {
              const currentStatus = getStatusText(manager.status, manager.expires_at);
              const canResend = manager.source === 'invite' && manager.status === 'pending' && manager.expires_at && new Date(manager.expires_at) < new Date();
              const canRevoke = manager.status === 'pending' || manager.status === 'accepted';

              return (
                <div key={`${manager.source}-${manager.id}`} className="p-4 border-b border-gray-200 last:border-b-0">
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(manager.status, manager.expires_at)}`}>
                          {currentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{manager.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Venues: {manager.venue_names}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-400">
                          <div>Date: {formatDate(manager.invited_at)}</div>
                        </div>
                        <div className="flex space-x-2">
                          {canResend && (
                            <button
                              onClick={() => handleResendInvite(manager)}
                              disabled={actionLoading[manager.id] === 'resending'}
                              className="text-xs text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {actionLoading[manager.id] === 'resending' ? 'Resending...' : 'Resend'}
                            </button>
                          )}
                          {canRevoke && (
                            <button
                              onClick={() => handleRevoke(manager)}
                              disabled={actionLoading[manager.id] === 'revoking'}
                              className="text-xs text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {actionLoading[manager.id] === 'revoking' ? 'Revoking...' : 'Revoke'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {combinedManagerData.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Manager Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm lg:text-base">
            <div className="flex flex-col">
              <span className="text-blue-700">Total Managers:</span>
              <span className="font-medium text-blue-900">{combinedManagerData.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700">Active:</span>
              <span className="font-medium text-blue-900">
                {combinedManagerData.filter(m => m.status === 'accepted').length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700">Pending:</span>
              <span className="font-medium text-blue-900">
                {combinedManagerData.filter(m => m.status === 'pending' && (!m.expires_at || new Date(m.expires_at) > new Date())).length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700">Expired/Revoked:</span>
              <span className="font-medium text-blue-900">
                {combinedManagerData.filter(m => m.status === 'revoked' || (m.expires_at && new Date(m.expires_at) < new Date())).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitesTab;