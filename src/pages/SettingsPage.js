import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

// Import tab components
import ProfileTab from './components/settings/ProfileTab';
import VenueTab from './components/settings/VenueTab';
import BrandingTab from './components/settings/BrandingTab';
import BillingTab from './components/settings/BillingTab';
import NotificationsTab from './components/settings/NotificationsTab';

const SettingsPage = () => {
  usePageTitle('Settings');
  const { venueId, userRole } = useVenue();

  // State for active tab
  const [activeTab, setActiveTab] = useState('Profile');
  // Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // All your existing state variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const [secondaryColor, setSecondaryColor] = useState('#52c41a');
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

  // Sidebar navigation items - conditionally include Billing for master users
  const navItems = [
    { id: 'Profile', label: 'Profile' },
    { id: 'Venue', label: 'Venue' },
    { id: 'Branding', label: 'Branding' },
    ...(userRole === 'master' ? [{ id: 'Billing', label: 'Billing' }] : []),
    { id: 'Notifications', label: 'Notifications' },
  ];

  // Close mobile menu when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Fetch venue data
  useEffect(() => {
    if (!venueId) {
      return;
    }

    const fetchVenueData = async () => {
      // Get current user ID
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) {
        console.error('User not authenticated');
        return;
      }

      // Fetch venue data
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('id, name, logo, primary_color, secondary_color, table_count, address, tripadvisor_link, google_review_link')
        .eq('id', venueId)
        .single();

      if (venueError) {
        console.error('Error fetching venue settings:', venueError);
        return;
      }

      // Fetch staff data (profile info)
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('first_name, last_name, email')
        .eq('user_id', userId)
        .eq('venue_id', venueId)
        .maybeSingle();

      if (staffError) {
        console.error('Error fetching staff settings:', staffError);
        return;
      }

      // Set venue data
      setName(venueData.name || '');
      setLogo(venueData.logo || null);
      setPrimaryColor(venueData.primary_color || '#1890ff');
      setSecondaryColor(venueData.secondary_color || '#52c41a');
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

      // Set staff data (handle missing staff records)
      if (staffData) {
        setFirstName(staffData.first_name || '');
        setLastName(staffData.last_name || '');
        setEmail(staffData.email || '');
      } else {
        setFirstName('');
        setLastName('');
        setEmail('');
      }
    };

    fetchVenueData();
  }, [venueId]);

  // Save settings - saves to both tables
  const saveSettings = async () => {
    if (!venueId) return;

    setLoading(true);
    setMessage('');

    try {
      // Get current user ID and email
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      const userEmail = auth?.user?.email;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Update staff table (profile data)
      const staffUpdates = {
        first_name: firstName,
        last_name: lastName,
        email: userEmail,
      };

      const { error: staffError } = await supabase
        .from('staff')
        .update(staffUpdates)
        .eq('user_id', userId)
        .eq('venue_id', venueId);

      if (staffError) {
        throw staffError;
      }

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
        throw venueError;
      }

      setMessage('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
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
    userRole,
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileTab {...tabProps} />;
      case 'Venue':
        return <VenueTab {...tabProps} />;
      case 'Branding':
        return <BrandingTab {...tabProps} />;
      case 'Billing':
        return <BillingTab />;
      case 'Notifications':
        return <NotificationsTab {...tabProps} />;
      default:
        return <ProfileTab {...tabProps} />;
    }
  };

  if (!venueId) {
    return null;
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 text-sm lg:text-base">Manage your account and venue settings.</p>
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
          {renderActiveTab()}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;