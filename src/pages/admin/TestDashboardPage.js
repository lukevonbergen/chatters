import React from 'react';
import UpdatedDashboardFrame from '../../components/dashboard/layout/UpdatedDashboardFrame';

const TestDashboardPage = () => {
  return (
    <UpdatedDashboardFrame>
      <div className="text-2xl font-bold">This is a test dashboard page.</div>
      <p className="mt-4 text-muted-foreground">Use this to test your new layout.</p>
    </UpdatedDashboardFrame>
  );
};

export default TestDashboardPage;
