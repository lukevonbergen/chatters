import React from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import IntegrationsTab from '../../components/dashboard/settings/IntegrationsTab';

const IntegrationsSettingsPage = () => {
  usePageTitle('Integrations');
  const { venueId } = useVenue();

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Integrations"
        subtitle="Connect external platforms to enhance your venue's online presence"
      >
        <IntegrationsTab />
      </ChartCard>
    </div>
  );
};

export default IntegrationsSettingsPage;