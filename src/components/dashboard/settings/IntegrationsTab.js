import React from 'react';
import UnifiedReviewsCard from './UnifiedReviewsCard';

const IntegrationsTab = () => {
  return (
    <div className="max-w-none lg:max-w-4xl">

      <div className="space-y-6">
        {/* Review Platform Integration */}
        <UnifiedReviewsCard />
      </div>
    </div>
  );
};

export default IntegrationsTab;