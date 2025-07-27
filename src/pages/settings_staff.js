import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useVenue } from '../context/VenueContext';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId, allVenues, userRole } = useVenue();
  const [staffList, setStaffList] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    venueId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const openInvite = () => {
    setForm({ ...form, venueId: venueId || '' });
    setShowDialog(true);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const res = await fetch('/api/admin/invite-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        venueId: form.venueId,
        accountId: allVenues.find(v => v.id === form.venueId)?.account_id, // optional fallback
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Something went wrong.');
    } else {
      setShowDialog(false);
    }
    setIsSubmitting(false);
  };

  if (!venueId) return null;

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        {userRole === 'master' && (
          <Button onClick={openInvite}>+ Invite Manager</Button>
        )}
      </div>

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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <form onSubmit={handleInvite} className="bg-white rounded-xl p-6 w-full max-w-md mx-auto space-y-4">
          <h2 className="text-lg font-semibold">Invite Manager</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Label>First Name</Label>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {userRole === 'master' && (
            <div>
              <Label>Venue</Label>
              <Select value={form.venueId} onValueChange={(value) => setForm({ ...form, venueId: value })}>
                {allVenues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </Select>
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </Button>
        </form>
      </Dialog>
    </PageContainer>
  );
};

export default StaffPage;