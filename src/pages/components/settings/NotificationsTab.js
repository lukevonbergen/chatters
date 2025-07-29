import React, { useState } from 'react';

const NotificationsTab = ({ 
  saveSettings,
  loading,
  message 
}) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Notifications</h2>
        <p className="text-gray-600 text-sm">Manage your notification preferences. This does NOT do anything at the moment</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
            <p className="text-xs text-gray-500">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-700">SMS Notifications</h3>
            <p className="text-xs text-gray-500">Receive notifications via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Push Notifications</h3>
            <p className="text-xs text-gray-500">Receive browser push notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Notification Settings
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  These settings control how you receive alerts about feedback and important venue updates.
                </p>
              </div>
            </div>
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

export default NotificationsTab;