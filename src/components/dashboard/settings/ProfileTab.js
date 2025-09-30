import React, { useState } from 'react';
import { supabase } from '../../../utils/supabase';

const ProfileTab = ({ 
  firstName, setFirstName,
  lastName, setLastName,
  email, setEmail,
  venueId
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const saveSettings = async () => {
    if (!venueId) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      // Get current user ID
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Update users table (profile data)
      const userUpdates = {
        first_name: firstName,
        last_name: lastName,
      };

      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', userId);

      if (userError) {
        throw userError;
      }

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-none lg:max-w-2xl">

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
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed text-sm lg:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">Email changes require verification and must be done through your account security settings.</p>
        </div>

        {/* Button with responsive sizing */}
        <div className="pt-2">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full sm:w-auto bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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