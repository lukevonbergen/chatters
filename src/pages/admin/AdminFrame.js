// /pages/admin/AdminFrame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const AdminFrame = ({ children }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: '', role: null });
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        navigate('/signin', { replace: true });
        return;
      }

      const email = (user.email || '').toLowerCase();
      const { data: userRow, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!mounted) return;

      const role = userRow?.role ?? null;
      const isAdminByRole = role === 'admin';
      const isAdminByDomain = email.endsWith('@getchatters.com');

      if (!isAdminByRole && !isAdminByDomain) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setUserInfo({ email, role: role || (isAdminByDomain ? 'admin' : null) });
      setLoading(false);
    };

    fetchUser();
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin', { replace: true });
  };

  if (loading) {
    return <div className="p-6">Loading admin…</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header with Logout */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{userInfo.email}</span>
              <span className="mx-2">•</span>
              <span className="text-blue-600 font-medium">{userInfo.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content - let the dashboard handle its own layout */}
      {children}
    </div>
  );
};

export default AdminFrame;
