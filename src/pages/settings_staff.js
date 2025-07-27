import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId, userRole, allVenues } = useVenue();
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  if (!venueId) return null;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff</h1>

      {userRole === 'master' && (
        <div className="mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            + Invite Manager
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">Invite Manager</h2>

            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {success && <div className="text-green-600 text-sm mb-2">{success}</div>}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border px-3 py-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border px-3 py-2 rounded text-sm"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded text-sm"
              />
              {userRole === 'master' && (
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="w-full border px-3 py-2 rounded text-sm"
                >
                  <option value="">Select a venue</option>
                  {allVenues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setError('');
                  setSuccess('');
                  if (!firstName || !lastName || !email || (!selectedVenue && userRole === 'master')) {
                    setError('All fields are required.');
                    return;
                  }

                  setIsSubmitting(true);

                  const res = await fetch('/api/admin/invite-manager', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      firstName,
                      lastName,
                      email,
                      venueId: userRole === 'master' ? selectedVenue : venueId,
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    setError(data.message || 'Failed to invite manager.');
                  } else {
                    setSuccess('Manager invited successfully.');
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setSelectedVenue('');
                    setTimeout(() => setShowModal(false), 1500);
                  }

                  setIsSubmitting(false);
                }}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                {isSubmitting ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default StaffPage;