import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId } = useVenue();
  const [staffList, setStaffList] = useState([]);

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
    </PageContainer>
  );
};

export default StaffPage;