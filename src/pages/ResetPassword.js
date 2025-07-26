import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabase';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleRecovery = async () => {
      const { error } = await supabase.auth.getSessionFromUrl();
      if (error) {
        setError('The reset link is invalid or has expired.');
        setTimeout(() => navigate('/forgot-password'), 3000);
        return;
      }

      window.history.replaceState({}, document.title, window.location.pathname); // Optional: clean up hash
      setSessionReady(true);
      setIsLoading(false);
    };

    handleRecovery();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);

      setMessage('Password successfully reset! Redirecting...');
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to homepage</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center space-x-2 bg-white/50 px-4 py-1 rounded-full border border-emerald-100">
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Reset</span>
              <span className="text-sm text-gray-600">Set a new password</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Reset Password</h2>
            <p className="text-gray-600 mb-8">Enter a new password for your account.</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          {message && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm">{message}</div>}

          {sessionReady && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? <span>Resetting...</span> : (<><span>Reset Password</span><ArrowRight className="h-4 w-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
