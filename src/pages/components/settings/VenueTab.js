import React from 'react';

const VenueTab = ({ 
  name, setName,
  tableCount, setTableCount,
  address, setAddress,
  tripadvisorLink, setTripadvisorLink,
  googleReviewLink, setGoogleReviewLink,
  saveSettings,
  loading,
  message 
}) => {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Venue Settings</h2>
        <p className="text-gray-600 text-sm">Manage your venue information and settings.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Table Count</label>
          <input
            type="number"
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Address Line 1"
              value={address.line1}
              onChange={(e) => setAddress({...address, line1: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={address.line2}
              onChange={(e) => setAddress({...address, line2: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Review Links</label>
          <div className="space-y-3">
            <input
              type="url"
              placeholder="Tripadvisor Link"
              value={tripadvisorLink}
              onChange={(e) => setTripadvisorLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="Google Review Link"
              value={googleReviewLink}
              onChange={(e) => setGoogleReviewLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {message && (
          <p className={`text-sm mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default VenueTab;