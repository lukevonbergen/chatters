// RootRedirector.tsx
import { useEffect, useMemo, useState } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import DashboardPage from './Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import DashboardFrame from './DashboardFrame';
import AdminFrame from './admin/AdminFrame';
import { supabase } from '../utils/supabase';

export default function RootRedirector() {
  const { session, isLoading } = useSessionContext();
  const user = session?.user;
  const [role, setRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch role from your public users table
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!error) setRole(data?.role ?? null);
      setProfileLoading(false);
    };
    load();
  }, [user?.id]);

  if (isLoading || profileLoading) return <div className="p-4">Loading...</div>;

  const email = (user?.email ?? '').toLowerCase();
  const isAdminByDomain = email.endsWith('@getchatters.com');
  const isAdminByRole = role === 'admin';
  const isAdmin = isAdminByRole || isAdminByDomain;

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
