export default function RootRedirector() {
  const { session, isLoading } = useSessionContext();
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.user) {
        setLoadingRole(false);
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!error) setRole(data?.role || null);
      setLoadingRole(false);
    };
    fetchRole();
  }, [session?.user]);

  if (isLoading || loadingRole) {
    return <div className="p-4">Loading...</div>;
  }

  if (role === 'admin') {
    return (
      <AdminFrame>
        <AdminDashboard />
      </AdminFrame>
    );
  }

  return (
    <DashboardFrame>
      <DashboardPage />
    </DashboardFrame>
  );
}
