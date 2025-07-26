import { useUser } from '@supabase/auth-helpers-react';
import { useSession } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import DashboardPage from './Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import DashboardFrame from './DashboardFrame';
import AdminFrame from './admin/AdminFrame';

export default function RootRedirector() {
const session = useSession();
const user = session?.user;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user !== undefined) setReady(true);
  }, [user]);

  if (!ready) return <div className="p-4">Loading...</div>;

  const isAdmin = user?.email?.endsWith('@getchatters.com');

  console.log('Current user:', user?.email);
    console.log('Is admin:', isAdmin);

  return isAdmin ? (
    <AdminFrame>
      <AdminDashboard />
    </AdminFrame>
  ) : (
    <DashboardFrame>
      <DashboardPage />
    </DashboardFrame>
  );
}
