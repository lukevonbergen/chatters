import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { getMarketingUrl } from '../../utils/domainUtils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        console.error('Password reset error:', error);
        throw new Error(error.message || 'Failed to send password reset email');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setMessage('Password reset link sent to your email. Check your inbox (and spam folder)!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Layout - Dark theme */}
      <div className="lg:hidden w-full bg-gray-900 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-6">
          <a
            href={getMarketingUrl()}
            className="text-gray-300 hover:text-white flex items-center transition-colors text-sm font-medium"
          >
            <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
            Back to website
          </a>
        </div>
        
        {/* Mobile Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={getMarketingUrl('/img/Logo.svg')}
            alt="Chatters Logo"
            className="h-8 w-auto filter invert brightness-0 invert"
          />
        </div>

        {/* Mobile Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 text-center">
                Forgot Password?
              </h2>
              <p className="text-gray-300 text-center text-sm">
                Enter your email to receive a reset link
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 text-green-400 rounded-lg text-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="email-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email-mobile"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Full screen split */}
      <div className="hidden lg:flex w-full min-h-screen">
        {/* Left Panel - Brand with gradient background */}
        <div className="w-1/2 bg-gradient-to-br from-blue-100 via-green-100 via-orange-100 to-purple-100 p-12 flex flex-col justify-center relative">
          <div className="absolute top-8 left-8 z-10">
            <a
              href={getMarketingUrl()}
              className="text-gray-700 hover:text-gray-900 flex items-center transition-colors text-sm font-medium"
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
              Back to website
            </a>
          </div>

          <div className="max-w-lg mx-auto w-full">
            <div className="mb-12">
              <div className="flex items-center mb-8">
                <img
                  src={getMarketingUrl('/img/Logo.svg')}
                  alt="Chatters Logo"
                  className="h-10 w-auto"
                />
              </div>

              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Forgot your password?
                </h1>
                <p className="text-gray-700 text-xl leading-relaxed">
                  No worries! Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center text-gray-700 text-lg">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
                <span>Secure password reset process</span>
              </div>
              <div className="flex items-center text-gray-700 text-lg">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
                <span>Link expires in 1 hour for security</span>
              </div>
              <div className="flex items-center text-gray-700 text-lg">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
                <span>Back to your dashboard quickly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Black Form */}
        <div className="w-1/2 bg-black p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-300 text-sm">
                  Enter your email to receive a reset link
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 text-green-400 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4 lg:space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ForgotPassword;
