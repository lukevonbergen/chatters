import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const LiveUpdatesToggle = ({ liveUpdatesEnabled, toggleLiveUpdates }) => (
  <div className="flex items-center space-x-4">
    <span className="text-sm text-gray-500">Live Updates</span>
    <button
      onClick={toggleLiveUpdates}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        liveUpdatesEnabled ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
      }`}
    >
      {liveUpdatesEnabled ? (
        <ToggleRight className="w-6 h-6 text-green-600" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-red-600" />
      )}
    </button>
  </div>
);

export default LiveUpdatesToggle;