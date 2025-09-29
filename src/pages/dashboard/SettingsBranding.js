import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import BrandingTab from '../../components/dashboard/settings/BrandingTab';

const SettingsBrandingPage = () => {
  usePageTitle('Branding Settings');
  const { venueId } = useVenue();

  // State variables for BrandingTab
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const [secondaryColor, setSecondaryColor] = useState('#52c41a');

  // Fetch venue branding data
  useEffect(() => {
    if (!venueId) {
      return;
    }

    const fetchBrandingData = async () => {
      // Fetch venue branding data
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('logo, primary_color, secondary_color')
        .eq('id', venueId)
        .single();

      if (venueError) {
        console.error('Error fetching branding settings:', venueError);
        return;
      }

      // Set branding data
      setLogo(venueData.logo || null);
      setPrimaryColor(venueData.primary_color || '#1890ff');
      setSecondaryColor(venueData.secondary_color || '#52c41a');
    };

    fetchBrandingData();
  }, [venueId]);

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Branding Settings"
        subtitle="Customize the look and feel of your feedback forms and QR codes"
      >
        <BrandingTab
          logo={logo}
          setLogo={setLogo}
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
          venueId={venueId}
        />
      </ChartCard>
    </div>
  );
};

export default SettingsBrandingPage;