import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Template1 from '../components/QRTemplates/Template1';
import Template2 from '../components/QRTemplates/Template2';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

const QRTemplates = () => {
  usePageTitle('QR Templates');
  const { venueId } = useVenue();

  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const [secondaryColor, setSecondaryColor] = useState('#52c41a');
  const [feedbackUrl, setFeedbackUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    const fetchBrandingData = async () => {
      try {
        const { data: venueData, error } = await supabase
          .from('venues')
          .select('logo, primary_color, secondary_color')
          .eq('id', venueId)
          .single();

        if (error) throw error;

        setLogo(venueData.logo || null);
        setPrimaryColor(venueData.primary_color || '#1890ff');
        setSecondaryColor(venueData.secondary_color || '#52c41a');
        setFeedbackUrl(`https://my.getchatters.com/feedback/${venueId}`);
      } catch (error) {
        console.error('Error fetching branding data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandingData();
  }, [venueId]);

  if (loading) return <p>Loading...</p>;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">QR Code Templates</h1>

      {/* Template 1 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Template 1</h2>
        <Template1
          logo={logo}
          feedbackUrl={feedbackUrl}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </div>

      {/* Template 2 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Template 2</h2>
        <Template2
          logo={logo}
          feedbackUrl={feedbackUrl}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </div>
    </PageContainer>
  );
};

export default QRTemplates;