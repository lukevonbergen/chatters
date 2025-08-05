import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';

const InvitesTab = ({ userRole, message, setMessage, allVenues, loading: parentLoading }) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch invites data
  const fetchInvites = async () => {
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
        setMessage('Failed to fetch invites');
        return;
      }

      // Process the data to include venue names
      const processedInvites = invitesData.map(invite => {
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
        const venueNames = venueIds
          .map(id => allVenues.find(v => v.id === id)?.name)
          .filter(Boolean)
          .join(', ') || 'No venues assigned';

        return {
          ...invite,
          venue_ids: venueIds,
          venue_names: venueNames
        };
      });

      setInvites(processedInvites);
    } catch (error) {
      console.error('Error in fetchInvites:', error);
      setMessage('Failed to fetch invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'master') {
      setMessage(''); // Clear any existing messages
      fetchInvites();
    }
  }, [userRole]);

  // Resend invite
  const handleResendInvite = async (invite) => {
    setActionLoading(prev => ({ ...prev, [invite.id]: 'resending' }));
    
    try {
      const response = await fetch('/api/admin/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteId: invite.id,
          email: invite.email,
          firstName: invite.first_name,
          lastName: invite.last_name
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend invite');
      }

      setMessage(`Invite resent successfully to ${invite.email}`);
      await fetchInvites(); // Refresh the list
    } catch (error) {
      setMessage('Failed to resend invite: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [invite.id]: null }));
    }
  };

  // Revoke invite
  const handleRevokeInvite = async (invite) => {
    if (!window.confirm(`Are you sure you want to revoke the invite for ${invite.email}?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [invite.id]: 'revoking' }));
    
    try {
      const { error } = await supabase
        .from('user_invites')
        .update({ status: 'revoked' })
        .eq('id', invite.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage(`Invite revoked for ${invite.email}`);
      await fetchInvites(); // Refresh the list
    } catch (error) {
      setMessage('Failed to revoke invite: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [invite.id]: null }));
    }
  };

  // Get status badge styling
  const getStatusBadge = (status, expiresAt) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'revoked') {
      return 'bg-gray-100 text-gray-800';
    } else if (status === 'accepted') {
      return 'bg-green-100 text-green-800';  
    } else if (isExpired) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status, expiresAt) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'revoked') return 'Revoked';
    if (status === 'accepted') return 'Accepted';
    if (isExpired) return 'Expired';
    return 'Pending';
  };

  // Format date
  const formatDate = (dateString) => {
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
        <p className="text-gray-500">Only master users can manage invites.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading invites...</span>
      </div>
    );
  }

  return (
    <div className="max-w-none lg:max-w-6xl">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Manager Invites</h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Manage pending invitations and track their status.
        </p>
      </div>

      {/* Invites List */}
      {invites.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm lg:text-base">No invites found.</p>
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
                    Invited
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => {
                  const currentStatus = getStatusText(invite.status, invite.expires_at);
                  const canResend = invite.status === 'pending' && new Date(invite.expires_at) < new Date();
                  const canRevoke = invite.status === 'pending';
                  
                  return (
                    <tr key={invite.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-700">
                              {invite.first_name?.[0]}{invite.last_name?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {invite.first_name} {invite.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{invite.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{invite.venue_names}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invite.status, invite.expires_at)}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invite.invited_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invite.expires_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {canResend && (
                            <button
                              onClick={() => handleResendInvite(invite)}
                              disabled={actionLoading[invite.id] === 'resending'}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[invite.id] === 'resending' ? 'Resending...' : 'Resend'}
                            </button>
                          )}
                          {canRevoke && (
                            <button
                              onClick={() => handleRevokeInvite(invite)}
                              disabled={actionLoading[invite.id] === 'revoking'}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[invite.id] === 'revoking' ? 'Revoking...' : 'Revoke'}
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
            {invites.map((invite) => {
              const currentStatus = getStatusText(invite.status, invite.expires_at);
              const canResend = invite.status === 'pending' && new Date(invite.expires_at) < new Date();
              const canRevoke = invite.status === 'pending';

              return (
                <div key={invite.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">
                        {invite.first_name?.[0]}{invite.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {invite.first_name} {invite.last_name}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invite.status, invite.expires_at)}`}>
                          {currentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{invite.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Venues: {invite.venue_names}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-400">
                          <div>Invited: {formatDate(invite.invited_at)}</div>
                          <div>Expires: {formatDate(invite.expires_at)}</div>
                        </div>
                        <div className="flex space-x-2">
                          {canResend && (
                            <button
                              onClick={() => handleResendInvite(invite)}
                              disabled={actionLoading[invite.id] === 'resending'}
                              className="text-xs text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {actionLoading[invite.id] === 'resending' ? 'Resending...' : 'Resend'}
                            </button>
                          )}
                          {canRevoke && (
                            <button
                              onClick={() => handleRevokeInvite(invite)}
                              disabled={actionLoading[invite.id] === 'revoking'}
                              className="text-xs text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {actionLoading[invite.id] === 'revoking' ? 'Revoking...' : 'Revoke'}
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
      {invites.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-3">Invite Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm lg:text-base">
            <div className="flex flex-col">
              <span className="text-blue-700">Total Invites:</span>
              <span className="font-medium text-blue-900">{invites.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700">Pending:</span>
              <span className="font-medium text-blue-900">
                {invites.filter(inv => inv.status === 'pending' && new Date(inv.expires_at) > new Date()).length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700">Accepted:</span>
              <span className="font-medium text-blue-900">
                {invites.filter(inv => inv.status === 'accepted').length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700">Expired/Revoked:</span>
              <span className="font-medium text-blue-900">
                {invites.filter(inv => inv.status === 'revoked' || new Date(inv.expires_at) < new Date()).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitesTab;