import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

// Import tab components
import ManagersTab from './components/staff/ManagersTab';
import EmployeesTab from './components/staff/EmployeesTab';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId, userRole, allVenues } = useVenue();

  // State for active tab
  const [activeTab, setActiveTab] = useState(userRole === 'master' ? 'Managers' : 'Employees');

  // Staff data state
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sidebar navigation items - based on user role
  const navItems = [
    ...(userRole === 'master' ? [{ id: 'Managers', label: 'Managers' }] : []),
    { id: 'Employees', label: 'Employees' },
  ];

  // Fetch staff data
  useEffect(() => {
    console.log('🔄 StaffPage useEffect triggered - venueId:', venueId, 'userRole:', userRole);
    if (!venueId && userRole !== 'master') {
      console.log('❌ No venueId provided and not master');
      return;
    }

    fetchStaffData();
  }, [venueId, userRole]);

  const fetchStaffData = async () => {
    setLoading(true);
    console.log('🔍 Starting fetch staff data');

    try {
      // Get current user info
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) {
        console.error('❌ User not authenticated');
        return;
      }

      // Get user's account info
      const { data: userData } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', userId)
        .single();

      if (!userData?.account_id) {
        console.error('❌ No account_id found');
        return;
      }

      if (userRole === 'master') {
        // Masters: Get all staff under account
        await fetchAllStaffForAccount(userData.account_id);
      } else {
        // Managers: Get staff for their venue(s)
        await fetchStaffForManager(userId);
      }

    } catch (error) {
      console.error('❌ Error fetching staff data:', error);
      setMessage('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStaffForAccount = async (accountId) => {
    console.log('🏦 Fetching all staff for account:', accountId);

    // Get all staff under this account (via venues)
    const { data: staffData, error } = await supabase
      .from('staff')
      .select(`
        id,
        user_id,
        venue_id,
        first_name,
        last_name,
        email,
        role,
        created_at,
        venues (
          id,
          name
        ),
        users (
          id,
          email,
          role
        )
      `)
      .in('venue_id', allVenues.map(v => v.id));

    if (error) {
      console.error('❌ Error fetching staff:', error);
      return;
    }

    console.log('✅ Staff data fetched:', staffData);

    // Separate managers and employees
    const managersData = staffData?.filter(staff => staff.users?.role === 'manager') || [];
    const employeesData = staffData?.filter(staff => staff.users?.role === 'employee') || [];

    setManagers(managersData);
    setEmployees(employeesData);
  };

  const fetchStaffForManager = async (userId) => {
    console.log('👤 Fetching staff for manager:', userId);

    // Get staff for venues this manager has access to
    const { data: staffData, error } = await supabase
      .from('staff')
      .select(`
        id,
        user_id,
        venue_id,
        first_name,
        last_name,
        email,
        role,
        created_at,
        venues (
          id,
          name
        ),
        users (
          id,
          email,
          role
        )
      `)
      .eq('venue_id', venueId)
      .neq('user_id', userId); // Don't include themselves

    if (error) {
      console.error('❌ Error fetching venue staff:', error);
      return;
    }

    console.log('✅ Venue staff data fetched:', staffData);

    // Separate managers and employees
    const managersData = staffData?.filter(staff => staff.users?.role === 'manager') || [];
    const employeesData = staffData?.filter(staff => staff.users?.role === 'employee') || [];

    setManagers(managersData);
    setEmployees(employeesData);
  };

  // Add new manager (master only)
  const addManager = async (managerData) => {
    setLoading(true);
    try {
      console.log('➕ Adding new manager:', managerData);
      
      // This will be implemented when we build the add manager functionality
      await fetchStaffData(); // Refresh data
      setMessage('Manager added successfully!');
    } catch (error) {
      console.error('❌ Error adding manager:', error);
      setMessage('Failed to add manager');
    } finally {
      setLoading(false);
    }
  };

  // Update manager venue assignments (master only)
  const updateManagerVenues = async (managerId, venueIds) => {
    setLoading(true);
    try {
      console.log('🔄 Updating manager venues:', { managerId, venueIds });
      
      // This will be implemented when we build the venue assignment functionality
      await fetchStaffData(); // Refresh data
      setMessage('Manager venues updated successfully!');
    } catch (error) {
      console.error('❌ Error updating manager venues:', error);
      setMessage('Failed to update manager venues');
    } finally {
      setLoading(false);
    }
  };

  // Props to pass to tab components
  const tabProps = {
    // Data
    managers,
    employees,
    allVenues,
    venueId,
    userRole,
    
    // Actions
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
        return userRole === 'master' ? <ManagersTab {...tabProps} /> : <EmployeesTab {...tabProps} />;
    }
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Management</h1>
        <p className="text-gray-600">Manage your team members and their venue access.</p>
        {/* Debug info */}
        <p className="text-xs text-gray-400 mt-2">
          Debug: Current venueId = {venueId} | User role = {userRole}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
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
              <span className="text-gray-500">Loading staff data...</span>
            </div>
          )}
          {!loading && renderActiveTab()}
          
          {/* Message display */}
          {message && (
            <div className={`mt-4 p-3 rounded-md ${
              message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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