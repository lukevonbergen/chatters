import { useSessionContext } from '@supabase/auth-helpers-react';
import DashboardPage from './Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import DashboardFrame from './DashboardFrame';
import AdminFrame from './admin/AdminFrame';

export default function RootRedirector() {
  const { session, isLoading } = useSessionContext(); // this waits for auth to fully load
  const user = session?.user;

  if (isLoading) return <div className="p-4">Loading...</div>;

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
