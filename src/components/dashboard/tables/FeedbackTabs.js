import React from 'react';

const FeedbackTabs = ({ activeTab, setActiveTab, feedback }) => {
  const unactionedCount = feedback.filter((fb) => !fb.is_actioned).length;
  const actionedCount = feedback.filter((fb) => fb.is_actioned).length;

  return (
    <div className="flex space-x-4">
      <button
        onClick={() => setActiveTab('unactioned')}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === 'unactioned'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Unactioned ({unactionedCount})
      </button>
      <button
        onClick={() => setActiveTab('actioned')}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === 'actioned'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Actioned ({actionedCount})
      </button>
    </div>
  );
};

export default FeedbackTabs;