import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import ManagersTab from '../../components/dashboard/staff/ManagersTab';

const StaffManagersPage = () => {
  usePageTitle('Managers');
  const { venueId, userRole, allVenues, loading: venueLoading } = useVenue();

  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

    const userIds = [...new Set(staffData.map(s => s.user_id))];
    
    const userPromises = userIds.map(async (userId) => {
      const { data } = await supabase
        .from('users')
        .select('id, email, role, first_name, last_name, password_hash, created_at')
        .eq('id', userId)
        .is('deleted_at', null)  // Only fetch non-deleted users
        .single();

      return data;
    });
    
    const userResults = await Promise.all(userPromises);
    const usersData = userResults.filter(user => user !== null);

    const { data: venuesData } = await supabase
      .from('venues')
      .select('id, name')
      .in('id', venueIds);

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

  if (venueLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <span className="text-gray-500 text-sm lg:text-base">Loading venues...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Manager Management"
        subtitle="Manage manager accounts and venue access permissions"
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="text-gray-500 text-sm lg:text-base">Loading staff data...</span>
          </div>
        )}
        
        {!loading && <ManagersTab {...tabProps} />}

        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.includes('success')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </ChartCard>
    </div>
  );
};

export default StaffManagersPage;