import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminCreateUser = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!user) return;
    if (!user.email.endsWith('@getchatters.com')) {
      navigate('/'); // or 404 or redirect elsewhere
    }
  }, [user]);

  const handleSubmit = async () => {
    setStatus('Creating...');
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();
    if (res.ok) {
      setStatus('✅ User created and invite sent!');
      setEmail('');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create New User</h1>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="newuser@example.com"
        className="border px-3 py-2 rounded w-full max-w-md mb-2"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create User
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
};

export default AdminCreateUser;
