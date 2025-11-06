import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmailChange = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmailChange(token);
  }, [searchParams]);

  const verifyEmailChange = async (token) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your new email address...');

      // Validate the token and get the email change request
      const { data: request, error: fetchError } = await supabase
        .from('email_change_requests')
        .select('*')
        .eq('token', token)
        .single();

      if (fetchError || !request) {
        setStatus('error');
        setMessage('Invalid or expired verification link.');
        return;
      }

      // Check if already verified
      if (request.verified) {
        setStatus('error');
        setMessage('This email change has already been verified.');
        return;
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(request.expires_at);
      if (now > expiresAt) {
        setStatus('expired');
        setMessage('This verification link has expired. Please request a new email change.');
        return;
      }

      setNewEmail(request.new_email);

      // Update the user's email in both auth.users and users table
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        request.user_id,
        { email: request.new_email }
      );

      if (updateAuthError) {
        // If admin update fails, try using service role directly via edge function
        const { data, error: edgeFunctionError } = await supabase.functions.invoke('verify-email-change', {
          body: { token }
        });

        if (edgeFunctionError) {
          console.error('Error updating email:', edgeFunctionError);
          setStatus('error');
          setMessage('Failed to update email address. Please contact support.');
          return;
        }

        if (!data.success) {
          setStatus('error');
          setMessage(data.error || 'Failed to update email address.');
          return;
        }
      } else {
        // Also update the users table
        const { error: updateUsersError } = await supabase
          .from('users')
          .update({ email: request.new_email })
          .eq('id', request.user_id);

        if (updateUsersError) {
          console.error('Error updating users table:', updateUsersError);
        }

        // Mark the request as verified
        const { error: markVerifiedError } = await supabase
          .from('email_change_requests')
          .update({
            verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('token', token);

        if (markVerifiedError) {
          console.error('Error marking request as verified:', markVerifiedError);
        }
      }

      setStatus('success');
      setMessage('Your email address has been successfully updated!');

      // Redirect to account profile after 3 seconds
      setTimeout(() => {
        navigate('/account/profile');
      }, 3000);

    } catch (error) {
      console.error('Error in verifyEmailChange:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Layout */}
      <div className="lg:hidden w-full bg-gray-900 flex flex-col min-h-screen">
        <div className="flex justify-center pt-12 mb-8">
          <img
            src="/img/Logo.svg"
            alt="Chatters Logo"
            className="h-8 w-auto filter invert brightness-0 invert"
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-sm">
            <div className="text-center">
              {/* Status Icon */}
              <div className="mb-6">
                {status === 'verifying' && (
                  <Loader className="w-16 h-16 text-white mx-auto animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                )}
                {(status === 'error' || status === 'expired') && (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-4">
                {status === 'verifying' && 'Verifying Email...'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
                {status === 'expired' && 'Link Expired'}
              </h1>

              {/* Message */}
              <p className="text-gray-300 mb-6">
                {message}
              </p>

              {status === 'success' && newEmail && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-400">
                    Your new email address is now:
                  </p>
                  <p className="text-green-300 font-semibold mt-1">
                    {newEmail}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {status === 'success' && (
                  <>
                    <p className="text-sm text-gray-400">
                      Redirecting you to your account profile in a few seconds...
                    </p>
                    <button
                      onClick={() => navigate('/account/profile')}
                      className="w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Go to Account Profile
                    </button>
                  </>
                )}

                {(status === 'error' || status === 'expired') && (
                  <>
                    <button
                      onClick={() => navigate('/account/profile')}
                      className="w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Back to Account Settings
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </>
                )}

                {status === 'verifying' && (
                  <p className="text-sm text-gray-400">
                    Please wait while we verify your email address...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Full screen split */}
      <div className="hidden lg:flex w-full min-h-screen">
        {/* Left Panel - Brand with gradient background */}
        <div className="w-1/2 bg-gradient-to-br from-blue-100 via-green-100 via-orange-100 to-purple-100 p-12 flex flex-col justify-center">
          <div className="max-w-xl">
            <div className="mb-8">
              <img
                src="/img/Logo.svg"
                alt="Chatters Logo"
                className="h-8 w-auto mb-12"
              />
            </div>

            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Email Verification
              </h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                We're verifying your new email address to keep your account secure.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Secure email verification</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Encrypted data protection</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Instant account updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Black background with verification status */}
        <div className="w-1/2 bg-black p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center">
              {/* Status Icon */}
              <div className="mb-8">
                {status === 'verifying' && (
                  <Loader className="w-20 h-20 text-white mx-auto animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                )}
                {(status === 'error' || status === 'expired') && (
                  <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                )}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white mb-4">
                {status === 'verifying' && 'Verifying Email...'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
                {status === 'expired' && 'Link Expired'}
              </h2>

              {/* Message */}
              <p className="text-gray-300 mb-8">
                {message}
              </p>

              {status === 'success' && newEmail && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-8">
                  <p className="text-sm text-green-400">
                    Your new email address is now:
                  </p>
                  <p className="text-green-300 font-semibold mt-1">
                    {newEmail}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {status === 'success' && (
                  <>
                    <p className="text-sm text-gray-400 mb-6">
                      Redirecting you to your account profile in a few seconds...
                    </p>
                    <button
                      onClick={() => navigate('/account/profile')}
                      className="w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Go to Account Profile
                    </button>
                  </>
                )}

                {(status === 'error' || status === 'expired') && (
                  <>
                    <button
                      onClick={() => navigate('/account/profile')}
                      className="w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Back to Account Settings
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </>
                )}

                {status === 'verifying' && (
                  <p className="text-sm text-gray-400">
                    Please wait while we verify your email address...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailChange;
