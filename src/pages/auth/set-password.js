// File: /pages/set-password.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

const SetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove '#'
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setStatus('Invalid or missing token.');
      setLoading(false);
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setStatus('Token session failed.');
        } else {
          setStatus('');
        }
        setLoading(false);
      });
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }

    setStatus('Saving...');
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('Password updated! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  if (loading) return <div className="p-4">Validating token...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Set Your Password</h2>
        {status && <p className="mb-4 text-sm text-gray-700">{status}</p>}
        <form onSubmit={handleSetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full border px-3 py-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordPage;
