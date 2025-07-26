import { useUser } from '@supabase/auth-helpers-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) return; // still loading
    if (!user?.email?.endsWith('@getchatters.com')) {
      navigate('/'); // redirect if not a Chatters admin
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6">🛠️ Chatters Admin Dashboard</h1>

        <div className="space-y-4">
          <Link
            to="/admin/create-user"
            className="block border p-4 rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-lg font-medium">➕ Create New User</h2>
            <p className="text-sm text-gray-600">Manually onboard a new venue and send an invite email.</p>
          </Link>

          {/* Future admin tools can go here */}
          {/* <Link to="/admin/impersonate" className="...">Impersonate User</Link> */}
        </div>
      </div>
    </div>
  );
}
