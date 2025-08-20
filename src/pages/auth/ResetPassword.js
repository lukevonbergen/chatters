import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formReady, setFormReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const runRecovery = async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error('[ResetPassword] setSession error:', error.message);
          setError('Invalid or expired reset link.');
          setTimeout(() => navigate('/forgot-password'), 3000);
        } else {
          console.log('[ResetPassword] Session set via recovery link');
          setFormReady(true);
        }
      } else {
        setError('Invalid password reset link.');
        setTimeout(() => navigate('/forgot-password'), 3000);
      }

      setIsLoading(false);
    };

    runRecovery();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('[ResetPassword] Password update error:', error.message);
        setError('Failed to reset password. Please try again.');
      } else {
        setMessage('Password successfully reset! Redirecting...');
        setTimeout(() => navigate('/signin'), 2000);
      }
    } catch (err) {
      console.error('[ResetPassword] Unexpected error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 via-orange-100 to-purple-100 flex items-center justify-center p-4 sm:p-6">
      {/* Mobile Layout - Dark theme with spacing */}
      <div className="lg:hidden w-full bg-gray-900 rounded-2xl shadow-2xl flex flex-col min-h-[80vh] my-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-6">
          <a
            href="https://www.getchatters.com"
            className="text-gray-300 hover:text-white flex items-center transition-colors text-sm"
          >
            <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
            Back to website
          </a>
        </div>
        
        {/* Mobile Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://www.getchatters.com/img/Logo.svg"
            alt="Chatters Logo"
            className="h-8 w-auto filter invert brightness-0 invert"
          />
        </div>

        {/* Mobile Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 text-center">
                Reset Password
              </h2>
              <p className="text-gray-300 text-center text-sm">
                Enter a new password for your account
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

            {!isLoading && formReady && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password-mobile"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword-mobile"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-3 text-white">Validating reset link...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original design */}
      <div className="hidden lg:block w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Panel - Brand */}
          <div className="w-full lg:w-1/2 bg-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative">
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
              <a
                href="https://www.getchatters.com"
                className="text-gray-600 hover:text-gray-900 flex items-center transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                Back to website
              </a>
            </div>

            <div className="mb-6 lg:mb-8 mt-12 sm:mt-8 lg:mt-0">
              <div className="flex items-center mb-4 lg:mb-6">
                <img
                  src="https://www.getchatters.com/img/Logo.svg"
                  alt="Chatters Logo"
                  className="h-6 sm:h-8 w-auto"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
                  Reset your password
                </h1>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  Enter a new password for your account and regain access to your feedback management dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center text-gray-600 text-sm lg:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Secure password reset process</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm lg:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Encrypted data protection</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm lg:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Quick access restoration</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full lg:w-1/2 bg-gray-900 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-300 text-sm">
                  Enter a new password for your account
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

              {!isLoading && formReady && (
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                  <span className="ml-3 text-white">Validating reset link...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;