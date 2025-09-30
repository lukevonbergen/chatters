import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import ProfileTab from '../../components/dashboard/settings/ProfileTab';

const AccountProfilePage = () => {
  usePageTitle('Account Profile');
  const { venueId } = useVenue();
  
  // State variables for ProfileTab
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return;

        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', auth.user.id)
          .single();

        if (userData) {
          setFirstName(userData.first_name || '');
          setLastName(userData.last_name || '');
          setEmail(userData.email || auth.user.email || '');
        } else {
          // Fallback to auth data
          setFirstName('');
          setLastName('');
          setEmail(auth.user.email || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      <ChartCard
        title="Account Profile"
        subtitle="Manage your personal information and account settings"
      >
        <ProfileTab
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          venueId={venueId}
        />
      </ChartCard>
    </div>
  );
};

export default AccountProfilePage;