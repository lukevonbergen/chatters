import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId, venueName, userRole } = useVenue();
  const [staffList, setStaffList] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!venueId) return;
    const loadStaff = async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('venue_id', venueId);

      if (!error) setStaffList(data);
    };

    loadStaff();
  }, [venueId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) throw new Error('Missing user');

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const payload = {
        ...form,
        venueId,
        accountId: userRow.account_id
      };

      const res = await fetch('/api/admin/invite-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to invite manager');

      setFeedback({ type: 'success', message: 'Manager invited successfully.' });
      setShowInvite(false);
      setForm({ firstName: '', lastName: '', email: '' });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!venueId) return null;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {staffList.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {staff.first_name} {staff.last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {staff.role || 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInvite && (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">Invite New Manager</h3>

          {feedback && (
            <div
              className={`mb-4 p-3 rounded text-sm ${
                feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
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