// src/pages/SignIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { getMarketingUrl } from '../../utils/domainUtils';

// Ensures there's a row in public.users so role checks don't fail on first login.
// Adjust the inserted default role if you prefer something else.
async function ensureUsersRow(user) {
  // Try to read existing row
  const { data, error, status } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!error && data) return data;

  // If not found or blocked by RLS, attempt to create a minimal row.
  // Requires an INSERT policy (or do this via your admin API).
  const { data: inserted, error: insertErr } = await supabase
    .from('users')
    .insert([{ id: user.id, email: user.email, role: 'master' }]) // default role you want
    .select('id, role')
    .single();

  if (insertErr) {
    // If insert fails due to RLS, we’ll fall back to email-domain admin check later.
    // Surface the error for observability but don't throw to avoid blocking login.
    console.warn('[SignIn] ensureUsersRow insert failed:', insertErr);
    return { id: user.id, role: null };
  }

  return inserted;
}

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('chatters_remember_email');
    const rememberMeEnabled = localStorage.getItem('chatters_remember_me') === 'true';
    
    if (rememberMeEnabled && rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 🔑 1) Store remember me preference + email
      if (rememberMe) {
        localStorage.setItem('chatters_remember_email', email);
        localStorage.setItem('chatters_remember_me', 'true');
      } else {
        localStorage.removeItem('chatters_remember_email');
        localStorage.removeItem('chatters_remember_me');
      }

      // 2) Attempt sign in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInErr) throw new Error(signInErr.message);

      // 3) Get user
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('No authenticated user returned');

      // 4) Ensure users row exists, then read role
      const ensured = await ensureUsersRow(user);
      const role = ensured?.role ?? null;

      // 5) Admin fallback by email domain
      const isAdminByEmail = (user.email || '').toLowerCase().endsWith('@getchatters.com');
      const isAdmin = role === 'admin' || isAdminByEmail;

      // 6) If remember me is NOT checked, set up a session that expires when browser closes
      // We do this by storing a flag that App.js will check on load
      if (!rememberMe) {
        sessionStorage.setItem('chatters_temp_session', 'true');
      }

      // 7) Route to dashboard/admin
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 via-orange-100 to-purple-100 flex items-center justify-center p-4 sm:p-6">
      {/* Mobile Layout - Dark theme with spacing */}
      <div className="lg:hidden w-full bg-gray-900 rounded-2xl shadow-2xl flex flex-col min-h-[80vh] my-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-6">
          <a
            href={getMarketingUrl()}
            className="text-gray-300 hover:text-white flex items-center transition-colors text-sm"
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
                Login to your account
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
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

              <div>
                <label htmlFor="password-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-mobile"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-mobile"
                    name="remember-mobile"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-white focus:ring-white border-gray-600 bg-gray-800 rounded"
                  />
                  <label htmlFor="remember-mobile" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-white hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
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
                href={getMarketingUrl()}
                className="text-gray-600 hover:text-gray-900 flex items-center transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                Back to website
              </a>
            </div>

            <div className="mb-6 lg:mb-8 mt-12 sm:mt-8 lg:mt-0">
              <div className="flex items-center mb-4 lg:mb-6">
                <img
                  src={getMarketingUrl('/img/Logo.svg')}
                  alt="Chatters Logo"
                  className="h-6 sm:h-8 w-auto"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
                  Get access to real-time customer insights
                </h1>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  Transform your customer feedback into actionable insights. Monitor satisfaction in real-time and prevent negative reviews before they happen.
                </p>
              </div>
            </div>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center text-gray-600 text-sm lg:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Real-time feedback monitoring</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm lg:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Custom branded QR codes</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm lg:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Analytics dashboard</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full lg:w-1/2 bg-gray-900 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Login to your account
                </h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4 lg:space-y-6">
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

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-white focus:ring-white border-gray-600 bg-gray-800 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-sm font-medium text-white hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              {/* Optional: small note for first-time admin setup */}
              {/* <p className="mt-4 text-xs text-gray-400">
                If you’re an internal user, make sure your email ends with @getchatters.com or your user role is set to admin.
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
