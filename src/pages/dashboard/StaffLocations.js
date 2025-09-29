import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import LocationManagement from '../../components/dashboard/staff/LocationManagement';

const StaffLocationsPage = () => {
  usePageTitle('Staff Locations');
  const { venueId } = useVenue();

  const handleLocationUpdate = () => {
    // Refresh callback if needed
  };

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Staff Locations"
        subtitle="Manage location assignments for your team"
      >
        <LocationManagement 
          venueId={venueId} 
          onLocationUpdate={handleLocationUpdate} 
        />
      </ChartCard>
    </div>
  );
};

export default StaffLocationsPage;