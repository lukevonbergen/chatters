import React from 'react';
import UpdatedDashboardFrame from '../../components/dashboard/layout/UpdatedDashboardFrame';

const TestDashboardPage = () => {
  return (
    <UpdatedDashboardFrame>
      <div style={{ fontFamily: 'Geist, sans-serif' }}>
        <h1 className="text-2xl font-bold">This is a test dashboard page.</h1>
        <p className="mt-4 text-muted-foreground">
          This page uses the Geist font for testing only.
        </p>
      </div>
    </UpdatedDashboardFrame>
  );
};

export default TestDashboardPage;
