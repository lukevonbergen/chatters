import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import AccountSettings from '../components/settings/AccountSettings';
import VenueSettings from '../components/settings/VenueSettings';
import BrandingSettings from '../components/settings/BrandingSettings';
import SubscriptionStatus from '../components/settings/SubscriptionStatus';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

const SettingsPage = () => {
  usePageTitle('Settings');
  const { venueId } = useVenue();

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
  const [isAccountLocked, setIsAccountLocked] = useState(true);
  const [isVenueLocked, setIsVenueLocked] = useState(true);
  const [isBrandingLocked, setIsBrandingLocked] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchVenueData = async () => {
      const { data: venueData, error } = await supabase
        .from('venues')
        .select('id, name, email, first_name, last_name, logo, primary_color, secondary_color, is_paid, table_count, address, tripadvisor_link, google_review_link')
        .eq('id', venueId)
        .single();

      if (error) {
        console.error('Error fetching venue settings:', error);
        return;
      }

      setName(venueData.name || '');
      setEmail(venueData.email || '');
      setFirstName(venueData.first_name || '');
      setLastName(venueData.last_name || '');
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
    };

    fetchVenueData();
  }, [venueId]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !venueId) return;

    setLoading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${venueId}-logo.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: deleteError } = await supabase.storage
      .from('venue-logos')
      .remove([filePath]);

    if (deleteError && deleteError.message !== 'The resource was not found') {
      console.error('Error deleting existing logo:', deleteError);
      setLoading(false);
      return;
    }

    const { error: uploadError } = await supabase.storage
      .from('venue-logos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('venue-logos')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('venues')
      .update({ logo: publicUrl })
      .eq('id', venueId);

    if (updateError) {
      console.error('Error updating logo:', updateError);
    } else {
      setLogo(publicUrl);
    }

    setLoading(false);
  };

  const handleColorChange = (type, color) => {
    if (type === 'primary') setPrimaryColor(color);
    if (type === 'secondary') setSecondaryColor(color);
  };

  const saveAllSettings = async () => {
    if (!venueId) return;

    setLoading(true);
    setMessage('');

    try {
      const updates = {
        name,
        email,
        first_name: firstName,
        last_name: lastName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        table_count: tableCount,
        address,
        tripadvisor_link: tripadvisorLink,
        google_review_link: googleReviewLink,
      };

      await supabase.from('venues').update(updates).eq('id', venueId);

      setMessage('Settings updated successfully!');
      setIsAccountLocked(true);
      setIsVenueLocked(true);
      setIsBrandingLocked(true);
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!venueId) return null;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <AccountSettings
        name={name}
        email={email}
        firstName={firstName}
        lastName={lastName}
        onNameChange={(e) => setName(e.target.value)}
        onEmailChange={(e) => setEmail(e.target.value)}
        onFirstNameChange={(e) => setFirstName(e.target.value)}
        onLastNameChange={(e) => setLastName(e.target.value)}
        locked={isAccountLocked}
        onLockToggle={() => setIsAccountLocked(!isAccountLocked)}
      />

      <SubscriptionStatus
        isPaid={isPaid}
        onUpgrade={() => window.location.href = '/settings/billing'}
      />

      <VenueSettings
        name={name}
        tableCount={tableCount}
        address={address}
        onNameChange={(e) => setName(e.target.value)}
        onTableCountChange={(e) => setTableCount(e.target.value)}
        onAddressChange={setAddress}
        loading={loading}
        locked={isVenueLocked}
        onLockToggle={() => setIsVenueLocked(!isVenueLocked)}
      />

      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tripadvisor Link</label>
            <input
              type="url"
              value={tripadvisorLink}
              onChange={(e) => setTripadvisorLink(e.target.value)}
              placeholder="https://www.tripadvisor.com/yourpage"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Review Link</label>
            <input
              type="url"
              value={googleReviewLink}
              onChange={(e) => setGoogleReviewLink(e.target.value)}
              placeholder="https://g.page/yourbusiness"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
        </div>
      </div>

      <BrandingSettings
        logo={logo}
        onLogoUpload={handleLogoUpload}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onColorChange={handleColorChange}
        loading={loading}
        locked={isBrandingLocked}
        onLockToggle={() => setIsBrandingLocked(!isBrandingLocked)}
      />

      <div className="mt-8">
        <button
          onClick={saveAllSettings}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {message && <p className="text-sm text-red-500 mt-2">{message}</p>}
      </div>
    </PageContainer>
  );
};

export default SettingsPage;