import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import DashboardPage from './Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import DashboardFrame from './DashboardFrame';

export default function RootRedirector() {
  const user = useUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user !== undefined) setReady(true);
  }, [user]);

  if (!ready) return <div className="p-4">Loading...</div>;

  const isAdmin = user?.email?.endsWith('@getchatters.com');

  return isAdmin ? (
    <DashboardFrame>
      <AdminDashboard />
    </DashboardFrame>
  ) : (
    <DashboardFrame>
      <DashboardPage />
    </DashboardFrame>
  );
}
