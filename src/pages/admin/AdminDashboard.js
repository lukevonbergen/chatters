// =========================
// /pages/admin/AdminDashboard.jsx
// =========================

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    trialEndsAt: '',
    venues: [{ name: '', email: '' }],
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVenueChange = (index, field, value) => {
    const newVenues = [...formData.venues];
    newVenues[index][field] = value;
    setFormData((prev) => ({ ...prev, venues: newVenues }));
  };

  const addVenue = () => {
    setFormData((prev) => ({
      ...prev,
      venues: [...prev.venues, { name: '', email: '' }],
    }));
  };

  const removeVenue = (index) => {
    const newVenues = formData.venues.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, venues: newVenues }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');

      toast.success('User and venues created!');
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        trialEndsAt: '',
        venues: [{ name: '', email: '' }],
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
      <p className="text-gray-600 mb-8">Create a master user and one or more venues under them.</p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              required
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              required
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Master Account Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            required
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Trial Ends At</label>
          <input
            type="date"
            name="trialEndsAt"
            value={formData.trialEndsAt}
            required
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2">Venues</h3>
          {formData.venues.map((venue, i) => (
            <div key={i} className="border rounded p-4 mb-4 space-y-2 bg-gray-50">
              <input
                type="text"
                placeholder="Venue Name"
                value={venue.name}
                required
                onChange={(e) => handleVenueChange(i, 'name', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Venue Email"
                value={venue.email}
                required
                onChange={(e) => handleVenueChange(i, 'email', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {formData.venues.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVenue(i)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addVenue} className="text-blue-600 text-sm">
            + Add Another Venue
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Creating...' : 'Create Master + Venues'}
        </button>
      </form>
    </>
  );
}