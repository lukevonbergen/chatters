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
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#111827');
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');

  // Assistance message customization
  const [assistanceTitle, setAssistanceTitle] = useState('Help is on the way!');
  const [assistanceMessage, setAssistanceMessage] = useState('We\'ve notified our team that you need assistance. Someone will be with you shortly.');
  const [assistanceIcon, setAssistanceIcon] = useState('hand-heart');

  // Thank you message customization
  const [thankYouTitle, setThankYouTitle] = useState('Thanks for your feedback!');
  const [thankYouMessage, setThankYouMessage] = useState('Your response has been submitted successfully.');
  const [thankYouIcon, setThankYouIcon] = useState('check-circle');

  // Fetch venue branding data
  useEffect(() => {
    if (!venueId) {
      return;
    }

    const fetchBrandingData = async () => {
      // Fetch venue branding data
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('logo, primary_color, background_color, text_color, button_text_color, assistance_title, assistance_message, assistance_icon, thank_you_title, thank_you_message, thank_you_icon')
        .eq('id', venueId)
        .single();

      if (venueError) {
        console.error('Error fetching branding settings:', venueError);
        return;
      }

      // Set branding data
      setLogo(venueData.logo || null);
      setPrimaryColor(venueData.primary_color || '#1890ff');
      setBackgroundColor(venueData.background_color || '#ffffff');
      setTextColor(venueData.text_color || '#111827');
      setButtonTextColor(venueData.button_text_color || '#ffffff');

      // Set assistance message data
      setAssistanceTitle(venueData.assistance_title || 'Help is on the way!');
      setAssistanceMessage(venueData.assistance_message || 'We\'ve notified our team that you need assistance. Someone will be with you shortly.');
      setAssistanceIcon(venueData.assistance_icon || 'hand-heart');

      // Set thank you message data
      setThankYouTitle(venueData.thank_you_title || 'Thanks for your feedback!');
      setThankYouMessage(venueData.thank_you_message || 'Your response has been submitted successfully.');
      setThankYouIcon(venueData.thank_you_icon || 'check-circle');
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
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          textColor={textColor}
          setTextColor={setTextColor}
          buttonTextColor={buttonTextColor}
          setButtonTextColor={setButtonTextColor}
          assistanceTitle={assistanceTitle}
          setAssistanceTitle={setAssistanceTitle}
          assistanceMessage={assistanceMessage}
          setAssistanceMessage={setAssistanceMessage}
          assistanceIcon={assistanceIcon}
          setAssistanceIcon={setAssistanceIcon}
          thankYouTitle={thankYouTitle}
          setThankYouTitle={setThankYouTitle}
          thankYouMessage={thankYouMessage}
          setThankYouMessage={setThankYouMessage}
          thankYouIcon={thankYouIcon}
          setThankYouIcon={setThankYouIcon}
          venueId={venueId}
        />
      </ChartCard>
    </div>
  );
};

export default SettingsBrandingPage;