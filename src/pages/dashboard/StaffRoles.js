import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import RoleManagement from '../../components/dashboard/staff/RoleManagement';

const StaffRolesPage = () => {
  usePageTitle('Staff Roles');
  const { venueId } = useVenue();

  const handleRoleUpdate = () => {
    // Refresh callback if needed
  };

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Staff Roles"
        subtitle="Manage roles and permissions for your team"
      >
        <RoleManagement 
          venueId={venueId} 
          onRoleUpdate={handleRoleUpdate} 
        />
      </ChartCard>
    </div>
  );
};

export default StaffRolesPage;