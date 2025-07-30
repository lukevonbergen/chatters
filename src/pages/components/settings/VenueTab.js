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
    <div className="max-w-none lg:max-w-2xl">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Venue Settings</h2>
        <p className="text-gray-600 text-sm">Manage your venue information and settings.</p>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {/* Venue Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
          />
        </div>

        {/* Table Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Table Count</label>
          <input
            type="number"
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
          />
        </div>

        {/* Address Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <div className="space-y-3">
            {/* Address Line 1 */}
            <input
              type="text"
              placeholder="Address Line 1"
              value={address.line1}
              onChange={(e) => setAddress({...address, line1: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            />
            
            {/* Address Line 2 */}
            <input
              type="text"
              placeholder="Address Line 2"
              value={address.line2}
              onChange={(e) => setAddress({...address, line2: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            />
            
            {/* City and Postal Code - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        {/* Review Links Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Review Links</label>
          <div className="space-y-3">
            <div>
              <input
                type="url"
                placeholder="Tripadvisor Link"
                value={tripadvisorLink}
                onChange={(e) => setTripadvisorLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Link to your Tripadvisor page</p>
            </div>
            
            <div>
              <input
                type="url"
                placeholder="Google Review Link"
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Link to your Google Reviews</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`text-sm p-3 rounded-md ${
            message.includes('success') 
              ? 'text-green-700 bg-green-50 border border-green-200' 
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueTab;