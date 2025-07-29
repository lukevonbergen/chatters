import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

// Import tab components
import ProfileTab from './components/settings/ProfileTab';
import VenueTab from './components/settings/VenueTab';
import BrandingTab from './components/settings/BrandingTab';
import NotificationsTab from './components/settings/NotificationsTab';

const SettingsPage = () => {
  usePageTitle('Settings');
  const { venueId } = useVenue();

  // State for active tab
  const [activeTab, setActiveTab] = useState('Profile');

  // All your existing state variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const [secondaryColor, setSecondaryColor] = useState('#52c41a');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableCount, setTableCount] = useState('');
  const [tripadvisorLink, setTripadvisorLink] = useState('');
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
  });
  const [message, setMessage] = useState('');

  // Sidebar navigation items
  const navItems = [
    { id: 'Profile', label: 'Profile' },
    { id: 'Venue', label: 'Venue' },
    { id: 'Branding', label: 'Branding' },
    { id: 'Notifications', label: 'Notifications' },
  ];

  // Fetch venue data with debug logging
  useEffect(() => {
    console.log('🔄 SettingsPage useEffect triggered - venueId:', venueId);
    if (!venueId) {
      console.log('❌ No venueId provided');
      return;
    }

    const fetchVenueData = async () => {
      console.log('🔍 Starting fetch for venue:', venueId);
      
      // Get current user ID
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) {
        console.error('❌ User not authenticated');
        return;
      }

      console.log('👤 User ID:', userId);

      // Fetch venue data
      console.log('🏢 Fetching venue data for venueId:', venueId);
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('id, name, logo, primary_color, secondary_color, is_paid, table_count, address, tripadvisor_link, google_review_link')
        .eq('id', venueId)
        .single();

      if (venueError) {
        console.error('❌ Error fetching venue settings:', venueError);
        return;
      }

      console.log('✅ Venue data fetched:', venueData);

      // Fetch staff data (profile info)
      console.log('👥 Fetching staff data for userId:', userId, 'venueId:', venueId);
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('first_name, last_name, email')
        .eq('user_id', userId)
        .eq('venue_id', venueId)
        .single();

      if (staffError) {
        console.error('❌ Error fetching staff settings:', staffError);
        console.error('Staff query details:', { userId, venueId });
        return;
      }

      console.log('✅ Staff data fetched:', staffData);

      // Set venue data
      console.log('📝 Setting venue state...');
      setName(venueData.name || '');
      setLogo(venueData.logo || null);
      setPrimaryColor(venueData.primary_color || '#1890ff');
      setSecondaryColor(venueData.secondary_color || '#52c41a');
      setIsPaid(venueData.is_paid || false);
      setTableCount(venueData.table_count || '');
      setTripadvisorLink(venueData.tripadvisor_link || '');
      setGoogleReviewLink(venueData.google_review_link || '');
      setAddress(venueData.address || {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postalCode: '',
        country: '',
      });

      // Set staff data
      console.log('📝 Setting staff state...');
      setFirstName(staffData.first_name || '');
      setLastName(staffData.last_name || '');
      setEmail(staffData.email || '');

      console.log('🎉 All data loaded and state updated!');
    };

    fetchVenueData();
  }, [venueId]);

  // UPDATED SAVE SETTINGS - SAVES TO BOTH TABLES
  const saveSettings = async () => {
    if (!venueId) return;

    console.log('💾 Starting save for venue:', venueId);
    setLoading(true);
    setMessage('');

    try {
      // Get current user ID
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('💾 Saving staff data:', { firstName, lastName, email });

      // Update staff table (profile data)
      const staffUpdates = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      };

      const { error: staffError } = await supabase
        .from('staff')
        .update(staffUpdates)
        .eq('user_id', userId)
        .eq('venue_id', venueId);

      if (staffError) {
        console.error('❌ Staff save error:', staffError);
        throw staffError;
      }

      console.log('✅ Staff data saved');

      console.log('💾 Saving venue data:', { name, primaryColor, secondaryColor, tableCount });

      // Update venues table (venue data)
      const venueUpdates = {
        name,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        table_count: tableCount,
        address,
        tripadvisor_link: tripadvisorLink,
        google_review_link: googleReviewLink,
      };

      const { error: venueError } = await supabase
        .from('venues')
        .update(venueUpdates)
        .eq('id', venueId);

      if (venueError) {
        console.error('❌ Venue save error:', venueError);
        throw venueError;
      }

      console.log('✅ Venue data saved');
      setMessage('Settings updated successfully!');
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      setMessage('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Props to pass to tab components
  const tabProps = {
    // Data
    name, setName,
    email, setEmail,
    firstName, setFirstName,
    lastName, setLastName,
    logo, setLogo,
    primaryColor, setPrimaryColor,
    secondaryColor, setSecondaryColor,
    tableCount, setTableCount,
    address, setAddress,
    tripadvisorLink, setTripadvisorLink,
    googleReviewLink, setGoogleReviewLink,
    
    // Actions
    saveSettings,
    loading,
    message,
    venueId,
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileTab {...tabProps} />;
      case 'Venue':
        return <VenueTab {...tabProps} />;
      case 'Branding':
        return <BrandingTab {...tabProps} />;
      case 'Notifications':
        return <NotificationsTab {...tabProps} />;
      default:
        return <ProfileTab {...tabProps} />;
    }
  };

  if (!venueId) {
    console.log('⚠️ SettingsPage: No venueId, not rendering');
    return null;
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Some form of blurb text here.</p>
        {/* Debug info */}
        <p className="text-xs text-gray-400 mt-2">
          Debug: Current venueId = {venueId}
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
          {renderActiveTab()}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;