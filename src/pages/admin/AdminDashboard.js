import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    venueName: '',
    trialEndsAt: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

      toast.success('User created and invite sent!');
      setFormData({ email: '', firstName: '', lastName: '', venueName: '', trialEndsAt: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
      <p className="text-gray-600 mb-8">Use this form to create new customer accounts.</p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            required
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
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
          <div className="flex-1">
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
          <label className="block text-sm font-medium">Venue Name</label>
          <input
            type="text"
            name="venueName"
            value={formData.venueName}
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
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </>
  );
}
