import React, { useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { getDashboardUrl } from '../../../utils/domainUtils';

const ProfileTab = ({
  firstName, setFirstName,
  lastName, setLastName,
  email, setEmail,
  venueId
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeMessage, setEmailChangeMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showEmailChange, setShowEmailChange] = useState(false);

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

  const sendPasswordResetEmail = async () => {
    setPasswordResetLoading(true);
    setPasswordResetMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      setPasswordResetMessage('Password reset email sent! Please check your inbox (and spam folder).');
    } catch (error) {
      console.error('Error sending password reset:', error);
      setPasswordResetMessage(`Error: ${error.message}`);
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const sendEmailChangeVerification = async () => {
    if (!newEmail || !newEmail.trim()) {
      setEmailChangeMessage('Please enter a new email address');
      return;
    }

    if (newEmail.toLowerCase() === email.toLowerCase()) {
      setEmailChangeMessage('New email must be different from current email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailChangeMessage('Please enter a valid email address');
      return;
    }

    setEmailChangeLoading(true);
    setEmailChangeMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('send-email-change', {
        body: { currentEmail: email, newEmail: newEmail }
      });

      if (error) {
        console.error('Email change error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setEmailChangeMessage(`Verification email sent to ${newEmail}! Please check your inbox to confirm the change.`);
      setNewEmail('');
      setShowEmailChange(false);
    } catch (error) {
      console.error('Error sending email change:', error);
      setEmailChangeMessage(`Error: ${error.message}`);
    } finally {
      setEmailChangeLoading(false);
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
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@example.com"
              value={email}
              disabled
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed text-sm lg:text-base"
            />
            <button
              onClick={() => setShowEmailChange(!showEmailChange)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Change Email
            </button>
          </div>

          {showEmailChange && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md space-y-3">
              <p className="text-sm text-blue-900 font-medium">Enter your new email address</p>
              <p className="text-xs text-blue-700">
                We'll send a verification link to the new email address. Your current email will remain active until you verify the new one.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="new@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={sendEmailChangeVerification}
                  disabled={emailChangeLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {emailChangeLoading ? 'Sending...' : 'Send Verification'}
                </button>
              </div>
              <button
                onClick={() => {
                  setShowEmailChange(false);
                  setNewEmail('');
                  setEmailChangeMessage('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          )}

          {emailChangeMessage && (
            <div className={`text-sm mt-2 p-3 rounded-md ${
              emailChangeMessage.includes('sent') || emailChangeMessage.includes('Verification')
                ? 'text-green-700 bg-green-50 border border-green-200'
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}>
              {emailChangeMessage}
            </div>
          )}
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

      {/* Password Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <p className="text-sm text-gray-600 mb-3">
              For security reasons, we'll send you an email with a link to reset your password.
            </p>
            <button
              onClick={sendPasswordResetEmail}
              disabled={passwordResetLoading}
              className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordResetLoading ? 'Sending...' : 'Send password reset email'}
            </button>
          </div>

          {passwordResetMessage && (
            <div className={`text-sm p-3 rounded-md ${
              passwordResetMessage.includes('sent')
                ? 'text-green-700 bg-green-50 border border-green-200'
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}>
              {passwordResetMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;