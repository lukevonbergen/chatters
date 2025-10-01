import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import VenueTab from '../../components/dashboard/settings/VenueTab';

const VenueSettingsPage = () => {
  usePageTitle('Venue Settings');
  const { venueId, userRole } = useVenue();

  // All state variables for VenueTab
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
  });
  const [message, setMessage] = useState('');

  // Fetch venue data
  useEffect(() => {
    if (!venueId) {
      return;
    }

    const fetchVenueData = async () => {
      // Fetch venue data
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('id, name, address, phone, website')
        .eq('id', venueId)
        .single();

      if (venueError) {
        console.error('Error fetching venue settings:', venueError);
        return;
      }

      // Set venue data
      setName(venueData.name || '');
      setPhone(venueData.phone || '');
      setWebsite(venueData.website || '');
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

  // Save settings
  const saveSettings = async () => {
    if (!venueId) return;

    setLoading(true);
    setMessage('');

    try {
      // Update venues table
      const venueUpdates = {
        name,
        address,
        phone,
        website,
      };

      const { error: venueError } = await supabase
        .from('venues')
        .update(venueUpdates)
        .eq('id', venueId);

      if (venueError) {
        throw venueError;
      }

      setMessage('Venue settings updated successfully!');
    } catch (error) {
      console.error('Error updating venue settings:', error);
      const errorDetails = error.code ? `Error ${error.code}: ${error.message}` : error.message;
      setMessage(`Failed to update venue settings: ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };


  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Venue Settings"
        subtitle="Configure your venue information and location details"
      >
        <VenueTab
          name={name}
          setName={setName}
          address={address}
          setAddress={setAddress}
          phone={phone}
          setPhone={setPhone}
          website={website}
          setWebsite={setWebsite}
          saveSettings={saveSettings}
          loading={loading}
          message={message}
          userRole={userRole}
          currentVenueId={venueId}
        />
      </ChartCard>
    </div>
  );
};

export default VenueSettingsPage;