import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

// Import tab components
import ManagersTab from './components/staff/ManagersTab';
import EmployeesTab from './components/staff/EmployeesTab';
import InvitesTab from './components/staff/InvitesTab';

const StaffPage = () => {
  usePageTitle('Staff');
  const { venueId, userRole, allVenues } = useVenue();

  // State for active tab
  const [activeTab, setActiveTab] = useState(userRole === 'master' ? 'Managers' : 'Employees');
  // Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Staff data state
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navItems = [
    ...(userRole === 'master' ? [
      { id: 'Managers', label: 'Managers' },
      { id: 'Invites', label: 'Invites' }
    ] : []),
    { id: 'Employees', label: 'Employees' },
  ];

  // Close mobile menu when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Fetch staff data
  useEffect(() => {
    if (!venueId && userRole !== 'master') {
      return;
    }

    fetchStaffData();
  }, [venueId, userRole]);

  const fetchStaffData = async () => {
    setLoading(true);

    try {
      // Get current user info
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) {
        return;
      }

      // Get user's account info
      const { data: userData } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', userId)
        .single();

      if (!userData?.account_id) {
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
      setMessage('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStaffForAccount = async (accountId) => {
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
      return;
    }

    // Separate managers and employees
    const managersData = staffData?.filter(staff => staff.users?.role === 'manager') || [];
    const employeesData = staffData?.filter(staff => staff.users?.role === 'employee') || [];

    setManagers(managersData);
    setEmployees(employeesData);
  };

  const fetchStaffForManager = async (userId) => {
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
      return;
    }

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
      // This will be implemented when we build the add manager functionality
      await fetchStaffData(); // Refresh data
      setMessage('Manager added successfully!');
    } catch (error) {
      setMessage('Failed to add manager');
    } finally {
      setLoading(false);
    }
  };

  // Update manager venue assignments (master only)
  const updateManagerVenues = async (managerId, venueIds) => {
    setLoading(true);
    try {
      // This will be implemented when we build the venue assignment functionality
      await fetchStaffData(); // Refresh data
      setMessage('Manager venues updated successfully!');
    } catch (error) {
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
      case 'Invites':                           
        return <InvitesTab {...tabProps} />;           
      case 'Employees':
        return <EmployeesTab {...tabProps} />;
      default:
        return userRole === 'master' ? <ManagersTab {...tabProps} /> : <EmployeesTab {...tabProps} />;
    }
  };

  return (
    <PageContainer>
      {/* Header */}
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

      {/* Desktop Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Desktop Sidebar - Hidden on mobile */}
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
          
          {/* Message display */}
          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
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