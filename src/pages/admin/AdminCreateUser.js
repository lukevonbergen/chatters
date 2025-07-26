import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';

export default function AdminCreateUser() {
  const user = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!user.email.endsWith('@getchatters.com')) {
      navigate('/'); // or custom 403 page
    }
  }, [user]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setStatus('');

  try {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        venueName,
        trialEndsAt,
      }),
    });

    let result;
    try {
      result = await res.json();
    } catch {
      throw new Error('A server error occurred. Please try again.');
    }

    if (!res.ok) throw new Error(result.error || 'Unknown error');

    setStatus('✅ User created and invite sent.');
    setEmail('');
    setFirstName('');
    setLastName('');
    setVenueName('');
  } catch (err) {
    setStatus(`❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow space-y-6">
      <h2 className="text-xl font-semibold">Admin: Create New Venue User</h2>

      {status && <div className="text-sm text-gray-700">{status}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">User Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trial End Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={trialEndsAt}
            onChange={(e) => setTrialEndsAt(e.target.value)}
          />
          <small className="text-xs text-gray-500">Defaults to 14 days from today</small>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}
