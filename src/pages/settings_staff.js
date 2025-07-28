import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId, venueName, userRole } = useVenue();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!venueId) return;
    fetchStaff();
  }, [venueId]);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('id, first_name, last_name, email, role, user_id, venue_id')
      .eq('venue_id', venueId);

    if (!error) setStaffList(data);
  };

  const handleResend = async (staff) => {
    setFeedback(null);
    setLoading(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error('Missing user');

      const { data: userRow } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', userId)
        .single();

      await fetch('/api/admin/invite-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: staff.first_name,
          lastName: staff.last_name,
          email: staff.email,
          venueId: staff.venue_id,
          accountId: userRow.account_id,
        }),
      });

      setFeedback({ type: 'success', message: 'Invite re-sent.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this invite?');
    if (!confirmed) return;

    setLoading(true);
    setFeedback(null);

    const { error } = await supabase.from('staff').delete().eq('id', id);

    if (error) {
      setFeedback({ type: 'error', message: error.message });
    } else {
      setFeedback({ type: 'success', message: 'Staff removed.' });
      fetchStaff();
    }

    setLoading(false);
  };

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff</h1>

      {feedback && (
        <div className={`mb-4 p-3 rounded text-sm ${
          feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Team at {venueName}</h2>
        </div>

        {staffList.length === 0 ? (
          <p className="text-gray-500 text-sm">No staff found for this location.</p>
        ) : (
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-gray-900">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-3 text-gray-700">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{s.role || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-gray-700">{venueName}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {!s.user_id && (
                      <>
                        <button
                          className="text-blue-600 hover:underline text-xs"
                          onClick={() => handleResend(s)}
                          disabled={loading}
                        >
                          Resend Invite
                        </button>
                        <button
                          className="text-red-600 hover:underline text-xs"
                          onClick={() => handleDelete(s.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageContainer>
  );
};

export default StaffPage;