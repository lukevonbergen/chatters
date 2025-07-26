import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabase';

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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://my.getchatters.com/reset-password',
      });

      if (error) throw new Error(error.message);
      setMessage('Password reset link sent to your email. Check your inbox!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 flex items-center justify-center p-4">
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
              <span className="text-sm text-gray-600">Forgot your password?</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Reset Password</h2>
            <p className="text-gray-600 mb-8">Enter your email address, and we'll send you a link to reset your password.</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          {message && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm">{message}</div>}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? <span>Sending...</span> : (<><span>Send Reset Link</span><ArrowRight className="h-4 w-4" /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
