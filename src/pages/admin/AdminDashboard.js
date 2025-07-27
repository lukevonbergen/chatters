import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    accountPhone: '',
    trialEndsAt: '',
    venues: [
      {
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        tableCount: '',
        logo: null,
      },
    ],
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVenueChange = (index, e) => {
    const { name, value, files } = e.target;
    const newVenues = [...formData.venues];
    newVenues[index][name] = files ? files[0] : value;
    setFormData((prev) => ({ ...prev, venues: newVenues }));
  };

  const addVenue = () => {
    setFormData((prev) => ({
      ...prev,
      venues: [
        ...prev.venues,
        {
          name: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          postcode: '',
          tableCount: '',
          logo: null,
        },
      ],
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      accountPhone: '',
      trialEndsAt: '',
      venues: [
        {
          name: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          postcode: '',
          tableCount: '',
          logo: null,
        },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };

      payload.venues = await Promise.all(
        formData.venues.map(async (venue) => {
          let logoPath = null;

          if (venue.logo) {
            const fileName = `${Date.now()}-${venue.logo.name}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('venue-assets')
              .upload(filePath, venue.logo);

            if (uploadError) throw uploadError;
            logoPath = filePath;
          }

          return {
            name: venue.name,
            table_count: parseInt(venue.tableCount || '0', 10),
            logo: logoPath,
            primary_color: '#000000',
            secondary_color: '#ffffff',
            address: {
              line1: venue.addressLine1,
              line2: venue.addressLine2,
              city: venue.city,
              postcode: venue.postcode,
            },
          };
        })
      );

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');

      toast.success('Master user and venues created!');
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold mb-4">Create Master User + Locations</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            name="firstName"
            required
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="lastName"
            required
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">User Phone Number</label>
          <input
            type="text"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Company Phone Number</label>
          <input
            type="text"
            name="accountPhone"
            required
            value={formData.accountPhone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Trial Ends At</label>
          <input
            type="date"
            name="trialEndsAt"
            required
            value={formData.trialEndsAt}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {formData.venues.map((venue, index) => (
          <div key={index} className="border p-4 rounded bg-white shadow-sm space-y-2">
            <h4 className="font-medium">Location {index + 1}</h4>
            <input
              type="text"
              name="name"
              required
              placeholder="Venue Name"
              value={venue.name}
              onChange={(e) => handleVenueChange(index, e)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="addressLine1"
              placeholder="Address Line 1"
              value={venue.addressLine1}
              onChange={(e) => handleVenueChange(index, e)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="addressLine2"
              placeholder="Address Line 2"
              value={venue.addressLine2}
              onChange={(e) => handleVenueChange(index, e)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={venue.city}
              onChange={(e) => handleVenueChange(index, e)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="postcode"
              placeholder="Postcode"
              value={venue.postcode}
              onChange={(e) => handleVenueChange(index, e)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              name="tableCount"
              placeholder="Table Count"
              value={venue.tableCount}
              onChange={(e) => handleVenueChange(index, e)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={(e) => handleVenueChange(index, e)}
              className="w-full"
            />
          </div>
        ))}

        <button type="button" onClick={addVenue} className="bg-gray-100 px-3 py-1 rounded text-sm">
          + Add Another Location
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}