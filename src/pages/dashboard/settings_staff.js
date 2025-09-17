import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';

// Import tab components
import ManagersTab from '../../components/dashboard/staff/ManagersTab';
import EmployeesTab from '../../components/dashboard/staff/EmployeesTab';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId, userRole, allVenues, loading: venueLoading } = useVenue();

  const [activeTab, setActiveTab] = useState(userRole === 'master' ? 'Managers' : 'Employees');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navItems = [
    ...(userRole === 'master' ? [
      { id: 'Managers', label: 'Managers' }
    ] : []),
    { id: 'Employees', label: 'Employees' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (venueLoading) return;
    if (userRole === 'master' && (!allVenues || allVenues.length === 0)) return;
    if (userRole !== 'master' && !venueId) return;
    fetchStaffData();
  }, [venueId, userRole, allVenues, venueLoading]);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) return;

      const { data: userData } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', userId)
        .single();

      if (!userData?.account_id) return;

      if (userRole === 'master') {
        await fetchAllStaffForAccount(userData.account_id);
      } else {
        await fetchStaffForManager(userId);
      }
    } catch (error) {
      setMessage('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStaffForAccount = async () => {
    if (!allVenues || allVenues.length === 0) {
      setManagers([]);
      setEmployees([]);
      return;
    }

    const venueIds = allVenues.map(v => v.id);

    // First get staff data
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select(`
        id,
        user_id,
        venue_id,
        role,
        created_at
      `)
      .in('venue_id', venueIds);

    if (staffError || !staffData) {
      return;
    }

    // Get user IDs to fetch user data
    const userIds = [...new Set(staffData.map(s => s.user_id))];
    
    // Get user data separately (including auth status)
    const userPromises = userIds.map(async (userId) => {
      const { data } = await supabase
        .from('users')
        .select('id, email, role, first_name, last_name, password_hash, created_at')
        .eq('id', userId)
        .single();
      
      // Note: We now use password_hash field from users table instead of auth admin API
      // This is more reliable and faster than making auth admin calls
      return data;
    });
    
    const userResults = await Promise.all(userPromises);
    const usersData = userResults.filter(user => user !== null);

    // Get venue data separately  
    const { data: venuesData } = await supabase
      .from('venues')
      .select('id, name')
      .in('id', venueIds);

    // Manually join the data
    const staffWithJoins = staffData.map(staff => {
      const foundUser = usersData?.find(u => u.id === staff.user_id);
      const foundVenue = venuesData?.find(v => v.id === staff.venue_id);
      
      return {
        ...staff,
        users: foundUser || null,
        venues: foundVenue || null
      };
    });

    const { data: employeesData } = await supabase
      .from('employees')
      .select(`
        id,
        venue_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at,
        venues (id, name)
      `)
      .in('venue_id', venueIds);

    const managersData = staffWithJoins?.filter(staff => staff.role === 'manager') || [];
    const employeesFromTable = employeesData || [];

    setManagers(managersData);
    setEmployees(employeesFromTable);
  };

  const fetchStaffForManager = async (userId) => {
    const { data: staffData } = await supabase
      .from('staff')
      .select(`
        id,
        user_id,
        venue_id,
        role,
        created_at,
        venues!inner (id, name),
        users!inner (id, email, role, first_name, last_name)
      `)
      .eq('venue_id', venueId)
      .neq('user_id', userId);

    const { data: employeesData } = await supabase
      .from('employees')
      .select(`
        id,
        venue_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at,
        venues (id, name)
      `)
      .eq('venue_id', venueId);

    const managersData = staffData?.filter(staff => staff.role === 'manager') || [];
    const employeesFromTable = employeesData || [];

    setManagers(managersData);
    setEmployees(employeesFromTable);
  };

  const addManager = async () => {
    setLoading(true);
    try {
      await fetchStaffData();
      setMessage('Manager added successfully!');
    } catch {
      setMessage('Failed to add manager');
    } finally {
      setLoading(false);
    }
  };

  const updateManagerVenues = async () => {
    setLoading(true);
    try {
      await fetchStaffData();
      setMessage('Manager venues updated successfully!');
    } catch {
      setMessage('Failed to update manager venues');
    } finally {
      setLoading(false);
    }
  };

  const tabProps = {
    managers,
    employees,
    allVenues,
    venueId,
    userRole,
    addManager,
    updateManagerVenues,
    fetchStaffData,
    loading,
    message,
    setMessage,
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Managers':
        return <ManagersTab {...tabProps} />;
      case 'Employees':
        return <EmployeesTab {...tabProps} />;
      default:
        return userRole === 'master'
          ? <ManagersTab {...tabProps} />
          : <EmployeesTab {...tabProps} />;
    }
  };

  if (venueLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <span className="text-gray-500 text-sm lg:text-base">Loading venues...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Staff Management</h1>
        <p className="text-gray-600 text-sm lg:text-base">Manage your team members and their venue access.</p>
      </div>

      {/* Mobile Tab Selector */}
      <div className="lg:hidden mb-6">
        <div className="relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="block truncate">
              {navItems.find(item => item.id === activeTab)?.label || 'Select Tab'}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>

          {isMobileMenuOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    activeTab === item.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-500 text-sm lg:text-base">Loading staff data...</span>
            </div>
          )}
          {!loading && renderActiveTab()}

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('success')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default StaffPage;
