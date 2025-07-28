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

  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });

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
    setLoading(true);
    setFeedback(null);
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
    if (!window.confirm('Delete this invite?')) return;
    setLoading(true);
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) {
      setFeedback({ type: 'error', message: error.message });
    } else {
      setFeedback({ type: 'success', message: 'Staff removed.' });
      fetchStaff();
    }
    setLoading(false);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error('Missing user');

      const { data: userRow } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', userId)
        .single();

      const res = await fetch('/api/admin/invite-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          venueId,
          accountId: userRow.account_id,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to invite');

      setFeedback({ type: 'success', message: 'Invite sent successfully.' });
      setShowInvite(false);
      setForm({ firstName: '', lastName: '', email: '' });
      fetchStaff();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
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
          {userRole === 'master' && (
            <button
              onClick={() => setShowInvite(true)}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              + Invite Manager
            </button>
          )}
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
                  <td className="px-4 py-3">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-3">{s.email || '—'}</td>
                  <td className="px-4 py-3">{s.role || 'Unassigned'}</td>
                  <td className="px-4 py-3">{venueName}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {!s.user_id && (
                      <>
                        <button
                          onClick={() => handleResend(s)}
                          disabled={loading}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={loading}
                          className="text-red-600 hover:underline text-xs"
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

      {showInvite && (
        <div className="bg-white border mt-6 border-gray-200 rounded-lg shadow p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">Invite New Manager</h3>

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >
                {loading ? 'Inviting...' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
};

export default StaffPage;