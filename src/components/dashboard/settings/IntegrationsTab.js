import React from 'react';
import UnifiedReviewsCard from './UnifiedReviewsCard';

const IntegrationsTab = () => {
  return (
    <div className="max-w-none lg:max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Integrations</h2>
        <p className="text-gray-600 text-sm">Connect external platforms to enhance your venue's online presence and review management.</p>
      </div>

      <div className="space-y-6">
        {/* Review Platform Integration */}
        <UnifiedReviewsCard />
      </div>
    </div>
  );
};

export default IntegrationsTab;