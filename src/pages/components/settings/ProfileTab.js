import React from 'react';

const ProfileTab = ({ 
  firstName, setFirstName,
  lastName, setLastName,
  email, setEmail,
  saveSettings,
  loading,
  message 
}) => {
  return (
    <div className="max-w-none lg:max-w-2xl">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Profile</h2>
        <p className="text-gray-600 text-sm">This is how others will see you on the site.</p>
      </div>

      <div className="space-y-4 lg:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          {/* Responsive grid - stacks on mobile, side-by-side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <input
                type="text"
                placeholder="First"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">You can manage verified email addresses in your email settings.</p>
        </div>

        {/* Button with responsive sizing */}
        <div className="pt-2">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update profile'}
          </button>
        </div>

        {message && (
          <div className={`text-sm mt-2 p-3 rounded-md ${
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

export default ProfileTab;